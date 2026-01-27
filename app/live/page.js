import { getStreams, getSponsors } from "@/lib/queries"
import LiveClient from "./live-client"

export const metadata = {
  title: "Live Games - Run It League",
  description: "Watch live games and replays",
}

export default async function LivePage() {
  const [streams, sponsors] = await Promise.all([
    getStreams(),
    getSponsors(),
  ])

  return <LiveClient streams={streams} sponsors={sponsors} />
}
