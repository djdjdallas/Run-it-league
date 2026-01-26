"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { sampleGames, sampleTeams, samplePlayers, samplePlayerStats } from "@/lib/sample-data"
import { formatDate } from "@/lib/utils"

export default function GameStatsPage({ params }) {
  const resolvedParams = use(params)
  const gameId = resolvedParams.id

  const [game, setGame] = useState(null)
  const [homeTeam, setHomeTeam] = useState(null)
  const [awayTeam, setAwayTeam] = useState(null)
  const [homeRoster, setHomeRoster] = useState([])
  const [awayRoster, setAwayRoster] = useState([])
  const [homeStats, setHomeStats] = useState({})
  const [awayStats, setAwayStats] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [scannedImage, setScannedImage] = useState(null)
  const [activeTab, setActiveTab] = useState("manual")

  useEffect(() => {
    // Load game data
    const foundGame = sampleGames.find((g) => g.id === gameId)
    if (foundGame) {
      setGame(foundGame)

      const home = sampleTeams.find((t) => t.id === foundGame.home_team_id)
      const away = sampleTeams.find((t) => t.id === foundGame.away_team_id)
      setHomeTeam(home)
      setAwayTeam(away)

      // Get rosters
      const homeP = samplePlayers.filter(
        (p) => p.team_id === foundGame.home_team_id && p.is_active
      )
      const awayP = samplePlayers.filter(
        (p) => p.team_id === foundGame.away_team_id && p.is_active
      )
      setHomeRoster(homeP)
      setAwayRoster(awayP)

      // Load existing stats if any
      const existingStats = samplePlayerStats.filter((ps) => ps.game_id === gameId)

      const homeExisting = {}
      const awayExisting = {}

      existingStats.forEach((stat) => {
        if (stat.team_id === foundGame.home_team_id) {
          homeExisting[stat.player_id] = stat
        } else {
          awayExisting[stat.player_id] = stat
        }
      })

      // Initialize stats for all players
      const initHomeStats = {}
      homeP.forEach((p) => {
        initHomeStats[p.id] = homeExisting[p.id] || createEmptyStat(p.id)
      })
      setHomeStats(initHomeStats)

      const initAwayStats = {}
      awayP.forEach((p) => {
        initAwayStats[p.id] = awayExisting[p.id] || createEmptyStat(p.id)
      })
      setAwayStats(initAwayStats)
    }
  }, [gameId])

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

  const handleStatsExtracted = (extractedStats, imagePreview) => {
    setScannedImage(imagePreview)
    setActiveTab("review")

    // Try to match extracted players to roster
    if (extractedStats.home_team?.players) {
      const newHomeStats = { ...homeStats }
      extractedStats.home_team.players.forEach((extracted) => {
        // Try to find matching player by name or number
        const match = homeRoster.find(
          (p) =>
            p.name.toLowerCase().includes(extracted.name?.toLowerCase() || "") ||
            extracted.name?.toLowerCase().includes(p.name.toLowerCase()) ||
            p.number === extracted.number
        )
        if (match) {
          newHomeStats[match.id] = {
            ...createEmptyStat(match.id),
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
      })
      setHomeStats(newHomeStats)
    }

    if (extractedStats.away_team?.players) {
      const newAwayStats = { ...awayStats }
      extractedStats.away_team.players.forEach((extracted) => {
        const match = awayRoster.find(
          (p) =>
            p.name.toLowerCase().includes(extracted.name?.toLowerCase() || "") ||
            extracted.name?.toLowerCase().includes(p.name.toLowerCase()) ||
            p.number === extracted.number
        )
        if (match) {
          newAwayStats[match.id] = {
            ...createEmptyStat(match.id),
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
      })
      setAwayStats(newAwayStats)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    // In production, this would save to Supabase
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
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

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

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
            {scannedImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Original Stat Sheet</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={scannedImage}
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
