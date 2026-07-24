"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { calculateWinPercentage } from "@/lib/utils"

export function StandingsTable({ teams }) {
  // Sort teams by win percentage, then by wins
  const sortedTeams = [...teams].sort((a, b) => {
    const pctA = calculateWinPercentage(a.wins, a.losses)
    const pctB = calculateWinPercentage(b.wins, b.losses)
    if (pctB !== pctA) return pctB - pctA
    return b.wins - a.wins
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-center">W</TableHead>
          <TableHead className="text-center">L</TableHead>
          <TableHead className="text-center">PCT</TableHead>
          <TableHead className="text-center hidden sm:table-cell">GB</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTeams.map((team, index) => {
          const pct = calculateWinPercentage(team.wins, team.losses)
          const firstPlace = sortedTeams[0]
          const firstPct = calculateWinPercentage(firstPlace.wins, firstPlace.losses)
          const gb = index === 0 ? "-" : (
            ((firstPlace.wins - firstPlace.losses) - (team.wins - team.losses)) / 2
          ).toFixed(1)

          return (
            <TableRow key={team.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <Link
                  href={`/teams/${team.id}`}
                  className="flex items-center space-x-3 hover:underline"
                >
                  {team.logo_url ? (
                    <img
                      src={team.logo_url}
                      alt={team.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: team.primary_color || "#000" }}
                    >
                      {team.abbreviation || team.name?.substring(0, 2).toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="font-medium">{team.name}</span>
                </Link>
              </TableCell>
              <TableCell className="text-center">{team.wins}</TableCell>
              <TableCell className="text-center">{team.losses}</TableCell>
              <TableCell className="text-center">{pct.toFixed(3).replace("0.", ".")}</TableCell>
              <TableCell className="text-center hidden sm:table-cell">{gb}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
