import { getTeams } from "@/lib/queries"
import TeamsClient from "./teams-client"

export const metadata = {
  title: "Teams - Admin - Run It League",
  description: "Manage league teams",
}

export default async function AdminTeamsPage() {
  const teams = await getTeams()

  return <TeamsClient initialTeams={teams} />
}
