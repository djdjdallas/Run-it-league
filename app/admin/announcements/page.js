import { getAnnouncements } from "@/lib/queries"
import AnnouncementsClient from "./announcements-client"
import { getAdminLeague } from "@/lib/leagues"

export const metadata = {
  title: "Announcements - Admin - Run It League",
  description: "Manage league announcements",
}

export default async function AdminAnnouncementsPage() {
  const league = await getAdminLeague()
  const announcements = await getAnnouncements(league.id)

  return <AnnouncementsClient initialAnnouncements={announcements} />
}
