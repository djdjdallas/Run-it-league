"use client"

import { usePathname } from "next/navigation"
import { leaguePrefix, splitLeaguePath, withBase } from "@/lib/league-path"

// Derives the current league from the URL, so client components do not need
// the league threaded down as a prop.
//
// The default league is served from the site root via a rewrite in
// next.config.js, and usePathname() reports the browser URL rather than the
// rewritten one -- so "/schedule" correctly yields the default league and
// "/l/aapi/schedule" yields aapi.
export function useLeague() {
  const pathname = usePathname()
  const { slug, path } = splitLeaguePath(pathname)

  const basePath = leaguePrefix(slug)

  return {
    slug,
    basePath,
    // Page-relative path, for comparing against nav links regardless of league.
    path,
    // Builds a league-scoped href: lp("/teams") -> "/l/aapi/teams"
    lp: (target) => withBase(basePath, target),
  }
}
