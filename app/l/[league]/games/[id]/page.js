import Link from "next/link"
import { notFound } from "next/navigation"
import { BoxScore } from "@/components/box-score"
import { Footer } from "@/components/footer"
import { ArrowLeft, MapPin, Calendar as CalendarIcon } from "lucide-react"
import { getGameById, getStatsByGame, getPlayersByTeam } from "@/lib/queries"
import { resolveLeague, leaguePrefix, leagueWordmark } from "@/lib/leagues"
import { formatDate, formatTime } from "@/lib/utils"

export async function generateMetadata({ params }) {
  const { id, league: slug } = await params
  const league = await resolveLeague(slug)
  const game = league && (await getGameById(league.id, id))
  if (!game) return { title: "Game Not Found" }

  return {
    title: `${game.away_team?.name || "Away"} vs ${game.home_team?.name || "Home"} - ${league.name}`,
    description: `Game details and box score`,
  }
}

export default async function GameDetailPage({ params }) {
  const { id, league: slug } = await params
  const league = await resolveLeague(slug)
  if (!league) notFound()
  const basePath = leaguePrefix(league)

  const game = await getGameById(league.id, id)

  if (!game) {
    notFound()
  }

  const homeTeam = game.home_team
  const awayTeam = game.away_team

  const isFinal = game.status === "final"
  const isLive = game.status === "in_progress"
  const homeWon = isFinal && game.home_score > game.away_score
  const awayWon = isFinal && game.away_score > game.home_score

  // Get stats and players for this game
  const [gameStats, homePlayers, awayPlayers] = await Promise.all([
    getStatsByGame(league.id, id),
    getPlayersByTeam(league.id, game.home_team_id),
    getPlayersByTeam(league.id, game.away_team_id),
  ])

  const allPlayers = [...homePlayers, ...awayPlayers]
  const homeStats = gameStats.filter((ps) => ps.team_id === game.home_team_id)
  const awayStats = gameStats.filter((ps) => ps.team_id === game.away_team_id)

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        <div className="container py-8">
          {/* Back Link */}
          <Link
            href={`${basePath}/schedule`}
            className="inline-flex items-center gap-2 text-white/40 hover:text-neon transition-colors text-sm mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schedule
          </Link>

          {/* Game Header */}
          <div className="bg-[#121212] border border-white/10 mb-8">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(game.game_date)}</span>
                  {game.status === "scheduled" && (
                    <span>at {formatTime(game.game_date)}</span>
                  )}
                </div>
                {isFinal ? (
                  <span className="bg-white/10 text-white text-xs font-bold uppercase px-3 py-1">
                    Final
                  </span>
                ) : isLive ? (
                  <span className="bg-neon text-black text-xs font-bold uppercase px-3 py-1 animate-pulse">
                    Live
                  </span>
                ) : (
                  <span className="border border-white/20 text-white/60 text-xs font-bold uppercase px-3 py-1">
                    Scheduled
                  </span>
                )}
              </div>

              {/* Matchup */}
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Away Team */}
                <Link href={`${basePath}/teams/${awayTeam?.id}`} className="text-center group">
                  <div className="flex flex-col items-center">
                    {awayTeam?.logo_url ? (
                      <img
                        src={awayTeam.logo_url}
                        alt={awayTeam.name}
                        className="w-16 h-16 md:w-24 md:h-24 object-cover mb-2"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center text-white text-xl md:text-3xl font-bold mb-2"
                        style={{ backgroundColor: awayTeam?.primary_color || "#666" }}
                      >
                        {awayTeam?.abbreviation || "?"}
                      </div>
                    )}
                    <span className={`font-display text-lg md:text-2xl group-hover:text-neon transition-colors ${awayWon ? "text-white" : "text-white/40"}`}>
                      {awayTeam?.name || "Away Team"}
                    </span>
                    <span className="text-sm text-white/40">
                      {awayTeam?.wins}-{awayTeam?.losses}
                    </span>
                  </div>
                </Link>

                {/* Score */}
                <div className="text-center">
                  {game.home_score != null && game.away_score != null ? (
                    <div className="flex items-center justify-center gap-4">
                      <span className={`font-display text-5xl md:text-6xl font-bold ${awayWon ? "text-neon neon-glow" : "text-white/40"}`}>
                        {game.away_score}
                      </span>
                      <span className="text-2xl text-white/20">-</span>
                      <span className={`font-display text-5xl md:text-6xl font-bold ${homeWon ? "text-neon neon-glow" : "text-white/40"}`}>
                        {game.home_score}
                      </span>
                    </div>
                  ) : (
                    <div className="font-display text-3xl text-neon neon-glow">VS</div>
                  )}
                </div>

                {/* Home Team */}
                <Link href={`${basePath}/teams/${homeTeam?.id}`} className="text-center group">
                  <div className="flex flex-col items-center">
                    {homeTeam?.logo_url ? (
                      <img
                        src={homeTeam.logo_url}
                        alt={homeTeam.name}
                        className="w-16 h-16 md:w-24 md:h-24 object-cover mb-2"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center text-white text-xl md:text-3xl font-bold mb-2"
                        style={{ backgroundColor: homeTeam?.primary_color || "#666" }}
                      >
                        {homeTeam?.abbreviation || "?"}
                      </div>
                    )}
                    <span className={`font-display text-lg md:text-2xl group-hover:text-neon transition-colors ${homeWon ? "text-white" : "text-white/40"}`}>
                      {homeTeam?.name || "Home Team"}
                    </span>
                    <span className="text-sm text-white/40">
                      {homeTeam?.wins}-{homeTeam?.losses}
                    </span>
                  </div>
                </Link>
              </div>

              {game.location && (
                <div className="flex items-center justify-center gap-2 mt-6 text-sm text-white/40">
                  <MapPin className="h-4 w-4" />
                  <span>{game.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Box Scores */}
          {isFinal && (homeStats.length > 0 || awayStats.length > 0) ? (
            <div className="space-y-8">
              {/* Away Team Box Score */}
              {awayStats.length > 0 && (
                <div className="bg-[#121212] border border-white/10 p-6">
                  <BoxScore
                    stats={awayStats}
                    team={awayTeam}
                    players={allPlayers}
                  />
                </div>
              )}

              {/* Home Team Box Score */}
              {homeStats.length > 0 && (
                <div className="bg-[#121212] border border-white/10 p-6">
                  <BoxScore
                    stats={homeStats}
                    team={homeTeam}
                    players={allPlayers}
                  />
                </div>
              )}
            </div>
          ) : isFinal ? (
            <div className="bg-[#121212] border border-white/10 py-12 text-center">
              <p className="text-white/40">
                No box score available for this game.
              </p>
            </div>
          ) : (
            <div className="bg-[#121212] border border-white/10 py-12 text-center">
              <p className="text-white/40">
                Box score will be available after the game.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer wordmark={leagueWordmark(league)} />
    </div>
  )
}
