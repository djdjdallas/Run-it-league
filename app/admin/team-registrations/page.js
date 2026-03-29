import { getTeamRegistrations } from "@/lib/queries"
import TeamRegistrationsClient from "./team-registrations-client"

export const metadata = {
  title: "Team Registrations - Admin - Run It League",
  description: "Manage team registrations and send invoices",
}

export default async function AdminTeamRegistrationsPage() {
  const registrations = await getTeamRegistrations()

  return <TeamRegistrationsClient initialRegistrations={registrations} />
}
