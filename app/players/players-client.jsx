"use client"

import { useState } from "react"
import Link from "next/link"
import { Select } from "@/components/ui/select"
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
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        {/* Header */}
        <section className="py-16 md:py-24">
          <div className="container">
            <p className="text-neon text-xs font-bold uppercase tracking-[0.3em] mb-2">
              Roster
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-white">
              THE PLAYERS
            </h1>
          </div>
        </section>

        <div className="container pb-16">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                placeholder="Search players or teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon transition-colors"
              />
            </div>
            <Select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full sm:w-48 bg-[#121212] border-white/10 text-white"
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
              className="w-full sm:w-36 bg-[#121212] border-white/10 text-white"
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
                <div className="bg-[#121212] border border-white/10 p-4 brutal-hover cursor-pointer h-full">
                  <div className="flex items-start gap-4">
                    {player.photo_url ? (
                      <img
                        src={player.photo_url}
                        alt={player.name}
                        className="w-16 h-16 object-cover"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 flex items-center justify-center text-white text-lg font-bold"
                        style={{
                          backgroundColor: player.team?.primary_color || "#666",
                        }}
                      >
                        {player.number || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{player.name}</h3>
                      <p className="text-sm text-white/40">
                        {player.team?.name || "Free Agent"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="border border-white/20 text-white/60 text-xs px-2 py-0.5">
                          #{player.number}
                        </span>
                        <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5">
                          {player.position}
                        </span>
                      </div>
                    </div>
                  </div>

                  {player.games > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
                      <div>
                        <div className="font-bold text-white">{player.ppg}</div>
                        <div className="text-xs text-white/40 uppercase">PPG</div>
                      </div>
                      <div>
                        <div className="font-bold text-white">{player.rpg}</div>
                        <div className="text-xs text-white/40 uppercase">RPG</div>
                      </div>
                      <div>
                        <div className="font-bold text-white">{player.apg}</div>
                        <div className="text-xs text-white/40 uppercase">APG</div>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {filteredPlayers.length === 0 && (
            <div className="bg-[#121212] border border-white/10 py-12 text-center">
              <p className="text-white/40">No players found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
