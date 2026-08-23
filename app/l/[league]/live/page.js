import { getStreams, getSponsors } from "@/lib/queries"
import { resolveLeague, leagueWordmark } from "@/lib/leagues"
import LiveClient from "./live-client"

export async function generateMetadata({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  return {
    title: `Live Games - ${league?.name || "Run It League"}`,
    description: "Watch live games and replays",
  }
}

export default async function LivePage({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)

  const [streams, sponsors] = await Promise.all([
    getStreams(league.id),
    getSponsors(),
  ])

  return <LiveClient wordmark={leagueWordmark(league)} streams={streams} sponsors={sponsors} />
}
