import { getPlayers, getTeams, getPlayerStats } from "@/lib/queries"
import { resolveLeague, leagueWordmark } from "@/lib/leagues"
import PlayersClient from "./players-client"

export async function generateMetadata({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  return {
    title: `Players - ${league?.name || "Run It League"}`,
    description: `View all players in the ${league?.name || "Run It League"}`,
  }
}

export default async function PlayersPage({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)

  const [players, teams, playerStats] = await Promise.all([
    getPlayers(league.id),
    getTeams(league.id),
    getPlayerStats(league.id),
  ])

  return <PlayersClient wordmark={leagueWordmark(league)} players={players} teams={teams} playerStats={playerStats} />
}
