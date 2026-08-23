// Pure path helpers, safe to import from client components.
//
// lib/leagues.js pulls in the server Supabase client (and therefore
// next/headers), so it cannot be imported from a "use client" module. These
// live separately for that reason and are re-exported from lib/leagues.js.

// Must match DEFAULT_LEAGUE_SLUG in next.config.js.
export const DEFAULT_LEAGUE_SLUG = 'run-it'

// The default league is served from the site root, so it has no prefix.
export function leaguePrefix(slugOrLeague) {
  const slug =
    typeof slugOrLeague === 'string' ? slugOrLeague : slugOrLeague?.slug

  if (!slug || slug === DEFAULT_LEAGUE_SLUG) return ''
  return `/l/${slug}`
}

// Splits a browser pathname into its league and the page-relative rest.
//   "/l/aapi/schedule" -> { slug: "aapi",  path: "/schedule" }
//   "/schedule"        -> { slug: null,    path: "/schedule" }
export function splitLeaguePath(pathname) {
  const match = /^\/l\/([^/]+)(\/.*)?$/.exec(pathname || '')
  if (!match) return { slug: null, path: pathname || '/' }
  return { slug: match[1], path: match[2] || '/' }
}

// Builds a league-scoped href. `basePath` is "" for the default league.
export function withBase(basePath, path = '/') {
  if (!basePath) return path
  return path === '/' ? basePath : `${basePath}${path}`
}

// Splits a wordmark for the logo lockup: everything but the last word sits in
// the highlighted block, the last word trails after it. Keeps "RUN IT LEAGUE"
// rendering as [RUN IT] LEAGUE, the way the site has always shown it.
export function splitWordmark(wordmark) {
  const parts = (wordmark || 'RUN IT LEAGUE').trim().split(/\s+/)
  return parts.length > 1
    ? { head: parts.slice(0, -1).join(' '), tail: parts[parts.length - 1] }
    : { head: parts[0], tail: '' }
}
