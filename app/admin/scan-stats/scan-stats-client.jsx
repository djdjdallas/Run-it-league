"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  Camera,
  FileImage,
  FileText,
  Loader2,
  X,
  Check,
  TrendingUp,
  ArrowRight,
  AlertCircle,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { finalizeGameFromStats } from "@/lib/game-finalize"

// A match only counts as verified when the extracted NAME lines up with a
// roster name. A jersey-number hit alone can't verify identity (numbers
// repeat across teams and misreads are common), so it never confirms a row.
function matchExtractedToRoster(extracted, roster) {
  const extractedName = (extracted?.name || "").toLowerCase().trim()
  if (!extractedName) return null
  for (const p of roster) {
    const rosterName = (p.name || "").toLowerCase().trim()
    if (!rosterName) continue
    if (
      rosterName === extractedName ||
      rosterName.includes(extractedName) ||
      extractedName.includes(rosterName)
    ) {
      return { player: p, exact: rosterName === extractedName }
    }
  }
  return null
}

const CORE_STAT_FIELDS = [
  "points",
  "rebounds",
  "assists",
  "steals",
  "turnovers",
  "fg_made",
  "fg_attempted",
  "three_made",
  "three_attempted",
]

// A row with no readable stat must never reach the database — upserting it
// would overwrite any existing stats for that player with zeros.
function hasVerifiableStats(extracted) {
  return CORE_STAT_FIELDS.some((f) => typeof extracted?.[f] === "number")
}

function numberOnRoster(extracted, roster) {
  return (
    extracted?.number != null &&
    roster.some((p) => p.number === extracted.number)
  )
}

function buildStatRow(gameId, teamId, playerId, extracted) {
  return {
    game_id: gameId,
    player_id: playerId,
    team_id: teamId,
    minutes: extracted.minutes || 0,
    points: extracted.points || 0,
    rebounds: extracted.rebounds || 0,
    assists: extracted.assists || 0,
    steals: extracted.steals || 0,
    blocks: extracted.blocks || 0,
    turnovers: extracted.turnovers || 0,
    fouls: extracted.fouls || 0,
    fg_made: extracted.fg_made || 0,
    fg_attempted: extracted.fg_attempted || 0,
    three_made: extracted.three_made || 0,
    three_attempted: extracted.three_attempted || 0,
    ft_made: extracted.ft_made || 0,
    ft_attempted: extracted.ft_attempted || 0,
  }
}

export default function ScanStatsClient({ games }) {
  const router = useRouter()
  const cameraRef = useRef(null)
  const fileRef = useRef(null)

  const [selectedGameId, setSelectedGameId] = useState("")
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const selectedGame = games.find((g) => g.id === selectedGameId)

  const handleFile = (f) => {
    if (!f) return
    const isImage = f.type.startsWith("image/")
    const isPdf = f.type === "application/pdf"
    if (!isImage && !isPdf) {
      setError("Please select an image or PDF file")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB")
      return
    }
    setFile(f)
    setError(null)
    setResult(null)
    if (isImage) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(f)
    } else {
      // PDF — skip image preview, just show file metadata
      setPreview(null)
    }
  }

  const clearImage = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (cameraRef.current) cameraRef.current.value = ""
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleScan = async () => {
    if (!file || !selectedGame) return
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // 1. Fetch both rosters
      const [homeRes, awayRes] = await Promise.all([
        supabase
          .from("players")
          .select("*")
          .eq("team_id", selectedGame.home_team_id)
          .eq("is_active", true),
        supabase
          .from("players")
          .select("*")
          .eq("team_id", selectedGame.away_team_id)
          .eq("is_active", true),
      ])
      const homeRoster = homeRes.data || []
      const awayRoster = awayRes.data || []

      // 2. Base64 encode image
      const reader = new FileReader()
      const base64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result.split(",")[1])
        reader.readAsDataURL(file)
      })

      // 3. Call scan API
      const res = await fetch("/api/scan-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: file.type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to scan")

      // 4. Upload image to storage (best-effort)
      let imageUrl = null
      try {
        const ext = file.name?.split(".").pop() || "jpg"
        const fileName = `stat-sheets/${selectedGame.id}-${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from("images")
          .upload(fileName, file, { contentType: file.type || "image/jpeg" })
        if (!upErr) {
          const { data: urlData } = supabase.storage
            .from("images")
            .getPublicUrl(fileName)
          imageUrl = urlData.publicUrl
        }
      } catch (e) {
        console.error("Upload failed (non-fatal):", e)
      }

      // 5. Match extracted players to rosters.
      // Stat sheet is one team per page, so we try BOTH rosters per extracted
      // player and route to whichever matches.
      const allExtracted = [
        ...(data.stats?.home_team?.players || []),
        ...(data.stats?.away_team?.players || []),
      ]
      const homeMatches = []
      const awayMatches = []
      const homeUnmatched = []
      const awayUnmatched = []
      const usedHomeIds = new Set()
      const usedAwayIds = new Set()

      // Gate: a row only confirms as an entry when its identity is verified
      // by name against exactly one roster AND it carries readable stats.
      // Anything unverifiable is quarantined with a reason and never saved.
      allExtracted.forEach((p) => {
        if (!hasVerifiableStats(p)) {
          homeUnmatched.push({
            ...p,
            gate_reason:
              "No readable stats on this row — nothing verifiable to save",
          })
          return
        }

        const homeMatch = matchExtractedToRoster(p, homeRoster)
        const awayMatch = matchExtractedToRoster(p, awayRoster)
        const homeFree = homeMatch && !usedHomeIds.has(homeMatch.player.id)
        const awayFree = awayMatch && !usedAwayIds.has(awayMatch.player.id)

        if (homeFree && awayFree) {
          // Name matches players on BOTH rosters — only an exact match on
          // exactly one side resolves it; otherwise it stays unconfirmed.
          if (homeMatch.exact && !awayMatch.exact) {
            homeMatches.push({ player: homeMatch.player, extracted: p })
            usedHomeIds.add(homeMatch.player.id)
          } else if (awayMatch.exact && !homeMatch.exact) {
            awayMatches.push({ player: awayMatch.player, extracted: p })
            usedAwayIds.add(awayMatch.player.id)
          } else {
            homeUnmatched.push({
              ...p,
              gate_reason:
                "Name matches players on both rosters — assign manually",
            })
          }
        } else if (homeFree) {
          homeMatches.push({ player: homeMatch.player, extracted: p })
          usedHomeIds.add(homeMatch.player.id)
        } else if (awayFree) {
          awayMatches.push({ player: awayMatch.player, extracted: p })
          usedAwayIds.add(awayMatch.player.id)
        } else if (homeMatch || awayMatch) {
          homeUnmatched.push({
            ...p,
            gate_reason:
              "Another row already matched this player — resolve manually",
          })
        } else if (
          numberOnRoster(p, homeRoster) ||
          numberOnRoster(p, awayRoster)
        ) {
          homeUnmatched.push({
            ...p,
            gate_reason:
              "Jersey number found on a roster but the name couldn't be verified — assign manually",
          })
        } else {
          homeUnmatched.push({
            ...p,
            gate_reason: "No roster match",
          })
        }
      })

      setResult({
        stats: data.stats,
        imageUrl,
        homeMatches,
        homeUnmatched,
        awayMatches,
        awayUnmatched,
      })
    } catch (err) {
      setError(err.message || "Failed to scan stats")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result || !selectedGame) return
    setSaving(true)

    const supabase = createClient()
    const rows = [
      ...result.homeMatches.map(({ player, extracted }) =>
        buildStatRow(selectedGame.id, selectedGame.home_team_id, player.id, extracted)
      ),
      ...result.awayMatches.map(({ player, extracted }) =>
        buildStatRow(selectedGame.id, selectedGame.away_team_id, player.id, extracted)
      ),
    ]

    if (rows.length === 0) {
      setError("No players could be matched — open the full editor to enter manually.")
      setSaving(false)
      return
    }

    const { error: statsError } = await supabase
      .from("player_stats")
      .upsert(rows, { onConflict: "game_id,player_id" })

    if (statsError) {
      setError("Failed to save stats: " + statsError.message)
      setSaving(false)
      return
    }

    if (result.imageUrl) {
      await supabase
        .from("games")
        .update({ stat_sheet_url: result.imageUrl })
        .eq("id", selectedGame.id)
    }

    // Roll the saved stats up into the game score, mark it final, and
    // refresh both teams' win/loss records
    await finalizeGameFromStats(supabase, selectedGame)

    router.push(`/admin/games/${selectedGame.id}/stats`)
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Scan Stats</h1>
        <p className="text-muted-foreground mt-2">
          Snap a photo of a handwritten stat sheet, pick the game, and save
          stats in one go.
        </p>
      </div>

      {/* Step 1: Game picker */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">1. Which game?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="game">Game</Label>
            <Select
              id="game"
              value={selectedGameId}
              onChange={(e) => {
                setSelectedGameId(e.target.value)
                setResult(null)
              }}
            >
              <option value="">Select a game...</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.away_team?.name || "Away"} @ {g.home_team?.name || "Home"}{" "}
                  — {formatDate(g.game_date)}
                </option>
              ))}
            </Select>
            {selectedGame && (
              <p className="text-xs text-muted-foreground mt-2">
                Stats will be matched against{" "}
                <strong>{selectedGame.home_team?.name}</strong> and{" "}
                <strong>{selectedGame.away_team?.name}</strong> rosters by
                player name or jersey number.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Photo */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">2. Stat sheet photo</CardTitle>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Camera className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Take a photo or choose a file — JPG, PNG, HEIC, or PDF (up to 10MB)
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  onClick={() => cameraRef.current?.click()}
                  disabled={!selectedGame}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={!selectedGame}
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={cameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>
              {!selectedGame && (
                <p className="text-xs text-muted-foreground mt-4">
                  Pick a game first.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                {preview ? (
                  <img
                    src={preview}
                    alt="Stat sheet"
                    className="w-full rounded-lg border max-h-[500px] object-contain bg-muted"
                  />
                ) : (
                  <div className="w-full rounded-lg border bg-muted p-8 flex items-center gap-4">
                    <FileText className="h-10 w-10 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        PDF — {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleScan}
                disabled={loading || saving}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning with Claude...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Extract Stats with AI
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Review */}
      {result && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">3. Review matches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TeamPreview
              label={`${selectedGame.home_team?.name} (Home)`}
              matches={result.homeMatches}
              unmatched={result.homeUnmatched}
            />
            <TeamPreview
              label={`${selectedGame.away_team?.name} (Away)`}
              matches={result.awayMatches}
              unmatched={result.awayUnmatched}
            />

            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={
                  saving ||
                  result.homeMatches.length + result.awayMatches.length === 0
                }
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save & Open Full Editor
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/admin/games/${selectedGame.id}/stats`)
                }
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Skip save — open editor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TeamPreview({ label, matches, unmatched }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{label}</h3>
      {matches.length === 0 && unmatched.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No players extracted.
        </p>
      )}
      {matches.length > 0 && (
        <div className="space-y-1 mb-2">
          {matches.map(({ player, extracted }) => (
            <div
              key={player.id}
              className="flex justify-between items-center p-2 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-200"
            >
              <span className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-400" />
                #{player.number} {player.name}
              </span>
              <span className="font-mono text-xs text-green-300/80">
                {extracted.points || 0} pts / {extracted.rebounds || 0} reb /{" "}
                {extracted.assists || 0} ast
              </span>
            </div>
          ))}
        </div>
      )}
      {unmatched.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            These rows couldn&apos;t be verified, so they will NOT be saved —
            enter them manually in the full editor:
          </p>
          {unmatched.map((p, i) => (
            <div
              key={i}
              className="flex justify-between items-start p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-200"
            >
              <div className="min-w-0">
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-yellow-400 shrink-0" />
                  {p.number != null ? `#${p.number} ` : ""}
                  {p.name || "(no name)"}
                </span>
                {p.gate_reason && (
                  <p className="text-xs text-yellow-300/70 mt-1 ml-5">
                    {p.gate_reason}
                  </p>
                )}
              </div>
              <span className="font-mono text-xs text-yellow-300/80 shrink-0 ml-2">
                {p.points ?? "—"} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
