import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
    const result = game
      ? isHome
        ? game.home_score > game.away_score
          ? "W"
          : "L"
        : game.away_score > game.home_score
        ? "W"
        : "L"
      : "-"
    const score = game
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
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container py-8">
          {/* Back Button */}
          <Link href="/players">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Players
            </Button>
          </Link>

          {/* Player Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            {player.photo_url ? (
              <img
                src={player.photo_url}
                alt={player.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold"
                style={{ backgroundColor: team?.primary_color || "#666" }}
              >
                {player.number || "?"}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{player.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {team && (
                  <Link href={`/teams/${team.id}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                    >
                      {team.name}
                    </Badge>
                  </Link>
                )}
                <Badge variant="secondary">#{player.number}</Badge>
                <Badge variant="secondary">{player.position}</Badge>
                {player.height && (
                  <span className="text-muted-foreground">{player.height}</span>
                )}
              </div>
            </div>
          </div>

          {/* Season Averages */}
          {averages && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Season Averages ({games} Games)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{averages.ppg}</div>
                    <div className="text-xs text-muted-foreground">PPG</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{averages.rpg}</div>
                    <div className="text-xs text-muted-foreground">RPG</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{averages.apg}</div>
                    <div className="text-xs text-muted-foreground">APG</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{averages.spg}</div>
                    <div className="text-xs text-muted-foreground">SPG</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{averages.bpg}</div>
                    <div className="text-xs text-muted-foreground">BPG</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{averages.mpg}</div>
                    <div className="text-xs text-muted-foreground">MPG</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{averages.fgPct}%</div>
                    <div className="text-xs text-muted-foreground">FG%</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{averages.threePct}%</div>
                    <div className="text-xs text-muted-foreground">3P%</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{averages.ftPct}%</div>
                    <div className="text-xs text-muted-foreground">FT%</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{averages.topg}</div>
                    <div className="text-xs text-muted-foreground">TOPG</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{averages.fpg}</div>
                    <div className="text-xs text-muted-foreground">FPG</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Game Log */}
          <Card>
            <CardHeader>
              <CardTitle>Game Log</CardTitle>
            </CardHeader>
            <CardContent>
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
                        <TableCell className="text-sm">
                          {log.game ? formatDate(log.game.game_date) : "-"}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/teams/${log.opponent?.id}`}
                            className="hover:underline"
                          >
                            {log.isHome ? "vs " : "@ "}
                            {log.opponent?.abbreviation || "-"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={
                              log.result === "W"
                                ? "text-green-600 font-medium"
                                : log.result === "L"
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            {log.result}
                          </span>
                          <span className="text-muted-foreground text-sm ml-1">
                            {log.score}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{log.minutes}</TableCell>
                        <TableCell className="text-center font-medium">
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
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell text-sm">
                          {log.three_made}-{log.three_attempted}
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell text-sm">
                          {log.ft_made}-{log.ft_attempted}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No game stats recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
