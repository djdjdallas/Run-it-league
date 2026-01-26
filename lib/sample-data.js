// Sample data for development/demo purposes
// This will be replaced by Supabase data in production

export const sampleTeams = [
  {
    id: "team-1",
    name: "Thunder Hawks",
    abbreviation: "THK",
    primary_color: "#1E3A8A",
    secondary_color: "#F59E0B",
    wins: 8,
    losses: 2,
    logo_url: null,
  },
  {
    id: "team-2",
    name: "Fire Dragons",
    abbreviation: "FDR",
    primary_color: "#DC2626",
    secondary_color: "#FCD34D",
    wins: 7,
    losses: 3,
    logo_url: null,
  },
  {
    id: "team-3",
    name: "Storm Chasers",
    abbreviation: "STC",
    primary_color: "#059669",
    secondary_color: "#FFFFFF",
    wins: 6,
    losses: 4,
    logo_url: null,
  },
  {
    id: "team-4",
    name: "Night Owls",
    abbreviation: "NOW",
    primary_color: "#6B21A8",
    secondary_color: "#E5E7EB",
    wins: 5,
    losses: 5,
    logo_url: null,
  },
  {
    id: "team-5",
    name: "Steel Knights",
    abbreviation: "STK",
    primary_color: "#374151",
    secondary_color: "#F3F4F6",
    wins: 3,
    losses: 7,
    logo_url: null,
  },
  {
    id: "team-6",
    name: "Golden Eagles",
    abbreviation: "GLE",
    primary_color: "#D97706",
    secondary_color: "#1F2937",
    wins: 1,
    losses: 9,
    logo_url: null,
  },
]

export const samplePlayers = [
  // Thunder Hawks
  { id: "player-1", team_id: "team-1", name: "Marcus Johnson", number: 23, position: "SG", height: "6'4\"", is_active: true },
  { id: "player-2", team_id: "team-1", name: "DeShawn Williams", number: 11, position: "PG", height: "6'1\"", is_active: true },
  { id: "player-3", team_id: "team-1", name: "Jamal Carter", number: 34, position: "PF", height: "6'8\"", is_active: true },
  { id: "player-4", team_id: "team-1", name: "Tony Davis", number: 5, position: "SF", height: "6'6\"", is_active: true },
  { id: "player-5", team_id: "team-1", name: "Chris Robinson", number: 15, position: "C", height: "6'10\"", is_active: true },

  // Fire Dragons
  { id: "player-6", team_id: "team-2", name: "Kevin Brooks", number: 3, position: "PG", height: "6'2\"", is_active: true },
  { id: "player-7", team_id: "team-2", name: "Andre Mitchell", number: 21, position: "SG", height: "6'5\"", is_active: true },
  { id: "player-8", team_id: "team-2", name: "Rashad Thompson", number: 44, position: "C", height: "6'11\"", is_active: true },
  { id: "player-9", team_id: "team-2", name: "Michael Harris", number: 7, position: "SF", height: "6'7\"", is_active: true },
  { id: "player-10", team_id: "team-2", name: "Brandon Lee", number: 30, position: "PF", height: "6'8\"", is_active: true },

  // Storm Chasers
  { id: "player-11", team_id: "team-3", name: "Tyler Green", number: 12, position: "PG", height: "6'0\"", is_active: true },
  { id: "player-12", team_id: "team-3", name: "Isaiah Jackson", number: 25, position: "SG", height: "6'4\"", is_active: true },
  { id: "player-13", team_id: "team-3", name: "Darius Moore", number: 32, position: "SF", height: "6'6\"", is_active: true },
  { id: "player-14", team_id: "team-3", name: "Jerome White", number: 50, position: "C", height: "6'9\"", is_active: true },
  { id: "player-15", team_id: "team-3", name: "Eric Taylor", number: 8, position: "PF", height: "6'7\"", is_active: true },
]

export const sampleGames = [
  // Recent games (final)
  {
    id: "game-1",
    home_team_id: "team-1",
    away_team_id: "team-2",
    game_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Main Gym",
    home_score: 78,
    away_score: 72,
    status: "final",
    home_team: sampleTeams[0],
    away_team: sampleTeams[1],
  },
  {
    id: "game-2",
    home_team_id: "team-3",
    away_team_id: "team-4",
    game_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Community Center",
    home_score: 65,
    away_score: 68,
    status: "final",
    home_team: sampleTeams[2],
    away_team: sampleTeams[3],
  },
  {
    id: "game-3",
    home_team_id: "team-5",
    away_team_id: "team-6",
    game_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Main Gym",
    home_score: 82,
    away_score: 79,
    status: "final",
    home_team: sampleTeams[4],
    away_team: sampleTeams[5],
  },
  // Upcoming games
  {
    id: "game-4",
    home_team_id: "team-1",
    away_team_id: "team-3",
    game_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Main Gym",
    home_score: null,
    away_score: null,
    status: "scheduled",
    home_team: sampleTeams[0],
    away_team: sampleTeams[2],
  },
  {
    id: "game-5",
    home_team_id: "team-2",
    away_team_id: "team-4",
    game_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Community Center",
    home_score: null,
    away_score: null,
    status: "scheduled",
    home_team: sampleTeams[1],
    away_team: sampleTeams[3],
  },
  {
    id: "game-6",
    home_team_id: "team-5",
    away_team_id: "team-1",
    game_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Main Gym",
    home_score: null,
    away_score: null,
    status: "scheduled",
    home_team: sampleTeams[4],
    away_team: sampleTeams[0],
  },
]

export const sampleAnnouncements = [
  {
    id: "ann-1",
    title: "Welcome to the Spring 2025 Season!",
    content: "The new season kicks off this weekend. Check the schedule for game times and locations. Good luck to all teams!",
    is_pinned: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ann-2",
    title: "Gym Closure Notice",
    content: "The Main Gym will be closed for maintenance on March 15th. All games scheduled for that day have been moved to the Community Center.",
    is_pinned: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const samplePlayerStats = [
  // Game 1 stats - Thunder Hawks vs Fire Dragons
  { id: "stat-1", game_id: "game-1", player_id: "player-1", team_id: "team-1", minutes: 32, points: 24, rebounds: 5, assists: 4, steals: 2, blocks: 0, turnovers: 2, fouls: 2, fg_made: 9, fg_attempted: 16, three_made: 2, three_attempted: 5, ft_made: 4, ft_attempted: 4 },
  { id: "stat-2", game_id: "game-1", player_id: "player-2", team_id: "team-1", minutes: 30, points: 18, rebounds: 3, assists: 8, steals: 3, blocks: 0, turnovers: 4, fouls: 1, fg_made: 7, fg_attempted: 12, three_made: 2, three_attempted: 4, ft_made: 2, ft_attempted: 2 },
  { id: "stat-3", game_id: "game-1", player_id: "player-3", team_id: "team-1", minutes: 28, points: 16, rebounds: 10, assists: 2, steals: 0, blocks: 2, turnovers: 1, fouls: 3, fg_made: 7, fg_attempted: 11, three_made: 0, three_attempted: 1, ft_made: 2, ft_attempted: 4 },
  { id: "stat-4", game_id: "game-1", player_id: "player-4", team_id: "team-1", minutes: 26, points: 12, rebounds: 4, assists: 3, steals: 1, blocks: 1, turnovers: 2, fouls: 2, fg_made: 5, fg_attempted: 10, three_made: 2, three_attempted: 4, ft_made: 0, ft_attempted: 0 },
  { id: "stat-5", game_id: "game-1", player_id: "player-5", team_id: "team-1", minutes: 24, points: 8, rebounds: 8, assists: 1, steals: 0, blocks: 3, turnovers: 1, fouls: 4, fg_made: 4, fg_attempted: 6, three_made: 0, three_attempted: 0, ft_made: 0, ft_attempted: 2 },

  { id: "stat-6", game_id: "game-1", player_id: "player-6", team_id: "team-2", minutes: 34, points: 22, rebounds: 4, assists: 9, steals: 2, blocks: 0, turnovers: 3, fouls: 2, fg_made: 8, fg_attempted: 15, three_made: 3, three_attempted: 7, ft_made: 3, ft_attempted: 3 },
  { id: "stat-7", game_id: "game-1", player_id: "player-7", team_id: "team-2", minutes: 32, points: 19, rebounds: 5, assists: 2, steals: 1, blocks: 0, turnovers: 2, fouls: 3, fg_made: 7, fg_attempted: 14, three_made: 3, three_attempted: 6, ft_made: 2, ft_attempted: 2 },
  { id: "stat-8", game_id: "game-1", player_id: "player-8", team_id: "team-2", minutes: 28, points: 14, rebounds: 11, assists: 1, steals: 0, blocks: 4, turnovers: 2, fouls: 4, fg_made: 6, fg_attempted: 10, three_made: 0, three_attempted: 0, ft_made: 2, ft_attempted: 4 },
  { id: "stat-9", game_id: "game-1", player_id: "player-9", team_id: "team-2", minutes: 26, points: 10, rebounds: 6, assists: 3, steals: 2, blocks: 1, turnovers: 1, fouls: 2, fg_made: 4, fg_attempted: 9, three_made: 1, three_attempted: 3, ft_made: 1, ft_attempted: 2 },
  { id: "stat-10", game_id: "game-1", player_id: "player-10", team_id: "team-2", minutes: 20, points: 7, rebounds: 5, assists: 1, steals: 0, blocks: 0, turnovers: 1, fouls: 3, fg_made: 3, fg_attempted: 7, three_made: 1, three_attempted: 2, ft_made: 0, ft_attempted: 0 },
]

// Helper function to get stat leaders
export function getStatLeaders(playerStats, players, stat, limit = 5) {
  // Aggregate stats by player
  const playerTotals = {}

  playerStats.forEach((ps) => {
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
    playerTotals[ps.player_id].points += ps.points
    playerTotals[ps.player_id].rebounds += ps.rebounds
    playerTotals[ps.player_id].assists += ps.assists
    playerTotals[ps.player_id].steals += ps.steals
    playerTotals[ps.player_id].blocks += ps.blocks
  })

  // Calculate averages and sort
  const leaders = Object.values(playerTotals)
    .map((pt) => {
      const player = players.find((p) => p.id === pt.player_id)
      return {
        ...pt,
        player,
        avg: pt.games > 0 ? (pt[stat] / pt.games).toFixed(1) : 0,
      }
    })
    .filter((l) => l.player)
    .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg))
    .slice(0, limit)

  return leaders
}
