import { getEvents, getSponsors } from "@/lib/queries"
import { resolveLeague, leagueWordmark } from "@/lib/leagues"
import EventsClient from "./events-client"

export async function generateMetadata({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  return {
    title: `Events - ${league?.name || "Run It League"}`,
    description: "Upcoming events, tryouts, and activities",
  }
}

export default async function EventsPage({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)

  const [events, sponsors] = await Promise.all([
    getEvents(league.id),
    getSponsors(),
  ])

  return <EventsClient wordmark={leagueWordmark(league)} events={events} sponsors={sponsors} />
}
