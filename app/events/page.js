import { getEvents, getSponsors } from "@/lib/queries"
import EventsClient from "./events-client"

export const metadata = {
  title: "Events - Run It League",
  description: "Upcoming events, tryouts, and activities",
}

export default async function EventsPage() {
  const [events, sponsors] = await Promise.all([
    getEvents(),
    getSponsors(),
  ])

  return <EventsClient events={events} sponsors={sponsors} />
}
