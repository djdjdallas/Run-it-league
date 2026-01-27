"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { Search } from "lucide-react"

export default function PlayersClient({ players, teams, playerStats }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [teamFilter, setTeamFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")

  // Calculate player averages
  const playersWithStats = players
    .filter((p) => p.is_active)
    .map((player) => {
      const team = player.team || teams.find((t) => t.id === player.team_id)
      const playerGameStats = playerStats.filter(
        (ps) => ps.player_id === player.id
      )
      const games = playerGameStats.length

      if (games === 0) {
        return { ...player, team, games: 0, ppg: 0, rpg: 0, apg: 0 }
      }

      const totals = playerGameStats.reduce(
        (acc, stat) => ({
          points: acc.points + (stat.points || 0),
          rebounds: acc.rebounds + (stat.rebounds || 0),
          assists: acc.assists + (stat.assists || 0),
        }),
        { points: 0, rebounds: 0, assists: 0 }
      )

      return {
        ...player,
        team,
        games,
        ppg: (totals.points / games).toFixed(1),
        rpg: (totals.rebounds / games).toFixed(1),
        apg: (totals.assists / games).toFixed(1),
      }
    })

  // Filter players
  const filteredPlayers = playersWithStats.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTeam =
      teamFilter === "all" || player.team_id === teamFilter
    const matchesPosition =
      positionFilter === "all" || player.position === positionFilter
    return matchesSearch && matchesTeam && matchesPosition
  })

  // Sort by PPG
  filteredPlayers.sort((a, b) => parseFloat(b.ppg) - parseFloat(a.ppg))

  const positions = ["PG", "SG", "SF", "PF", "C"]

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Players</h1>
            <p className="text-muted-foreground mt-2">
              All players in the league
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players or teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
            <Select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full sm:w-36"
            >
              <option value="all">All Positions</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </Select>
          </div>

          {/* Player Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPlayers.map((player) => (
              <Link key={player.id} href={`/players/${player.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {player.photo_url ? (
                        <img
                          src={player.photo_url}
                          alt={player.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold"
                          style={{
                            backgroundColor: player.team?.primary_color || "#666",
                          }}
                        >
                          {player.number || "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{player.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {player.team?.name || "Free Agent"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            #{player.number}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {player.position}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {player.games > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
                        <div>
                          <div className="font-bold">{player.ppg}</div>
                          <div className="text-xs text-muted-foreground">PPG</div>
                        </div>
                        <div>
                          <div className="font-bold">{player.rpg}</div>
                          <div className="text-xs text-muted-foreground">RPG</div>
                        </div>
                        <div>
                          <div className="font-bold">{player.apg}</div>
                          <div className="text-xs text-muted-foreground">APG</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No players found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
