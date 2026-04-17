import { getStreams, getGames } from "@/lib/queries"
import StreamsClient from "./streams-client"

export const metadata = {
  title: "Streams - Admin - Run It League",
  description: "Manage live streams",
}

export default async function AdminStreamsPage() {
  const [streams, games] = await Promise.all([getStreams(), getGames()])

  return <StreamsClient initialStreams={streams} games={games} />
}
