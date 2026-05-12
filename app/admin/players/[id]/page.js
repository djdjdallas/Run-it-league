import { notFound } from "next/navigation"
import {
  getPlayerById,
  getGamesByTeam,
  getStatsByPlayer,
} from "@/lib/queries"
import PlayerDetailClient from "./player-detail-client"

export async function generateMetadata({ params }) {
  const { id } = await params
  const player = await getPlayerById(id)
  return {
    title: `${player?.name || "Player"} - Admin - Run It League`,
  }
}

export default async function AdminPlayerDetailPage({ params }) {
  const { id } = await params
  const player = await getPlayerById(id)
  if (!player) notFound()

  const [teamGames, stats] = await Promise.all([
    player.team_id ? getGamesByTeam(player.team_id) : Promise.resolve([]),
    getStatsByPlayer(id),
  ])

  return (
    <PlayerDetailClient
      player={player}
      teamGames={teamGames}
      initialStats={stats}
    />
  )
}
