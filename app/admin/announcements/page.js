import { getAnnouncements } from "@/lib/queries"
import AnnouncementsClient from "./announcements-client"

export const metadata = {
  title: "Announcements - Admin - Run It League",
  description: "Manage league announcements",
}

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements()

  return <AnnouncementsClient initialAnnouncements={announcements} />
}
