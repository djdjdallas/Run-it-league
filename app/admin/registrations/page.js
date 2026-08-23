import { getRegistrations, getTeamRegistrations } from "@/lib/queries"
import RegistrationsClient from "./registrations-client"
import { getAdminLeague } from "@/lib/leagues"

export const metadata = {
  title: "Registrations - Admin - Run It League",
  description: "Manage player and team registrations",
}

export default async function AdminRegistrationsPage() {
  const league = await getAdminLeague()
  const [registrations, teamRegistrations] = await Promise.all([
    getRegistrations(league.id),
    getTeamRegistrations(league.id),
  ])

  return (
    <RegistrationsClient
      initialRegistrations={registrations}
      initialTeamRegistrations={teamRegistrations}
    />
  )
}
