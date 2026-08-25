import { getStreams, getGames } from "@/lib/queries"
import StreamsClient from "./streams-client"
import { getAdminLeague } from "@/lib/leagues"

export const metadata = {
  title: "Streams - Admin - Run It League",
  description: "Manage live streams",
}

export default async function AdminStreamsPage() {
  const league = await getAdminLeague()
  const [streams, games] = await Promise.all([getStreams(league.id), getGames(league.id)])

  return <StreamsClient leagueId={league.id} initialStreams={streams} games={games} />
}
