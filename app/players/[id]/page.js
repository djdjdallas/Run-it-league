import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import { getPlayerById, getStatsByPlayer } from "@/lib/queries"
import { formatDate, calculatePercentage } from "@/lib/utils"

export async function generateMetadata({ params }) {
  const { id } = await params
  const player = await getPlayerById(id)
  if (!player) return { title: "Player Not Found" }
  return {
    title: `${player.name} - Run It League`,
    description: `View ${player.name}'s stats and game logs`,
  }
}

export default async function PlayerDetailPage({ params }) {
  const { id } = await params
  const [player, playerGameStats] = await Promise.all([
    getPlayerById(id),
    getStatsByPlayer(id),
  ])

  if (!player) {
    notFound()
  }

  const team = player.team

  // Calculate career averages
  const games = playerGameStats.length
  const totals = playerGameStats.reduce(
    (acc, stat) => ({
      minutes: acc.minutes + (stat.minutes || 0),
      points: acc.points + (stat.points || 0),
      rebounds: acc.rebounds + (stat.rebounds || 0),
      assists: acc.assists + (stat.assists || 0),
      steals: acc.steals + (stat.steals || 0),
      blocks: acc.blocks + (stat.blocks || 0),
      turnovers: acc.turnovers + (stat.turnovers || 0),
      fouls: acc.fouls + (stat.fouls || 0),
      fgMade: acc.fgMade + (stat.fg_made || 0),
      fgAttempted: acc.fgAttempted + (stat.fg_attempted || 0),
      threeMade: acc.threeMade + (stat.three_made || 0),
      threeAttempted: acc.threeAttempted + (stat.three_attempted || 0),
      ftMade: acc.ftMade + (stat.ft_made || 0),
      ftAttempted: acc.ftAttempted + (stat.ft_attempted || 0),
    }),
    {
      minutes: 0,
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      fgMade: 0,
      fgAttempted: 0,
      threeMade: 0,
      threeAttempted: 0,
      ftMade: 0,
      ftAttempted: 0,
    }
  )

  const averages = games > 0
    ? {
        mpg: (totals.minutes / games).toFixed(1),
        ppg: (totals.points / games).toFixed(1),
        rpg: (totals.rebounds / games).toFixed(1),
        apg: (totals.assists / games).toFixed(1),
        spg: (totals.steals / games).toFixed(1),
        bpg: (totals.blocks / games).toFixed(1),
        topg: (totals.turnovers / games).toFixed(1),
        fpg: (totals.fouls / games).toFixed(1),
        fgPct: calculatePercentage(totals.fgMade, totals.fgAttempted),
        threePct: calculatePercentage(totals.threeMade, totals.threeAttempted),
        ftPct: calculatePercentage(totals.ftMade, totals.ftAttempted),
      }
    : null

  // Get game logs with game details
  const gameLogs = playerGameStats.map((stat) => {
    const game = stat.game
    const isHome = game?.home_team_id === player.team_id
    const opponent = isHome ? game?.away_team : game?.home_team
    const hasScore =
      game?.status === "final" && game.home_score != null && game.away_score != null
    const result = hasScore
      ? isHome
        ? game.home_score > game.away_score
          ? "W"
          : "L"
        : game.away_score > game.home_score
        ? "W"
        : "L"
      : "-"
    const score = hasScore
      ? isHome
        ? `${game.home_score}-${game.away_score}`
        : `${game.away_score}-${game.home_score}`
      : "-"

    return {
      ...stat,
      game,
      opponent,
      isHome,
      result,
      score,
    }
  }).sort((a, b) => new Date(b.game?.game_date) - new Date(a.game?.game_date))

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        <div className="container py-8">
          {/* Back Link */}
          <Link
            href="/players"
            className="inline-flex items-center gap-2 text-white/40 hover:text-neon transition-colors text-sm mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Players
          </Link>

          {/* Player Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
            {player.photo_url ? (
              <img
                src={player.photo_url}
                alt={player.name}
                className="w-32 h-32 object-cover"
              />
            ) : (
              <div
                className="w-32 h-32 flex items-center justify-center text-white text-4xl font-bold"
                style={{ backgroundColor: team?.primary_color || "#666" }}
              >
                {player.number || "?"}
              </div>
            )}

            <div className="flex-1">
              <h1 className="font-display text-4xl text-white">{player.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {team && (
                  <Link
                    href={`/teams/${team.id}`}
                    className="border border-white/20 text-white/60 hover:border-neon hover:text-neon transition-colors text-sm px-3 py-1"
                  >
                    {team.name}
                  </Link>
                )}
                <span className="bg-white/10 text-white/60 text-sm px-3 py-1">
                  #{player.number}
                </span>
                <span className="bg-white/10 text-white/60 text-sm px-3 py-1">
                  {player.position}
                </span>
                {player.height && (
                  <span className="text-white/40">{player.height}</span>
                )}
              </div>
            </div>
          </div>

          {/* Season Averages */}
          {averages && (
            <div className="bg-[#121212] border border-white/10 mb-8">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="font-display text-xl text-white">
                  Season Averages <span className="text-white/40 text-sm font-normal">({games} Games)</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-neon">{averages.ppg}</div>
                    <div className="text-xs text-white/40 uppercase">PPG</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{averages.rpg}</div>
                    <div className="text-xs text-white/40 uppercase">RPG</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{averages.apg}</div>
                    <div className="text-xs text-white/40 uppercase">APG</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{averages.spg}</div>
                    <div className="text-xs text-white/40 uppercase">SPG</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{averages.bpg}</div>
                    <div className="text-xs text-white/40 uppercase">BPG</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{averages.mpg}</div>
                    <div className="text-xs text-white/40 uppercase">MPG</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{averages.fgPct}%</div>
                    <div className="text-xs text-white/40 uppercase">FG%</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{averages.threePct}%</div>
                    <div className="text-xs text-white/40 uppercase">3P%</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{averages.ftPct}%</div>
                    <div className="text-xs text-white/40 uppercase">FT%</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{averages.topg}</div>
                    <div className="text-xs text-white/40 uppercase">TOPG</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{averages.fpg}</div>
                    <div className="text-xs text-white/40 uppercase">FPG</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Log */}
          <div className="bg-[#121212] border border-white/10">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="font-display text-xl text-white">Game Log</h2>
            </div>
            <div className="p-4">
              {gameLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Opp</TableHead>
                      <TableHead className="text-center">Result</TableHead>
                      <TableHead className="text-center">MIN</TableHead>
                      <TableHead className="text-center">PTS</TableHead>
                      <TableHead className="text-center hidden sm:table-cell">REB</TableHead>
                      <TableHead className="text-center hidden sm:table-cell">AST</TableHead>
                      <TableHead className="text-center hidden md:table-cell">STL</TableHead>
                      <TableHead className="text-center hidden md:table-cell">BLK</TableHead>
                      <TableHead className="text-center hidden lg:table-cell">FG</TableHead>
                      <TableHead className="text-center hidden lg:table-cell">3P</TableHead>
                      <TableHead className="text-center hidden lg:table-cell">FT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gameLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-white/40">
                          {log.game ? formatDate(log.game.game_date) : "-"}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/teams/${log.opponent?.id}`}
                            className="text-white/60 hover:text-neon transition-colors"
                          >
                            {log.isHome ? "vs " : "@ "}
                            {log.opponent?.abbreviation || "-"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={
                              log.result === "W"
                                ? "text-green-500 font-medium"
                                : log.result === "L"
                                ? "text-neon font-medium"
                                : "text-white/60"
                            }
                          >
                            {log.result}
                          </span>
                          <span className="text-white/40 text-sm ml-1">
                            {log.score}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{log.minutes}</TableCell>
                        <TableCell className="text-center text-white font-bold">
                          {log.points}
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          {log.rebounds}
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          {log.assists}
                        </TableCell>
                        <TableCell className="text-center hidden md:table-cell">
                          {log.steals}
                        </TableCell>
                        <TableCell className="text-center hidden md:table-cell">
                          {log.blocks}
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell text-sm">
                          {log.fg_made}-{log.fg_attempted}
                          <span className="text-white/40 text-xs ml-1">
                            ({calculatePercentage(log.fg_made, log.fg_attempted)}%)
                          </span>
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell text-sm">
                          {log.three_made}-{log.three_attempted}
                          <span className="text-white/40 text-xs ml-1">
                            ({calculatePercentage(log.three_made, log.three_attempted)}%)
                          </span>
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell text-sm">
                          {log.ft_made}-{log.ft_attempted}
                          <span className="text-white/40 text-xs ml-1">
                            ({calculatePercentage(log.ft_made, log.ft_attempted)}%)
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-white/40 text-center py-8">
                  No game stats recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
