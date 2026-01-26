"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCircle, Calendar, Megaphone, Trophy, TrendingUp } from "lucide-react"
import { sampleTeams, samplePlayers, sampleGames, sampleAnnouncements } from "@/lib/sample-data"

export default function AdminDashboardPage() {
  // In production, these would come from Supabase
  const stats = {
    teams: sampleTeams.length,
    players: samplePlayers.filter((p) => p.is_active).length,
    games: sampleGames.length,
    completedGames: sampleGames.filter((g) => g.status === "final").length,
    upcomingGames: sampleGames.filter((g) => g.status === "scheduled").length,
    announcements: sampleAnnouncements.length,
  }

  const recentGames = sampleGames
    .filter((g) => g.status === "final")
    .sort((a, b) => new Date(b.game_date) - new Date(a.game_date))
    .slice(0, 5)

  const upcomingGames = sampleGames
    .filter((g) => g.status === "scheduled")
    .sort((a, b) => new Date(a.game_date) - new Date(b.game_date))
    .slice(0, 5)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the Run It League admin dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teams}</div>
            <Link href="/admin/teams">
              <Button variant="link" className="p-0 h-auto text-xs">
                Manage teams
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Players</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.players}</div>
            <Link href="/admin/players">
              <Button variant="link" className="p-0 h-auto text-xs">
                Manage players
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Games</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.games}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedGames} completed, {stats.upcomingGames} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.announcements}</div>
            <Link href="/admin/announcements">
              <Button variant="link" className="p-0 h-auto text-xs">
                Manage announcements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link href="/admin/teams">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Add Team</h3>
                <p className="text-sm text-muted-foreground">Create a new team</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/players">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <UserCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Add Player</h3>
                <p className="text-sm text-muted-foreground">Register a new player</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/games">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Schedule Game</h3>
                <p className="text-sm text-muted-foreground">Add a new game</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/announcements">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <Megaphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Post Update</h3>
                <p className="text-sm text-muted-foreground">Create announcement</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent & Upcoming Games */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Games Needing Stats</CardTitle>
          </CardHeader>
          <CardContent>
            {recentGames.length > 0 ? (
              <div className="space-y-4">
                {recentGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {game.away_team?.name} @ {game.home_team?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Final: {game.away_score} - {game.home_score}
                      </p>
                    </div>
                    <Link href={`/admin/games/${game.id}/stats`}>
                      <Button size="sm" variant="outline">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Stats
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No completed games yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Games</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingGames.length > 0 ? (
              <div className="space-y-4">
                {upcomingGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {game.away_team?.name} @ {game.home_team?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(game.game_date).toLocaleDateString()} at{" "}
                        {new Date(game.game_date).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Link href={`/admin/games`}>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming games scheduled.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
