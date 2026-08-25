import { notFound } from "next/navigation"
import { resolveLeague, leagueThemeStyle, leaguePattern } from "@/lib/leagues"

// Wraps every league-scoped page. Setting the accent variables here means a
// league re-skins the whole subtree without any component knowing about it --
// see the `neon` token in tailwind.config.js.
export default async function LeagueLayout({ children, params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)

  if (!league) notFound()

  return (
    <div
      data-league={league.slug}
      data-pattern={leaguePattern(league)}
      style={leagueThemeStyle(league)}
    >
      {children}
    </div>
  )
}
