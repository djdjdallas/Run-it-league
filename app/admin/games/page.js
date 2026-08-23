import { getGames, getTeams } from "@/lib/queries"
import GamesClient from "./games-client"
import { getAdminLeague } from "@/lib/leagues"

export const metadata = {
  title: "Games - Admin - Run It League",
  description: "Manage game schedule and results",
}

export default async function AdminGamesPage() {
  const league = await getAdminLeague()
  const [games, teams] = await Promise.all([
    getGames(league.id),
    getTeams(league.id),
  ])

  return <GamesClient initialGames={games} teams={teams} />
}
