import { getGames } from "@/lib/queries"
import ScanStatsClient from "./scan-stats-client"
import { getAdminLeague } from "@/lib/leagues"

export const metadata = {
  title: "Scan Stats - Admin - Run It League",
  description: "Take a photo of a stat sheet to quickly capture game stats",
}

export default async function ScanStatsPage() {
  const league = await getAdminLeague()
  const games = await getGames(league.id)
  return <ScanStatsClient games={games} />
}
