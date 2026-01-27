"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select } from "@/components/ui/select"
import { GameCard } from "@/components/game-card"
import { Footer } from "@/components/footer"
import { Calendar, List } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function ScheduleClient({ games, teams }) {
  const [teamFilter, setTeamFilter] = useState("all")
  const [view, setView] = useState("list")

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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
            <p className="text-muted-foreground mt-2">
              View all games in the season
            </p>
          </div>

          {/* Filters & View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

            <div className="flex-1" />

            <div className="flex gap-2">
              <Button
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={view === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("calendar")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </div>
          </div>

          {view === "list" ? (
            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList>
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingGames.length})
                </TabsTrigger>
                <TabsTrigger value="results">
                  Results ({pastGames.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                {upcomingGames.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">
                        No upcoming games scheduled.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="results">
                {pastGames.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pastGames.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">
                        No games played yet.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            // Calendar View
            <div className="space-y-6">
              {Object.keys(gamesByDate)
                .sort((a, b) => new Date(a) - new Date(b))
                .map((dateKey) => (
                  <Card key={dateKey}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        {formatDate(dateKey)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {gamesByDate[dateKey].map((game) => (
                          <GameCard
                            key={game.id}
                            game={game}
                            showDate={false}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {Object.keys(gamesByDate).length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No games found.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
