import { getAllPlayers, getTeams } from "@/lib/queries"
import PlayersClient from "./players-client"
import { getAdminLeague } from "@/lib/leagues"

export const metadata = {
  title: "Players - Admin - Run It League",
  description: "Manage league players",
}

export default async function AdminPlayersPage() {
  const league = await getAdminLeague()
  const [players, teams] = await Promise.all([
    getAllPlayers(league.id),
    getTeams(league.id),
  ])

  return <PlayersClient leagueId={league.id} initialPlayers={players} teams={teams} />
}
