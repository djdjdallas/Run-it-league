import { getPlayers, getTeams } from "@/lib/queries"
import PlayersClient from "./players-client"

export const metadata = {
  title: "Players - Admin - Run It League",
  description: "Manage league players",
}

export default async function AdminPlayersPage() {
  const [players, teams] = await Promise.all([
    getPlayers(),
    getTeams(),
  ])

  return <PlayersClient initialPlayers={players} teams={teams} />
}
