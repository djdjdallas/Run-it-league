import { createServerSupabaseClient } from './supabase-server'

// ============================================
// LEAGUE SCOPING
// ============================================
//
// Every query below is scoped to a single league. `leagueId` is a required
// first argument, and the two falsy cases mean different things on purpose:
//
//   undefined -> a call site forgot to pass one. Throws, loudly, rather
//                than silently returning another league's rows.
//   null      -> the multi-league migration has not been applied yet, so
//                there is no league_id column to filter on. The query runs
//                unscoped, which is correct: there is only one league's
//                data in a pre-migration database.
//
// See lib/leagues.js, which resolves null when the `leagues` table is
// absent.

function requireLeague(leagueId, fnName) {
  if (leagueId === undefined) {
    throw new Error(
      `${fnName}() was called without a league id. Pass one from ` +
        `resolveLeague() -- see lib/leagues.js. Pass null only to run ` +
        `unscoped against a pre-migration database.`
    )
  }
}

// Filters a query by league unless we are running unscoped (see above).
function scoped(query, leagueId, column = 'league_id') {
  return leagueId === null ? query : query.eq(column, leagueId)
}

// True when the error is "column/table does not exist", i.e. the migration
// has not run. Used by the paths that cannot degrade with a null league.
function isMissingSchema(error) {
  return (
    error?.code === '42P01' ||
    error?.code === '42703' ||
    /relation .* does not exist|column .* does not exist/i.test(error?.message || '')
  )
}

// ============================================
// TEAMS
// ============================================

export async function getTeams(leagueId) {
  requireLeague(leagueId, 'getTeams')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('teams').select('*'),
    leagueId
  ).order('wins', { ascending: false })

  if (error) {
    console.error('Error fetching teams:', error)
    return []
  }
  return data || []
}

export async function getTeamById(leagueId, id) {
  requireLeague(leagueId, 'getTeamById')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('teams').select('*').eq('id', id),
    leagueId
  ).maybeSingle()

  if (error) {
    console.error('Error fetching team:', error)
    return null
  }
  return data
}

// ============================================
// PLAYERS
// ============================================
//
// players.league_id is maintained by trigger from the player's team, and
// is accurate even when team_id is null (free agents). See the migration.

export async function getAllPlayers(leagueId) {
  requireLeague(leagueId, 'getAllPlayers')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('players').select('*, team:teams(*)'),
    leagueId
  ).order('name')

  if (error) {
    console.error('Error fetching all players:', error)
    return []
  }
  return data || []
}

export async function getPlayers(leagueId) {
  requireLeague(leagueId, 'getPlayers')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('players').select('*, team:teams(*)').eq('is_active', true),
    leagueId
  ).order('name')

  if (error) {
    console.error('Error fetching players:', error)
    return []
  }
  return data || []
}

export async function getPlayerById(leagueId, id) {
  requireLeague(leagueId, 'getPlayerById')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('players').select('*, team:teams(*)').eq('id', id),
    leagueId
  ).maybeSingle()

  if (error) {
    console.error('Error fetching player:', error)
    return null
  }
  return data
}

export async function getPlayersByTeam(leagueId, teamId) {
  requireLeague(leagueId, 'getPlayersByTeam')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('players').select('*').eq('team_id', teamId).eq('is_active', true),
    leagueId
  ).order('number')

  if (error) {
    console.error('Error fetching team players:', error)
    return []
  }
  return data || []
}

// Admin: includes inactive players.
export async function getAllPlayersByTeam(leagueId, teamId) {
  requireLeague(leagueId, 'getAllPlayersByTeam')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('players').select('*').eq('team_id', teamId),
    leagueId
  ).order('number')

  if (error) {
    console.error('Error fetching all team players:', error)
    return []
  }
  return data || []
}

// ============================================
// GAMES
// ============================================

const GAME_SELECT = `
  *,
  home_team:teams!games_home_team_id_fkey(*),
  away_team:teams!games_away_team_id_fkey(*)
`

export async function getGames(leagueId) {
  requireLeague(leagueId, 'getGames')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('games').select(GAME_SELECT),
    leagueId
  ).order('game_date', { ascending: false })

  if (error) {
    console.error('Error fetching games:', error)
    return []
  }
  return data || []
}

export async function getGameById(leagueId, id) {
  requireLeague(leagueId, 'getGameById')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('games').select(GAME_SELECT).eq('id', id),
    leagueId
  ).maybeSingle()

  if (error) {
    console.error('Error fetching game:', error)
    return null
  }
  return data
}

export async function getGamesByTeam(leagueId, teamId) {
  requireLeague(leagueId, 'getGamesByTeam')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase
      .from('games')
      .select(GAME_SELECT)
      .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`),
    leagueId
  ).order('game_date', { ascending: false })

  if (error) {
    console.error('Error fetching team games:', error)
    return []
  }
  return data || []
}

export async function getRecentGames(leagueId, limit = 3) {
  requireLeague(leagueId, 'getRecentGames')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('games').select(GAME_SELECT).eq('status', 'final'),
    leagueId
  )
    .order('game_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent games:', error)
    return []
  }
  return data || []
}

export async function getUpcomingGames(leagueId, limit = 3) {
  requireLeague(leagueId, 'getUpcomingGames')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase
      .from('games')
      .select(GAME_SELECT)
      .eq('status', 'scheduled')
      .gte('game_date', new Date().toISOString()),
    leagueId
  )
    .order('game_date', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching upcoming games:', error)
    return []
  }
  return data || []
}

// ============================================
// PLAYER STATS
// ============================================
//
// player_stats carries no league_id of its own; it is scoped through the
// player, whose league_id is trigger-maintained. !inner makes the join a
// filter rather than an optional embed.

export async function getPlayerStats(leagueId) {
  requireLeague(leagueId, 'getPlayerStats')
  const supabase = await createServerSupabaseClient()

  const select =
    leagueId === null
      ? '*, player:players(*), game:games(*)'
      : '*, player:players!inner(*), game:games(*)'

  const { data, error } = await scoped(
    supabase.from('player_stats').select(select),
    leagueId,
    'player.league_id'
  ).order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching player stats:', error)
    return []
  }
  return data || []
}

export async function getStatsByGame(leagueId, gameId) {
  requireLeague(leagueId, 'getStatsByGame')
  const supabase = await createServerSupabaseClient()

  const select = leagueId === null ? '*, player:players(*)' : '*, player:players!inner(*)'

  const { data, error } = await scoped(
    supabase.from('player_stats').select(select).eq('game_id', gameId),
    leagueId,
    'player.league_id'
  )

  if (error) {
    console.error('Error fetching game stats:', error)
    return []
  }
  return data || []
}

export async function getStatsByPlayer(leagueId, playerId) {
  requireLeague(leagueId, 'getStatsByPlayer')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase
      .from('player_stats')
      .select(`*, game:games(${GAME_SELECT})`)
      .eq('player_id', playerId),
    leagueId,
    'game.league_id'
  ).order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching player stats:', error)
    return []
  }
  return data || []
}

export async function getStatsByTeam(leagueId, teamId) {
  requireLeague(leagueId, 'getStatsByTeam')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase
      .from('player_stats')
      .select('*, player:players(*), game:games(*)')
      .eq('team_id', teamId),
    leagueId,
    'team_id'
  )

  if (error) {
    console.error('Error fetching team stats:', error)
    return []
  }
  // team_id already pins the league (a team belongs to exactly one), so the
  // scoped() filter above is a no-op guard rather than a second condition.
  return data || []
}

// ============================================
// STAT LEADERS
// ============================================

const STAT_AVERAGE_COLUMNS = {
  points: 'ppg',
  rebounds: 'rpg',
  assists: 'apg',
  steals: 'spg',
  blocks: 'bpg',
}

// Reads the player_stat_totals view, which aggregates in Postgres. The
// previous implementation pulled every player_stats row into Node and
// summed them per request.
export async function getStatLeaders(leagueId, stat, limit = 10) {
  requireLeague(leagueId, 'getStatLeaders')
  const supabase = await createServerSupabaseClient()

  const statKey = STAT_AVERAGE_COLUMNS[stat] ? stat : 'points'
  const avgColumn = STAT_AVERAGE_COLUMNS[statKey]

  const { data, error } = await scoped(
    supabase
      .from('player_stat_totals')
      .select('*, player:players(*, team:teams(*))'),
    leagueId
  )
    .order(avgColumn, { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    // The view ships with the multi-league migration. Until that has been
    // applied, fall back to aggregating in JS so /stats keeps working.
    if (isMissingSchema(error)) return getStatLeadersFallback(leagueId, statKey, limit)
    console.error('Error fetching stat leaders:', error)
    return []
  }

  return (data || [])
    .filter((row) => row.player)
    .map((row) => ({
      ...row,
      avg: Number(row[avgColumn] ?? 0).toFixed(1),
    }))
}

// Pre-migration path only. Kept deliberately close to the original.
async function getStatLeadersFallback(leagueId, stat, limit) {
  const supabase = await createServerSupabaseClient()

  const [{ data: allStats }, { data: players }] = await Promise.all([
    supabase.from('player_stats').select('player_id, points, rebounds, assists, steals, blocks'),
    supabase.from('players').select('*, team:teams(*)').eq('is_active', true),
  ])

  const playerMap = {}
  players?.forEach((p) => {
    playerMap[p.id] = p
  })

  const totals = {}
  allStats?.forEach((ps) => {
    const t = (totals[ps.player_id] ||= {
      player_id: ps.player_id,
      games: 0,
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
    })
    t.games++
    t.points += ps.points || 0
    t.rebounds += ps.rebounds || 0
    t.assists += ps.assists || 0
    t.steals += ps.steals || 0
    t.blocks += ps.blocks || 0
  })

  return Object.values(totals)
    .map((t) => ({ ...t, player: playerMap[t.player_id], avg: t.games > 0 ? (t[stat] / t.games).toFixed(1) : '0.0' }))
    .filter((l) => l.player)
    .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg))
    .slice(0, limit)
}

// ============================================
// ANNOUNCEMENTS
// ============================================

export async function getAnnouncements(leagueId) {
  requireLeague(leagueId, 'getAnnouncements')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('announcements').select('*'),
    leagueId
  )
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching announcements:', error)
    return []
  }
  return data || []
}

// ============================================
// GALLERY PHOTOS
// ============================================

export async function getGalleryPhotos(leagueId) {
  requireLeague(leagueId, 'getGalleryPhotos')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('gallery_photos').select('*'),
    leagueId
  )
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching gallery photos:', error)
    return []
  }
  return data || []
}

// ============================================
// LIVE STREAMS
// ============================================

export async function getStreams(leagueId) {
  requireLeague(leagueId, 'getStreams')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('live_streams').select(`*, game:games(${GAME_SELECT})`),
    leagueId
  )
    .order('is_live', { ascending: false })
    .order('scheduled_time', { ascending: true })

  if (error) {
    console.error('Error fetching streams:', error)
    return []
  }
  return data || []
}

// ============================================
// SPONSORS
// ============================================
//
// Sponsors are shared across leagues by design -- one roster serves both,
// so these take no league argument.

export async function getAllSponsors() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching all sponsors:', error)
    return []
  }
  return data || []
}

export async function getSponsors() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching sponsors:', error)
    return []
  }
  return data || []
}

// ============================================
// EVENTS
// ============================================

export async function getEvents(leagueId) {
  requireLeague(leagueId, 'getEvents')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('events').select('*').eq('is_public', true),
    leagueId
  ).order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }
  return data || []
}

// ============================================
// REGISTRATIONS
// ============================================

export async function getRegistrations(leagueId) {
  requireLeague(leagueId, 'getRegistrations')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('registrations').select('*, team:teams(*)'),
    leagueId
  ).order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching registrations:', error)
    return []
  }
  return data || []
}

export async function getTeamRegistrations(leagueId) {
  requireLeague(leagueId, 'getTeamRegistrations')
  const supabase = await createServerSupabaseClient()
  const { data, error } = await scoped(
    supabase.from('team_registrations').select('*, season:seasons(*), team:teams(*)'),
    leagueId
  ).order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching team registrations:', error)
    return []
  }
  return data || []
}

// ============================================
// DASHBOARD STATS (for admin)
// ============================================

export async function getDashboardStats(leagueId) {
  requireLeague(leagueId, 'getDashboardStats')
  const supabase = await createServerSupabaseClient()

  const [teamsResult, playersResult, gamesResult, announcementsResult] = await Promise.all([
    scoped(supabase.from('teams').select('id', { count: 'exact', head: true }), leagueId),
    scoped(
      supabase.from('players').select('id', { count: 'exact', head: true }).eq('is_active', true),
      leagueId
    ),
    scoped(supabase.from('games').select('id, status'), leagueId),
    scoped(supabase.from('announcements').select('id', { count: 'exact', head: true }), leagueId),
  ])

  const games = gamesResult.data || []

  return {
    teams: teamsResult.count || 0,
    players: playersResult.count || 0,
    games: games.length,
    completedGames: games.filter((g) => g.status === 'final').length,
    upcomingGames: games.filter((g) => g.status === 'scheduled').length,
    announcements: announcementsResult.count || 0,
  }
}
