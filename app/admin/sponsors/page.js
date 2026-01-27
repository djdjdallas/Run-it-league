import { getSponsors } from "@/lib/queries"
import SponsorsClient from "./sponsors-client"

export const metadata = {
  title: "Sponsors - Admin - Run It League",
  description: "Manage league sponsors",
}

export default async function AdminSponsorsPage() {
  const sponsors = await getSponsors()

  return <SponsorsClient initialSponsors={sponsors} />
}
