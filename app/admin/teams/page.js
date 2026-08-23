import { getTeams } from "@/lib/queries"
import TeamsClient from "./teams-client"
import { getAdminLeague } from "@/lib/leagues"

export const metadata = {
  title: "Teams - Admin - Run It League",
  description: "Manage league teams",
}

export default async function AdminTeamsPage() {
  const league = await getAdminLeague()
  const teams = await getTeams(league.id)

  return <TeamsClient initialTeams={teams} />
}
