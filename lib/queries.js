import { createServerSupabaseClient } from './supabase-server'

// ============================================
// TEAMS
// ============================================

export async function getTeams() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('wins', { ascending: false })

  if (error) {
    console.error('Error fetching teams:', error)
    return []
  }
  return data || []
}

export async function getTeamById(id) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching team:', error)
    return null
  }
  return data
}

// ============================================
// PLAYERS
// ============================================

export async function getAllPlayers() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('players')
    .select('*, team:teams(*)')
    .order('name')

  if (error) {
    console.error('Error fetching all players:', error)
    return []
  }
  return data || []
}

export async function getPlayers() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('players')
    .select('*, team:teams(*)')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching players:', error)
    return []
  }
  return data || []
}

export async function getPlayerById(id) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('players')
    .select('*, team:teams(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching player:', error)
    return null
  }
  return data
}

export async function getPlayersByTeam(teamId) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .eq('is_active', true)
    .order('number')

  if (error) {
    console.error('Error fetching team players:', error)
    return []
  }
  return data || []
}

// Admin: includes inactive players.
export async function getAllPlayersByTeam(teamId) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('number')

  if (error) {
    console.error('Error fetching all team players:', error)
    return []
  }
  return data || []
}

// ============================================
// GAMES
// ============================================

export async function getGames() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      home_team:teams!games_home_team_id_fkey(*),
      away_team:teams!games_away_team_id_fkey(*)
    `)
    .order('game_date', { ascending: false })

  if (error) {
    console.error('Error fetching games:', error)
    return []
  }
  return data || []
}

export async function getGameById(id) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      home_team:teams!games_home_team_id_fkey(*),
      away_team:teams!games_away_team_id_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching game:', error)
    return null
  }
  return data
}

export async function getGamesByTeam(teamId) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      home_team:teams!games_home_team_id_fkey(*),
      away_team:teams!games_away_team_id_fkey(*)
    `)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order('game_date', { ascending: false })

  if (error) {
    console.error('Error fetching team games:', error)
    return []
  }
  return data || []
}

export async function getRecentGames(limit = 3) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      home_team:teams!games_home_team_id_fkey(*),
      away_team:teams!games_away_team_id_fkey(*)
    `)
    .eq('status', 'final')
    .order('game_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent games:', error)
    return []
  }
  return data || []
}

export async function getUpcomingGames(limit = 3) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      home_team:teams!games_home_team_id_fkey(*),
      away_team:teams!games_away_team_id_fkey(*)
    `)
    .eq('status', 'scheduled')
    .gte('game_date', new Date().toISOString())
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

export async function getPlayerStats() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('player_stats')
    .select('*, player:players(*), game:games(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching player stats:', error)
    return []
  }
  return data || []
}

export async function getStatsByGame(gameId) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('player_stats')
    .select('*, player:players(*)')
    .eq('game_id', gameId)

  if (error) {
    console.error('Error fetching game stats:', error)
    return []
  }
  return data || []
}

export async function getStatsByPlayer(playerId) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('player_stats')
    .select(`
      *,
      game:games(
        *,
        home_team:teams!games_home_team_id_fkey(*),
        away_team:teams!games_away_team_id_fkey(*)
      )
    `)
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching player stats:', error)
    return []
  }
  return data || []
}

export async function getStatsByTeam(teamId) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('player_stats')
    .select('*, player:players(*), game:games(*)')
    .eq('team_id', teamId)

  if (error) {
    console.error('Error fetching team stats:', error)
    return []
  }
  return data || []
}

// Get stat leaders with SQL aggregation
export async function getStatLeaders(stat, limit = 10) {
  const supabase = await createServerSupabaseClient()

  // Map stat name to column
  const statColumns = {
    points: 'points',
    rebounds: 'rebounds',
    assists: 'assists',
    steals: 'steals',
    blocks: 'blocks',
  }

  const column = statColumns[stat] || 'points'

  // Get aggregated stats by player
  const { data, error } = await supabase
    .from('player_stats')
    .select(`
      player_id,
      player:players(*, team:teams(*))
    `)

  if (error) {
    console.error('Error fetching stat leaders:', error)
    return []
  }

  // Aggregate in JavaScript since Supabase doesn't support GROUP BY easily
  const playerTotals = {}

  // Fetch all stats for aggregation
  const { data: allStats, error: statsError } = await supabase
    .from('player_stats')
    .select('player_id, points, rebounds, assists, steals, blocks')

  if (statsError) {
    console.error('Error fetching all stats:', statsError)
    return []
  }

  // Fetch all players for the lookup
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('*, team:teams(*)')
    .eq('is_active', true)

  if (playersError) {
    console.error('Error fetching players:', playersError)
    return []
  }

  const playerMap = {}
  players?.forEach(p => {
    playerMap[p.id] = p
  })

  allStats?.forEach((ps) => {
    if (!playerTotals[ps.player_id]) {
      playerTotals[ps.player_id] = {
        player_id: ps.player_id,
        games: 0,
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
      }
    }
    playerTotals[ps.player_id].games++
    playerTotals[ps.player_id].points += ps.points || 0
    playerTotals[ps.player_id].rebounds += ps.rebounds || 0
    playerTotals[ps.player_id].assists += ps.assists || 0
    playerTotals[ps.player_id].steals += ps.steals || 0
    playerTotals[ps.player_id].blocks += ps.blocks || 0
  })

  // Calculate averages and sort
  const leaders = Object.values(playerTotals)
    .map((pt) => {
      const player = playerMap[pt.player_id]
      return {
        ...pt,
        player,
        avg: pt.games > 0 ? (pt[stat] / pt.games).toFixed(1) : '0.0',
      }
    })
    .filter((l) => l.player)
    .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg))
    .slice(0, limit)

  return leaders
}

// ============================================
// ANNOUNCEMENTS
// ============================================

export async function getAnnouncements() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
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

export async function getGalleryPhotos() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
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

export async function getStreams() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('live_streams')
    .select(`
      *,
      game:games(
        *,
        home_team:teams!games_home_team_id_fkey(*),
        away_team:teams!games_away_team_id_fkey(*)
      )
    `)
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

export async function getEvents() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_public', true)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }
  return data || []
}

// ============================================
// REGISTRATIONS
// ============================================

export async function getRegistrations() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('registrations')
    .select('*, team:teams(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching registrations:', error)
    return []
  }
  return data || []
}

export async function getTeamRegistrations() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('team_registrations')
    .select('*, season:seasons(*), team:teams(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching team registrations:', error)
    return []
  }
  return data || []
}

// ============================================
// DASHBOARD STATS (for admin)
// ============================================

export async function getDashboardStats() {
  const supabase = await createServerSupabaseClient()

  // Get counts in parallel
  const [teamsResult, playersResult, gamesResult, announcementsResult] = await Promise.all([
    supabase.from('teams').select('id', { count: 'exact', head: true }),
    supabase.from('players').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('games').select('id, status'),
    supabase.from('announcements').select('id', { count: 'exact', head: true }),
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
