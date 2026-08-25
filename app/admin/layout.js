import { getLeagues, getAdminLeague } from "@/lib/leagues"
import { AdminShell } from "./admin-shell"

export default async function AdminLayout({ children }) {
  // Resolved here rather than in the shell, which is a client component and
  // cannot query. Both are request-cached.
  const [leagues, adminLeague] = await Promise.all([getLeagues(), getAdminLeague()])

  return (
    <AdminShell leagues={leagues} currentLeagueSlug={adminLeague.slug}>
      {children}
    </AdminShell>
  )
}
