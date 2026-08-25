"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { calculatePercentage } from "@/lib/utils"
import { useLeague } from "@/components/use-league"

export function BoxScore({ stats, team, players }) {
  const { lp } = useLeague()
  // Get players for this team's stats
  const teamStats = stats.map((stat) => {
    const player = players.find((p) => p.id === stat.player_id)
    return { ...stat, player }
  })

  // Sort by points
  teamStats.sort((a, b) => b.points - a.points)

  // Calculate team totals
  const totals = teamStats.reduce(
    (acc, stat) => ({
      minutes: acc.minutes + stat.minutes,
      points: acc.points + stat.points,
      rebounds: acc.rebounds + stat.rebounds,
      assists: acc.assists + stat.assists,
      steals: acc.steals + stat.steals,
      blocks: acc.blocks + stat.blocks,
      turnovers: acc.turnovers + stat.turnovers,
      fouls: acc.fouls + stat.fouls,
      fgMade: acc.fgMade + stat.fg_made,
      fgAttempted: acc.fgAttempted + stat.fg_attempted,
      threeMade: acc.threeMade + stat.three_made,
      threeAttempted: acc.threeAttempted + stat.three_attempted,
      ftMade: acc.ftMade + stat.ft_made,
      ftAttempted: acc.ftAttempted + stat.ft_attempted,
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        {team?.logo_url ? (
          <img
            src={team.logo_url}
            alt={team.name}
            className="w-8 h-8 object-cover"
          />
        ) : (
          <div
            className="w-8 h-8 flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: team?.primary_color || "#666" }}
          >
            {team?.abbreviation || "?"}
          </div>
        )}
        <h3 className="font-display text-lg text-white">{team?.name || "Team"}</h3>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead className="text-center w-12">MIN</TableHead>
            <TableHead className="text-center w-12">PTS</TableHead>
            <TableHead className="text-center w-12 hidden sm:table-cell">REB</TableHead>
            <TableHead className="text-center w-12 hidden sm:table-cell">AST</TableHead>
            <TableHead className="text-center w-12 hidden md:table-cell">STL</TableHead>
            <TableHead className="text-center w-12 hidden md:table-cell">BLK</TableHead>
            <TableHead className="text-center w-12 hidden lg:table-cell">TO</TableHead>
            <TableHead className="text-center w-12 hidden lg:table-cell">PF</TableHead>
            <TableHead className="text-center hidden xl:table-cell">FG</TableHead>
            <TableHead className="text-center hidden xl:table-cell">3PT</TableHead>
            <TableHead className="text-center hidden xl:table-cell">FT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamStats.map((stat) => (
            <TableRow key={stat.id}>
              <TableCell>
                <Link
                  href={lp(`/players/${stat.player?.id}`)}
                  className="text-white/60 hover:text-neon transition-colors"
                >
                  <span className="text-white/40 mr-2">
                    #{stat.player?.number}
                  </span>
                  {stat.player?.name}
                </Link>
              </TableCell>
              <TableCell className="text-center">{stat.minutes}</TableCell>
              <TableCell className="text-center text-white font-bold">{stat.points}</TableCell>
              <TableCell className="text-center hidden sm:table-cell">{stat.rebounds}</TableCell>
              <TableCell className="text-center hidden sm:table-cell">{stat.assists}</TableCell>
              <TableCell className="text-center hidden md:table-cell">{stat.steals}</TableCell>
              <TableCell className="text-center hidden md:table-cell">{stat.blocks}</TableCell>
              <TableCell className="text-center hidden lg:table-cell">{stat.turnovers}</TableCell>
              <TableCell className="text-center hidden lg:table-cell">{stat.fouls}</TableCell>
              <TableCell className="text-center hidden xl:table-cell">
                {stat.fg_made}-{stat.fg_attempted}
                <span className="text-white/40 text-xs ml-1">
                  ({calculatePercentage(stat.fg_made, stat.fg_attempted)}%)
                </span>
              </TableCell>
              <TableCell className="text-center hidden xl:table-cell">
                {stat.three_made}-{stat.three_attempted}
              </TableCell>
              <TableCell className="text-center hidden xl:table-cell">
                {stat.ft_made}-{stat.ft_attempted}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="font-bold">
            <TableCell className="text-white font-bold">TOTALS</TableCell>
            <TableCell className="text-center text-white">{totals.minutes}</TableCell>
            <TableCell className="text-center text-white">{totals.points}</TableCell>
            <TableCell className="text-center text-white hidden sm:table-cell">{totals.rebounds}</TableCell>
            <TableCell className="text-center text-white hidden sm:table-cell">{totals.assists}</TableCell>
            <TableCell className="text-center text-white hidden md:table-cell">{totals.steals}</TableCell>
            <TableCell className="text-center text-white hidden md:table-cell">{totals.blocks}</TableCell>
            <TableCell className="text-center text-white hidden lg:table-cell">{totals.turnovers}</TableCell>
            <TableCell className="text-center text-white hidden lg:table-cell">{totals.fouls}</TableCell>
            <TableCell className="text-center text-white hidden xl:table-cell">
              {totals.fgMade}-{totals.fgAttempted}
              <span className="text-white/40 text-xs ml-1">
                ({calculatePercentage(totals.fgMade, totals.fgAttempted)}%)
              </span>
            </TableCell>
            <TableCell className="text-center text-white hidden xl:table-cell">
              {totals.threeMade}-{totals.threeAttempted}
              <span className="text-white/40 text-xs ml-1">
                ({calculatePercentage(totals.threeMade, totals.threeAttempted)}%)
              </span>
            </TableCell>
            <TableCell className="text-center text-white hidden xl:table-cell">
              {totals.ftMade}-{totals.ftAttempted}
              <span className="text-white/40 text-xs ml-1">
                ({calculatePercentage(totals.ftMade, totals.ftAttempted)}%)
              </span>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
