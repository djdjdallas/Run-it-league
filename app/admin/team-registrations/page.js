import { getTeamRegistrations } from "@/lib/queries"
import TeamRegistrationsClient from "./team-registrations-client"
import { getAdminLeague } from "@/lib/leagues"

export const metadata = {
  title: "Team Registrations - Admin - Run It League",
  description: "Manage team registrations and send invoices",
}

export default async function AdminTeamRegistrationsPage() {
  const league = await getAdminLeague()
  const registrations = await getTeamRegistrations(league.id)

  return <TeamRegistrationsClient initialRegistrations={registrations} />
}
