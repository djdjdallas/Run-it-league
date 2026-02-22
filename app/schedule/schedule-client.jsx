"use client"

import { useState } from "react"
import { Select } from "@/components/ui/select"
import { GameCard } from "@/components/game-card"
import { Footer } from "@/components/footer"
import { Calendar, List } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function ScheduleClient({ games, teams }) {
  const [teamFilter, setTeamFilter] = useState("all")
  const [view, setView] = useState("list")
  const [activeTab, setActiveTab] = useState("upcoming")

  // Filter games by team
  const filteredGames = games.filter((game) => {
    if (teamFilter === "all") return true
    return game.home_team_id === teamFilter || game.away_team_id === teamFilter
  })

  // Separate into past and upcoming
  const pastGames = filteredGames
    .filter((g) => g.status === "final")
    .sort((a, b) => new Date(b.game_date) - new Date(a.game_date))

  const upcomingGames = filteredGames
    .filter((g) => g.status === "scheduled" || g.status === "in_progress")
    .sort((a, b) => new Date(a.game_date) - new Date(b.game_date))

  // Group games by date for calendar view
  const gamesByDate = filteredGames.reduce((acc, game) => {
    const dateKey = new Date(game.game_date).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(game)
    return acc
  }, {})

  const displayGames = activeTab === "upcoming" ? upcomingGames : pastGames

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        {/* Header */}
        <section className="py-16 md:py-24">
          <div className="container">
            <p className="text-neon text-xs font-bold uppercase tracking-[0.3em] mb-2">
              Schedule
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-white">
              THE SCHEDULE
            </h1>
          </div>
        </section>

        <div className="container pb-16">
          {/* Filters & View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
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

            <div className="flex-1" />

            <div className="flex gap-2">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                  view === "list"
                    ? "bg-neon text-black"
                    : "border border-white/20 text-white/40 hover:text-white hover:border-white/40"
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                  view === "calendar"
                    ? "bg-neon text-black"
                    : "border border-white/20 text-white/40 hover:text-white hover:border-white/40"
                }`}
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </button>
            </div>
          </div>

          {view === "list" ? (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                    activeTab === "upcoming"
                      ? "bg-neon text-black"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Upcoming ({upcomingGames.length})
                </button>
                <button
                  onClick={() => setActiveTab("results")}
                  className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                    activeTab === "results"
                      ? "bg-neon text-black"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Results ({pastGames.length})
                </button>
              </div>

              {displayGames.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {displayGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <div className="bg-[#121212] border border-white/10 py-12 text-center">
                  <p className="text-white/40">
                    {activeTab === "upcoming"
                      ? "No upcoming games scheduled."
                      : "No games played yet."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Calendar View
            <div className="space-y-6">
              {Object.keys(gamesByDate)
                .sort((a, b) => new Date(a) - new Date(b))
                .map((dateKey) => (
                  <div key={dateKey} className="bg-[#121212] border border-white/10">
                    <div className="px-6 py-4 border-b border-white/10">
                      <h3 className="font-display text-lg text-white">
                        {formatDate(dateKey)}
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {gamesByDate[dateKey].map((game) => (
                          <GameCard
                            key={game.id}
                            game={game}
                            showDate={false}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

              {Object.keys(gamesByDate).length === 0 && (
                <div className="bg-[#121212] border border-white/10 py-12 text-center">
                  <p className="text-white/40">
                    No games found.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
