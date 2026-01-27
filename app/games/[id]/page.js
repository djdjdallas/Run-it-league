import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BoxScore } from "@/components/box-score"
import { Footer } from "@/components/footer"
import { ArrowLeft, MapPin, Calendar as CalendarIcon } from "lucide-react"
import { getGameById, getStatsByGame, getPlayersByTeam } from "@/lib/queries"
import { formatDate, formatTime } from "@/lib/utils"

export async function generateMetadata({ params }) {
  const { id } = await params
  const game = await getGameById(id)
  if (!game) return { title: "Game Not Found" }

  return {
    title: `${game.away_team?.name || "Away"} vs ${game.home_team?.name || "Home"} - Run It League`,
    description: `Game details and box score`,
  }
}

export default async function GameDetailPage({ params }) {
  const { id } = await params
  const game = await getGameById(id)

  if (!game) {
    notFound()
  }

  const homeTeam = game.home_team
  const awayTeam = game.away_team

  const isFinal = game.status === "final"
  const homeWon = isFinal && game.home_score > game.away_score
  const awayWon = isFinal && game.away_score > game.home_score

  // Get stats and players for this game
  const [gameStats, homePlayers, awayPlayers] = await Promise.all([
    getStatsByGame(id),
    getPlayersByTeam(game.home_team_id),
    getPlayersByTeam(game.away_team_id),
  ])

  const allPlayers = [...homePlayers, ...awayPlayers]
  const homeStats = gameStats.filter((ps) => ps.team_id === game.home_team_id)
  const awayStats = gameStats.filter((ps) => ps.team_id === game.away_team_id)

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container py-8">
          {/* Back Button */}
          <Link href="/schedule">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Schedule
            </Button>
          </Link>

          {/* Game Header */}
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(game.game_date)}</span>
                  {game.status === "scheduled" && (
                    <span>at {formatTime(game.game_date)}</span>
                  )}
                </div>
                <Badge
                  variant={
                    isFinal
                      ? "secondary"
                      : game.status === "in_progress"
                      ? "default"
                      : "outline"
                  }
                >
                  {game.status === "final"
                    ? "Final"
                    : game.status === "in_progress"
                    ? "Live"
                    : "Scheduled"}
                </Badge>
              </div>

              {/* Matchup */}
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Away Team */}
                <Link href={`/teams/${awayTeam?.id}`} className="text-center group">
                  <div className="flex flex-col items-center">
                    {awayTeam?.logo_url ? (
                      <img
                        src={awayTeam.logo_url}
                        alt={awayTeam.name}
                        className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover mb-2"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-xl md:text-3xl font-bold mb-2"
                        style={{ backgroundColor: awayTeam?.primary_color || "#666" }}
                      >
                        {awayTeam?.abbreviation || "?"}
                      </div>
                    )}
                    <span className={`font-semibold group-hover:underline ${awayWon ? "text-foreground" : "text-muted-foreground"}`}>
                      {awayTeam?.name || "Away Team"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {awayTeam?.wins}-{awayTeam?.losses}
                    </span>
                  </div>
                </Link>

                {/* Score */}
                <div className="text-center">
                  {isFinal ? (
                    <div className="flex items-center justify-center gap-4">
                      <span className={`text-4xl md:text-5xl font-bold ${awayWon ? "" : "text-muted-foreground"}`}>
                        {game.away_score}
                      </span>
                      <span className="text-2xl text-muted-foreground">-</span>
                      <span className={`text-4xl md:text-5xl font-bold ${homeWon ? "" : "text-muted-foreground"}`}>
                        {game.home_score}
                      </span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">VS</div>
                  )}
                </div>

                {/* Home Team */}
                <Link href={`/teams/${homeTeam?.id}`} className="text-center group">
                  <div className="flex flex-col items-center">
                    {homeTeam?.logo_url ? (
                      <img
                        src={homeTeam.logo_url}
                        alt={homeTeam.name}
                        className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover mb-2"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-xl md:text-3xl font-bold mb-2"
                        style={{ backgroundColor: homeTeam?.primary_color || "#666" }}
                      >
                        {homeTeam?.abbreviation || "?"}
                      </div>
                    )}
                    <span className={`font-semibold group-hover:underline ${homeWon ? "text-foreground" : "text-muted-foreground"}`}>
                      {homeTeam?.name || "Home Team"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {homeTeam?.wins}-{homeTeam?.losses}
                    </span>
                  </div>
                </Link>
              </div>

              {game.location && (
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{game.location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Box Scores */}
          {isFinal && (homeStats.length > 0 || awayStats.length > 0) ? (
            <div className="space-y-8">
              {/* Away Team Box Score */}
              {awayStats.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <BoxScore
                      stats={awayStats}
                      team={awayTeam}
                      players={allPlayers}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Home Team Box Score */}
              {homeStats.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <BoxScore
                      stats={homeStats}
                      team={homeTeam}
                      players={allPlayers}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          ) : isFinal ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No box score available for this game.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Box score will be available after the game.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
