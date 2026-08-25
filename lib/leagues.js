import { cache } from 'react'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from './supabase-server'
import { DEFAULT_LEAGUE_SLUG, leaguePrefix, splitLeaguePath, withBase } from './league-path'

// Used until the multi-league migration has been applied. Keeps the site
// serving normally against a pre-migration database: id is null, which
// every query in lib/queries.js treats as "do not filter by league" --
// correct, because before the migration there is only one league's data.
export { DEFAULT_LEAGUE_SLUG, leaguePrefix, splitLeaguePath, withBase }

const FALLBACK_LEAGUE = {
  id: null,
  slug: DEFAULT_LEAGUE_SLUG,
  name: 'Run It League',
  short_name: 'RUN IT',
  tagline: null,
  logo_url: null,
  theme: {},
  is_default: true,
  is_active: true,
  display_order: 0,
}

const LEAGUE_COLUMNS =
  'id, slug, name, short_name, tagline, logo_url, theme, is_default, is_active, display_order'

// A missing `leagues` table means the migration has not run yet. Anything
// else is a real error worth surfacing in the logs.
function isMissingTable(error) {
  return error?.code === '42P01' || /relation .* does not exist/i.test(error?.message || '')
}

// cache() dedupes within a single request, so a page that resolves the
// league and then renders a league-aware header only queries once.
export const getLeagues = cache(async () => {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('leagues')
    .select(LEAGUE_COLUMNS)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    if (!isMissingTable(error)) console.error('Error fetching leagues:', error)
    return [FALLBACK_LEAGUE]
  }
  return data?.length ? data : [FALLBACK_LEAGUE]
})

export const getDefaultLeague = cache(async () => {
  const leagues = await getLeagues()
  return leagues.find((l) => l.is_default) || leagues[0] || FALLBACK_LEAGUE
})

// Returns null for an unknown slug so callers can notFound() on it.
export const getLeagueBySlug = cache(async (slug) => {
  if (!slug) return null
  const leagues = await getLeagues()
  return leagues.find((l) => l.slug === slug) || null
})

// Looks a league up by stored id. Returns null when the id is null, which is
// the pre-migration case.
export const getLeagueById = cache(async (id) => {
  if (!id) return null
  const leagues = await getLeagues()
  return leagues.find((l) => l.id === id) || null
})

// Resolves the league for a route. `slug` is undefined on the root routes,
// which are served by the default league.
export const resolveLeague = cache(async (slug) => {
  return slug ? await getLeagueBySlug(slug) : await getDefaultLeague()
})

// Builds a league-scoped href from a resolved league row.
export function leaguePath(league, path = '/') {
  return withBase(leaguePrefix(league), path)
}

// Maps leagues.theme onto the CSS custom properties defined in
// app/globals.css, so a league re-skins the site without a code change.
// Values are space-separated RGB triples ("27 58 92") to match the
// rgb(var(--neon) / <alpha-value>) tokens in tailwind.config.js.
export function leagueThemeStyle(league) {
  const theme = league?.theme || {}
  const style = {}
  if (theme.accent) style['--neon'] = theme.accent
  // accent2/accent3 fall back to the primary so a partially configured
  // theme cannot leave a token undefined and paint an element black.
  style['--neon-2'] = theme.accent2 || theme.accent || undefined
  style['--neon-3'] = theme.accent3 || theme.accent || undefined

  return Object.fromEntries(Object.entries(style).filter(([, v]) => v))
}

// Artwork committed to the repo for a given league. theme.hero_url still
// wins, so the artwork can be swapped from the database without a deploy;
// this is the fallback so a committed asset works on its own.
const DEFAULT_HERO_BY_SLUG = {
  aapi: "/assets/aapi-league-hero.webp",
}

export function heroUrlFor(league) {
  return league?.theme?.hero_url || DEFAULT_HERO_BY_SLUG[league?.slug] || null
}

export function leaguePattern(league) {
  return league?.theme?.pattern || 'grain'
}

export function leagueWordmark(league) {
  return league?.theme?.wordmark || league?.name || 'RUN IT LEAGUE'
}

// The league the admin panel is currently working in. Set by a cookie so the
// selection survives navigation between admin sections; falls back to the
// default league when unset or pointing at a league that no longer exists.
export const ADMIN_LEAGUE_COOKIE = 'admin_league'

export const getAdminLeague = cache(async () => {
  const store = await cookies()
  const slug = store.get(ADMIN_LEAGUE_COOKIE)?.value
  return (slug ? await getLeagueBySlug(slug) : null) || (await getDefaultLeague())
})
