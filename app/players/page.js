import { getPlayers, getTeams, getPlayerStats } from "@/lib/queries"
import PlayersClient from "./players-client"

export const metadata = {
  title: "Players - Run It League",
  description: "View all players in the Run It League",
}

export default async function PlayersPage() {
  const [players, teams, playerStats] = await Promise.all([
    getPlayers(),
    getTeams(),
    getPlayerStats(),
  ])

  return <PlayersClient players={players} teams={teams} playerStats={playerStats} />
}
