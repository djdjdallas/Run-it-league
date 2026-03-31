import { getRegistrations, getTeamRegistrations } from "@/lib/queries"
import RegistrationsClient from "./registrations-client"

export const metadata = {
  title: "Registrations - Admin - Run It League",
  description: "Manage player and team registrations",
}

export default async function AdminRegistrationsPage() {
  const [registrations, teamRegistrations] = await Promise.all([
    getRegistrations(),
    getTeamRegistrations(),
  ])

  return (
    <RegistrationsClient
      initialRegistrations={registrations}
      initialTeamRegistrations={teamRegistrations}
    />
  )
}
