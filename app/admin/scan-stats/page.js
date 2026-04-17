import { getGames } from "@/lib/queries"
import ScanStatsClient from "./scan-stats-client"

export const metadata = {
  title: "Scan Stats - Admin - Run It League",
  description: "Take a photo of a stat sheet to quickly capture game stats",
}

export default async function ScanStatsPage() {
  const games = await getGames()
  return <ScanStatsClient games={games} />
}
