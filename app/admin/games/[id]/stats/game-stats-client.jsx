"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatScanner } from "@/components/stat-scanner"
import { ArrowLeft, Save, Check, Loader2 } from "lucide-react"
import { formatDate, calculatePercentage } from "@/lib/utils"

export default function GameStatsClient({
  game,
  homeTeam,
  awayTeam,
  homeRoster,
  awayRoster,
  existingStats,
}) {
  const router = useRouter()
  const [homeStats, setHomeStats] = useState({})
  const [awayStats, setAwayStats] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [scannedImage, setScannedImage] = useState(null)
  const [scannedImageUrl, setScannedImageUrl] = useState(game?.stat_sheet_url || null)
  const [activeTab, setActiveTab] = useState("manual")

  const createEmptyStat = (playerId) => ({
    player_id: playerId,
    minutes: 0,
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
    fg_made: 0,
    fg_attempted: 0,
    three_made: 0,
    three_attempted: 0,
    ft_made: 0,
    ft_attempted: 0,
  })

  useEffect(() => {
    // Initialize stats from existing data
    const homeExisting = {}
    const awayExisting = {}

    existingStats.forEach((stat) => {
      if (stat.team_id === game.home_team_id) {
        homeExisting[stat.player_id] = stat
      } else {
        awayExisting[stat.player_id] = stat
      }
    })

    const initHomeStats = {}
    homeRoster.forEach((p) => {
      initHomeStats[p.id] = homeExisting[p.id] || createEmptyStat(p.id)
    })
    setHomeStats(initHomeStats)

    const initAwayStats = {}
    awayRoster.forEach((p) => {
      initAwayStats[p.id] = awayExisting[p.id] || createEmptyStat(p.id)
    })
    setAwayStats(initAwayStats)
  }, [game, homeRoster, awayRoster, existingStats])

  const updateStat = (isHome, playerId, field, value) => {
    const numValue = parseInt(value) || 0
    if (isHome) {
      setHomeStats((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          [field]: numValue,
        },
      }))
    } else {
      setAwayStats((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          [field]: numValue,
        },
      }))
    }
    setSaved(false)
  }

  const handleStatsExtracted = (extractedStats, imagePreview, uploadedUrl) => {
    setScannedImage(imagePreview)
    if (uploadedUrl) setScannedImageUrl(uploadedUrl)
    setActiveTab("review")

    // Stat sheet is one team per page; the AI returns all extracted players
    // under home_team.players. Try each player against BOTH rosters and route
    // to whichever has a match.
    const allExtracted = [
      ...(extractedStats.home_team?.players || []),
      ...(extractedStats.away_team?.players || []),
    ]

    const matchPlayer = (extracted, roster) => {
      const extractedName = (extracted.name || "").toLowerCase().trim()
      if (!extractedName && extracted.number == null) return null
      return roster.find((p) => {
        const rosterName = (p.name || "").toLowerCase().trim()
        if (!rosterName) return false
        return (
          (extractedName && (rosterName === extractedName ||
            rosterName.includes(extractedName) ||
            extractedName.includes(rosterName))) ||
          (extracted.number != null && p.number === extracted.number)
        )
      }) || null
    }

    const toStatRow = (matchId, extracted) => ({
      ...createEmptyStat(matchId),
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
    })

    const newHomeStats = { ...homeStats }
    const newAwayStats = { ...awayStats }

    allExtracted.forEach((extracted) => {
      const homeMatch = matchPlayer(extracted, homeRoster)
      const awayMatch = matchPlayer(extracted, awayRoster)
      if (homeMatch && !awayMatch) {
        newHomeStats[homeMatch.id] = toStatRow(homeMatch.id, extracted)
      } else if (awayMatch && !homeMatch) {
        newAwayStats[awayMatch.id] = toStatRow(awayMatch.id, extracted)
      } else if (homeMatch && awayMatch) {
        // Ambiguous — prefer the side whose name matches exactly.
        const ext = (extracted.name || "").toLowerCase().trim()
        const homeExact = (homeMatch.name || "").toLowerCase().trim() === ext
        const awayExact = (awayMatch.name || "").toLowerCase().trim() === ext
        if (awayExact && !homeExact) {
          newAwayStats[awayMatch.id] = toStatRow(awayMatch.id, extracted)
        } else {
          newHomeStats[homeMatch.id] = toStatRow(homeMatch.id, extracted)
        }
      }
    })

    setHomeStats(newHomeStats)
    setAwayStats(newAwayStats)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    const rows = []
    Object.entries(homeStats).forEach(([playerId, stats]) => {
      rows.push({
        game_id: game.id,
        player_id: playerId,
        team_id: game.home_team_id,
        minutes: stats.minutes || 0,
        points: stats.points || 0,
        rebounds: stats.rebounds || 0,
        assists: stats.assists || 0,
        steals: stats.steals || 0,
        blocks: stats.blocks || 0,
        turnovers: stats.turnovers || 0,
        fouls: stats.fouls || 0,
        fg_made: stats.fg_made || 0,
        fg_attempted: stats.fg_attempted || 0,
        three_made: stats.three_made || 0,
        three_attempted: stats.three_attempted || 0,
        ft_made: stats.ft_made || 0,
        ft_attempted: stats.ft_attempted || 0,
      })
    })
    Object.entries(awayStats).forEach(([playerId, stats]) => {
      rows.push({
        game_id: game.id,
        player_id: playerId,
        team_id: game.away_team_id,
        minutes: stats.minutes || 0,
        points: stats.points || 0,
        rebounds: stats.rebounds || 0,
        assists: stats.assists || 0,
        steals: stats.steals || 0,
        blocks: stats.blocks || 0,
        turnovers: stats.turnovers || 0,
        fouls: stats.fouls || 0,
        fg_made: stats.fg_made || 0,
        fg_attempted: stats.fg_attempted || 0,
        three_made: stats.three_made || 0,
        three_attempted: stats.three_attempted || 0,
        ft_made: stats.ft_made || 0,
        ft_attempted: stats.ft_attempted || 0,
      })
    })

    const { error } = await supabase
      .from("player_stats")
      .upsert(rows, { onConflict: "game_id,player_id" })

    if (error) {
      alert("Failed to save stats: " + error.message)
      setSaving(false)
      return
    }

    // Persist the stat sheet image URL to the game record if we have a fresh one
    if (scannedImageUrl && scannedImageUrl !== game?.stat_sheet_url) {
      const { error: gameError } = await supabase
        .from("games")
        .update({ stat_sheet_url: scannedImageUrl })
        .eq("id", game.id)
      if (gameError) {
        console.error("Failed to save stat sheet URL:", gameError)
      }
    }

    setSaving(false)
    setSaved(true)
    router.refresh()
  }

  const StatInputRow = ({ player, stats, isHome }) => (
    <TableRow key={player.id}>
      <TableCell className="sticky left-0 bg-background">
        <span className="text-muted-foreground mr-2">#{player.number}</span>
        {player.name}
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={stats.minutes}
          onChange={(e) => updateStat(isHome, player.id, "minutes", e.target.value)}
          className="w-14 text-center"
          min="0"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={stats.points}
          onChange={(e) => updateStat(isHome, player.id, "points", e.target.value)}
          className="w-14 text-center"
          min="0"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={stats.rebounds}
          onChange={(e) => updateStat(isHome, player.id, "rebounds", e.target.value)}
          className="w-14 text-center"
          min="0"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={stats.assists}
          onChange={(e) => updateStat(isHome, player.id, "assists", e.target.value)}
          className="w-14 text-center"
          min="0"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={stats.steals}
          onChange={(e) => updateStat(isHome, player.id, "steals", e.target.value)}
          className="w-14 text-center"
          min="0"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={stats.blocks}
          onChange={(e) => updateStat(isHome, player.id, "blocks", e.target.value)}
          className="w-14 text-center"
          min="0"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={stats.turnovers}
          onChange={(e) => updateStat(isHome, player.id, "turnovers", e.target.value)}
          className="w-14 text-center"
          min="0"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={stats.fouls}
          onChange={(e) => updateStat(isHome, player.id, "fouls", e.target.value)}
          className="w-14 text-center"
          min="0"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={stats.fg_made}
            onChange={(e) => updateStat(isHome, player.id, "fg_made", e.target.value)}
            className="w-12 text-center"
            min="0"
          />
          <span>/</span>
          <Input
            type="number"
            value={stats.fg_attempted}
            onChange={(e) => updateStat(isHome, player.id, "fg_attempted", e.target.value)}
            className="w-12 text-center"
            min="0"
          />
          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
            {stats.fg_attempted > 0
              ? `${calculatePercentage(stats.fg_made, stats.fg_attempted)}%`
              : "—"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={stats.three_made}
            onChange={(e) => updateStat(isHome, player.id, "three_made", e.target.value)}
            className="w-12 text-center"
            min="0"
          />
          <span>/</span>
          <Input
            type="number"
            value={stats.three_attempted}
            onChange={(e) => updateStat(isHome, player.id, "three_attempted", e.target.value)}
            className="w-12 text-center"
            min="0"
          />
          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
            {stats.three_attempted > 0
              ? `${calculatePercentage(stats.three_made, stats.three_attempted)}%`
              : "—"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={stats.ft_made}
            onChange={(e) => updateStat(isHome, player.id, "ft_made", e.target.value)}
            className="w-12 text-center"
            min="0"
          />
          <span>/</span>
          <Input
            type="number"
            value={stats.ft_attempted}
            onChange={(e) => updateStat(isHome, player.id, "ft_attempted", e.target.value)}
            className="w-12 text-center"
            min="0"
          />
          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
            {stats.ft_attempted > 0
              ? `${calculatePercentage(stats.ft_made, stats.ft_attempted)}%`
              : "—"}
          </span>
        </div>
      </TableCell>
    </TableRow>
  )

  const TeamStatsTable = ({ roster, stats, isHome, team }) => (
    <div>
      <div className="flex items-center gap-3 mb-4">
        {team?.logo_url ? (
          <img
            src={team.logo_url}
            alt={team.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: team?.primary_color || "#666" }}
          >
            {team?.abbreviation || "?"}
          </div>
        )}
        <h3 className="font-semibold text-lg">{team?.name || "Team"}</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background min-w-32">Player</TableHead>
              <TableHead className="text-center">MIN</TableHead>
              <TableHead className="text-center">PTS</TableHead>
              <TableHead className="text-center">REB</TableHead>
              <TableHead className="text-center">AST</TableHead>
              <TableHead className="text-center">STL</TableHead>
              <TableHead className="text-center">BLK</TableHead>
              <TableHead className="text-center">TO</TableHead>
              <TableHead className="text-center">PF</TableHead>
              <TableHead className="text-center">FG</TableHead>
              <TableHead className="text-center">3PT</TableHead>
              <TableHead className="text-center">FT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roster.map((player) => (
              <StatInputRow
                key={player.id}
                player={player}
                stats={stats[player.id] || createEmptyStat(player.id)}
                isHome={isHome}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  return (
    <div>
      <Link href="/admin/games">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Games
        </Button>
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enter Stats</h1>
          <p className="text-muted-foreground mt-2">
            {awayTeam?.name} @ {homeTeam?.name} - {formatDate(game.game_date)}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || saved}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Stats
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="scanner">AI Scanner</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <div className="grid gap-8 lg:grid-cols-2">
            <StatScanner onStatsExtracted={handleStatsExtracted} />
            <Card>
              <CardHeader>
                <CardTitle>How it works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Upload Photo</h4>
                    <p className="text-sm text-muted-foreground">
                      Take a photo of your handwritten stat sheet or upload an existing image.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">AI Extraction</h4>
                    <p className="text-sm text-muted-foreground">
                      Our AI reads the handwritten stats and converts them to digital data.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Review & Save</h4>
                    <p className="text-sm text-muted-foreground">
                      Review the extracted stats, make any corrections, and save to the database.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manual">
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <TeamStatsTable
                  roster={awayRoster}
                  stats={awayStats}
                  isHome={false}
                  team={awayTeam}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <TeamStatsTable
                  roster={homeRoster}
                  stats={homeStats}
                  isHome={true}
                  team={homeTeam}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="review">
          <div className="grid gap-8 lg:grid-cols-2">
            {(scannedImage || scannedImageUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Original Stat Sheet</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={scannedImage || scannedImageUrl}
                    alt="Scanned stat sheet"
                    className="w-full rounded-lg border"
                  />
                </CardContent>
              </Card>
            )}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Review the extracted stats below. You can edit any values in the Manual Entry tab before saving.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{awayTeam?.name} (Away)</h4>
                      <div className="text-sm space-y-1">
                        {awayRoster.map((player) => {
                          const ps = awayStats[player.id]
                          if (!ps || ps.points === 0) return null
                          return (
                            <div key={player.id} className="flex justify-between p-2 bg-muted rounded">
                              <span>#{player.number} {player.name}</span>
                              <span className="font-medium">
                                {ps.points} pts, {ps.rebounds} reb, {ps.assists} ast
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">{homeTeam?.name} (Home)</h4>
                      <div className="text-sm space-y-1">
                        {homeRoster.map((player) => {
                          const ps = homeStats[player.id]
                          if (!ps || ps.points === 0) return null
                          return (
                            <div key={player.id} className="flex justify-between p-2 bg-muted rounded">
                              <span>#{player.number} {player.name}</span>
                              <span className="font-medium">
                                {ps.points} pts, {ps.rebounds} reb, {ps.assists} ast
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
