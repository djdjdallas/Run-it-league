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
import { GameCard } from "@/components/game-card"
import { ArrowLeft } from "lucide-react"
import { getTeamById, getPlayersByTeam, getGamesByTeam, getStatsByTeam } from "@/lib/queries"
import { calculateWinPercentage, calculatePercentage } from "@/lib/utils"

export async function generateMetadata({ params }) {
  const { id } = await params
  const team = await getTeamById(id)
  if (!team) return { title: "Team Not Found" }
  return {
    title: `${team.name} - Run It League`,
    description: `View ${team.name}'s roster, stats, and schedule`,
  }
}

export default async function TeamDetailPage({ params }) {
  const { id } = await params
  const [team, roster, teamGames, teamStats] = await Promise.all([
    getTeamById(id),
    getPlayersByTeam(id),
    getGamesByTeam(id),
    getStatsByTeam(id),
  ])

  if (!team) {
    notFound()
  }

  // Calculate player averages
  const playerAverages = roster.map((player) => {
    const playerGameStats = teamStats.filter(
      (ps) => ps.player_id === player.id
    )
    const games = playerGameStats.length

    if (games === 0) {
      return {
        ...player,
        games: 0,
        ppg: 0,
        rpg: 0,
        apg: 0,
        spg: 0,
        bpg: 0,
        fgPct: 0,
        threePct: 0,
        ftPct: 0,
      }
    }

    const totals = playerGameStats.reduce(
      (acc, stat) => ({
        points: acc.points + stat.points,
        rebounds: acc.rebounds + stat.rebounds,
        assists: acc.assists + stat.assists,
        steals: acc.steals + stat.steals,
        blocks: acc.blocks + stat.blocks,
        fgMade: acc.fgMade + stat.fg_made,
        fgAttempted: acc.fgAttempted + stat.fg_attempted,
        threeMade: acc.threeMade + stat.three_made,
        threeAttempted: acc.threeAttempted + stat.three_attempted,
        ftMade: acc.ftMade + stat.ft_made,
        ftAttempted: acc.ftAttempted + stat.ft_attempted,
      }),
      {
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        fgMade: 0,
        fgAttempted: 0,
        threeMade: 0,
        threeAttempted: 0,
        ftMade: 0,
        ftAttempted: 0,
      }
    )

    return {
      ...player,
      games,
      ppg: (totals.points / games).toFixed(1),
      rpg: (totals.rebounds / games).toFixed(1),
      apg: (totals.assists / games).toFixed(1),
      spg: (totals.steals / games).toFixed(1),
      bpg: (totals.blocks / games).toFixed(1),
      fgPct: calculatePercentage(totals.fgMade, totals.fgAttempted),
      threePct: calculatePercentage(totals.threeMade, totals.threeAttempted),
      ftPct: calculatePercentage(totals.ftMade, totals.ftAttempted),
    }
  })

  // Sort by PPG
  playerAverages.sort((a, b) => parseFloat(b.ppg) - parseFloat(a.ppg))

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container py-8">
          {/* Back Button */}
          <Link href="/teams">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Button>
          </Link>

          {/* Team Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            {team.logo_url ? (
              <img
                src={team.logo_url}
                alt={team.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                style={{ backgroundColor: team.primary_color || "#000" }}
              >
                {team.abbreviation || team.name.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">{team.abbreviation}</Badge>
                <span className="text-muted-foreground">
                  {team.wins}-{team.losses} (
                  {calculateWinPercentage(team.wins, team.losses)
                    .toFixed(3)
                    .replace("0.", ".")}
                  )
                </span>
              </div>
            </div>

            <div className="flex gap-8 text-center">
              <div>
                <div className="text-4xl font-bold">{team.wins}</div>
                <div className="text-sm text-muted-foreground">Wins</div>
              </div>
              <div>
                <div className="text-4xl font-bold">{team.losses}</div>
                <div className="text-sm text-muted-foreground">Losses</div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Roster & Stats */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Roster & Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-center hidden sm:table-cell">POS</TableHead>
                        <TableHead className="text-center">GP</TableHead>
                        <TableHead className="text-center">PPG</TableHead>
                        <TableHead className="text-center hidden md:table-cell">RPG</TableHead>
                        <TableHead className="text-center hidden md:table-cell">APG</TableHead>
                        <TableHead className="text-center hidden lg:table-cell">FG%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playerAverages.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">
                            {player.number}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/players/${player.id}`}
                              className="hover:underline font-medium"
                            >
                              {player.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell text-muted-foreground">
                            {player.position}
                          </TableCell>
                          <TableCell className="text-center">{player.games}</TableCell>
                          <TableCell className="text-center font-medium">
                            {player.ppg}
                          </TableCell>
                          <TableCell className="text-center hidden md:table-cell">
                            {player.rpg}
                          </TableCell>
                          <TableCell className="text-center hidden md:table-cell">
                            {player.apg}
                          </TableCell>
                          <TableCell className="text-center hidden lg:table-cell">
                            {player.fgPct}%
                          </TableCell>
                        </TableRow>
                      ))}
                      {playerAverages.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No players on roster.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Schedule */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamGames.length > 0 ? (
                    teamGames.slice(0, 5).map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No games scheduled.
                    </p>
                  )}
                  {teamGames.length > 5 && (
                    <Link href="/schedule" className="block">
                      <Button variant="outline" className="w-full">
                        View Full Schedule
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
