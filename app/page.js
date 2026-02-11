import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StandingsTable } from "@/components/standings-table"
import { GameCard } from "@/components/game-card"
import { AnnouncementCard } from "@/components/announcement-card"
import { Footer } from "@/components/footer"
import { ArrowRight, Calendar, Trophy, TrendingUp } from "lucide-react"
import { getTeams, getRecentGames, getUpcomingGames, getAnnouncements } from "@/lib/queries"

export default async function HomePage() {
  const [teams, recentGames, upcomingGames, allAnnouncements] = await Promise.all([
    getTeams(),
    getRecentGames(3),
    getUpcomingGames(3),
    getAnnouncements(),
  ])

  const announcements = allAnnouncements.slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-12 md:py-20">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <Image
                src="/assets/Runit.png"
                alt="Run It League"
                width={200}
                height={200}
                className="mx-auto mb-4"
                priority
              />
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Run It League
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Your home for standings, schedules, and stats. Track every game,
                every play, every moment.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/schedule">
                  <Button size="lg">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Schedule
                  </Button>
                </Link>
                <Link href="/stats">
                  <Button variant="outline" size="lg">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Stats Leaders
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container py-8 md:py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Standings - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    Standings
                  </CardTitle>
                  <Link href="/teams">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <StandingsTable teams={teams} />
                </CardContent>
              </Card>
            </div>

            {/* Announcements */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Announcements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                      <AnnouncementCard
                        key={announcement.id}
                        announcement={announcement}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No announcements yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Games Section */}
          <div className="grid gap-8 md:grid-cols-2 mt-8">
            {/* Recent Games */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Games</CardTitle>
                <Link href="/schedule">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentGames.length > 0 ? (
                  recentGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No games played yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Games */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Games</CardTitle>
                <Link href="/schedule">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingGames.length > 0 ? (
                  upcomingGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No upcoming games scheduled.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
