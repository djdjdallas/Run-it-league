import { getRegistrations } from "@/lib/queries"
import RegistrationsClient from "./registrations-client"

export const metadata = {
  title: "Registrations - Admin - Run It League",
  description: "Manage player registrations",
}

export default async function AdminRegistrationsPage() {
  const registrations = await getRegistrations()

  return <RegistrationsClient initialRegistrations={registrations} />
}
