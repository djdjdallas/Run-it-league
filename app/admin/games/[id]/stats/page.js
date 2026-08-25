import { getGameById, getPlayersByTeam, getStatsByGame } from "@/lib/queries"
import { notFound } from "next/navigation"
import GameStatsClient from "./game-stats-client"
import { getAdminLeague } from "@/lib/leagues"

export async function generateMetadata({ params }) {
  const { id } = await params
  const game = await getGameById(league.id, id)
  if (!game) return { title: "Game Not Found" }

  return {
    title: `Enter Stats - ${game.away_team?.name} @ ${game.home_team?.name} - Admin`,
    description: "Enter game statistics",
  }
}

export default async function GameStatsPage({ params }) {
  const league = await getAdminLeague()
  const { id } = await params
  const game = await getGameById(league.id, id)

  if (!game) {
    notFound()
  }

  const [homeRoster, awayRoster, existingStats] = await Promise.all([
    getPlayersByTeam(league.id, game.home_team_id),
    getPlayersByTeam(league.id, game.away_team_id),
    getStatsByGame(league.id, id),
  ])

  return (
    <GameStatsClient
      game={game}
      homeTeam={game.home_team}
      awayTeam={game.away_team}
      homeRoster={homeRoster}
      awayRoster={awayRoster}
      existingStats={existingStats}
    />
  )
}
