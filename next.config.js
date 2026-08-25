/** @type {import('next').NextConfig} */

// The public pages live under app/l/[league]/. The default league is served
// from the site root instead of /l/run-it, so every URL the site already has
// -- and its search ranking -- is preserved.
//
// Must match the league seeded with is_default = true in
// supabase/migrations/20260823_multi_league.sql. Also exported from
// lib/leagues.js as DEFAULT_LEAGUE_SLUG; next.config.js is CommonJS and
// cannot import it.
const DEFAULT_LEAGUE_SLUG = 'run-it'

// Top-level public sections. Anything not listed here (admin, api, register,
// team-roster) is untouched and keeps serving from app/ directly.
const LEAGUE_SECTIONS = [
  'register',
  'teams',
  'players',
  'schedule',
  'stats',
  'live',
  'gallery',
  'events',
  'games',
]

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  async redirects() {
    // Give every page one canonical URL. Without this the default league
    // answers on both / and /l/run-it, which splits search ranking.
    //
    // Redirects run before rewrites, so /l/run-it/teams redirects out to
    // /teams, which is then rewritten back internally. The rewrite does not
    // re-enter the redirect stage, so this does not loop.
    return [
      {
        source: `/l/${DEFAULT_LEAGUE_SLUG}`,
        destination: '/',
        permanent: false,
      },
      {
        source: `/l/${DEFAULT_LEAGUE_SLUG}/:path*`,
        destination: '/:path*',
        permanent: false,
      },
    ]
  },

  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: `/l/${DEFAULT_LEAGUE_SLUG}` },
        ...LEAGUE_SECTIONS.map((section) => ({
          source: `/${section}`,
          destination: `/l/${DEFAULT_LEAGUE_SLUG}/${section}`,
        })),
        ...LEAGUE_SECTIONS.map((section) => ({
          source: `/${section}/:path*`,
          destination: `/l/${DEFAULT_LEAGUE_SLUG}/${section}/:path*`,
        })),
      ],
    }
  },
}

module.exports = nextConfig
