import { getGames, getTeams } from "@/lib/queries"
import GamesClient from "./games-client"

export const metadata = {
  title: "Games - Admin - Run It League",
  description: "Manage game schedule and results",
}

export default async function AdminGamesPage() {
  const [games, teams] = await Promise.all([
    getGames(),
    getTeams(),
  ])

  return <GamesClient initialGames={games} teams={teams} />
}
