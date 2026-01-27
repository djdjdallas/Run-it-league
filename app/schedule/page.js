import { getGames, getTeams } from "@/lib/queries"
import ScheduleClient from "./schedule-client"

export const metadata = {
  title: "Schedule - Run It League",
  description: "View the full game schedule",
}

export default async function SchedulePage() {
  const [games, teams] = await Promise.all([
    getGames(),
    getTeams(),
  ])

  return <ScheduleClient games={games} teams={teams} />
}
