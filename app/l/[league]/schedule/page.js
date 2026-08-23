import { getGames, getTeams } from "@/lib/queries"
import { resolveLeague, leagueWordmark } from "@/lib/leagues"
import ScheduleClient from "./schedule-client"

export async function generateMetadata({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  return {
    title: `Schedule - ${league?.name || "Run It League"}`,
    description: "View the full game schedule",
  }
}

export default async function SchedulePage({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)

  const [games, teams] = await Promise.all([
    getGames(league.id),
    getTeams(league.id),
  ])

  return <ScheduleClient wordmark={leagueWordmark(league)} games={games} teams={teams} />
}
