import { getAllSponsors } from "@/lib/queries"
import SponsorsClient from "./sponsors-client"

export const metadata = {
  title: "Sponsors - Admin - Run It League",
  description: "Manage league sponsors",
}

export default async function AdminSponsorsPage() {
  const sponsors = await getAllSponsors()

  return <SponsorsClient initialSponsors={sponsors} />
}
