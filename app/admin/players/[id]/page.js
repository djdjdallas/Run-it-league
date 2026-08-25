import { notFound } from "next/navigation"
import {
  getPlayerById,
  getGamesByTeam,
  getStatsByPlayer,
} from "@/lib/queries"
import { getAdminLeague } from "@/lib/leagues"
import PlayerDetailClient from "./player-detail-client"

export async function generateMetadata({ params }) {
  const { id } = await params
  const league = await getAdminLeague()
  const player = await getPlayerById(league.id, id)
  return {
    title: `${player?.name || "Player"} - Admin - Run It League`,
  }
}

export default async function AdminPlayerDetailPage({ params }) {
  const { id } = await params
  const league = await getAdminLeague()
  const player = await getPlayerById(league.id, id)
  if (!player) notFound()

  const [teamGames, stats] = await Promise.all([
    player.team_id ? getGamesByTeam(league.id, player.team_id) : Promise.resolve([]),
    getStatsByPlayer(league.id, id),
  ])

  return (
    <PlayerDetailClient
      player={player}
      teamGames={teamGames}
      initialStats={stats}
    />
  )
}
