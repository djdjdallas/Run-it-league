"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { ADMIN_LEAGUE_COOKIE, getLeagues } from "@/lib/leagues"

// Switches which league the admin panel is working in. Every admin page
// resolves its data through getAdminLeague(), so changing the cookie and
// revalidating is enough -- no page needs to know about the switch.
export async function selectAdminLeague(slug) {
  const leagues = await getLeagues()

  // Only accept a slug that names a real, active league. The value is echoed
  // straight back into queries, so it should never be free-form.
  if (!leagues.some((l) => l.slug === slug)) {
    throw new Error(`Unknown league: ${slug}`)
  }

  const store = await cookies()
  store.set(ADMIN_LEAGUE_COOKIE, slug, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  })

  revalidatePath("/admin", "layout")
}
