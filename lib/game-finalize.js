// Helpers to keep games.home_score/away_score, games.status, and
// teams.wins/losses in sync with saved player stats.

// Recalculate wins/losses for the given teams from all final games.
export async function recalcTeamRecords(supabase, teamIds) {
  const ids = [...new Set(teamIds.filter(Boolean))]
  if (ids.length === 0) return

  const { data: games, error } = await supabase
    .from("games")
    .select("home_team_id, away_team_id, home_score, away_score")
    .eq("status", "final")

  if (error) {
    console.error("Failed to fetch final games for record recalc:", error)
    return
  }

  for (const teamId of ids) {
    let wins = 0
    let losses = 0
    for (const g of games || []) {
      if (g.home_score == null || g.away_score == null || g.home_score === g.away_score) continue
      if (g.home_team_id === teamId) {
        g.home_score > g.away_score ? wins++ : losses++
      } else if (g.away_team_id === teamId) {
        g.away_score > g.home_score ? wins++ : losses++
      }
    }
    const { error: updateError } = await supabase
      .from("teams")
      .update({ wins, losses })
      .eq("id", teamId)
    if (updateError) {
      console.error("Failed to update team record:", updateError)
    }
  }
}

// Sum saved player stats for a game and, when both teams have stats,
// write the score onto the game, mark it final, and refresh team records.
export async function finalizeGameFromStats(supabase, game) {
  if (!game?.id) return

  const { data: rows, error } = await supabase
    .from("player_stats")
    .select("team_id, points")
    .eq("game_id", game.id)

  if (error || !rows || rows.length === 0) return

  const totals = {}
  for (const row of rows) {
    totals[row.team_id] = (totals[row.team_id] || 0) + (row.points || 0)
  }

  const homeScore = totals[game.home_team_id]
  const awayScore = totals[game.away_team_id]

  // Only finalize once stats exist for both teams — a one-sided sheet
  // would otherwise record a bogus 0 for the missing team.
  if (homeScore == null || awayScore == null) return

  const { error: gameError } = await supabase
    .from("games")
    .update({ home_score: homeScore, away_score: awayScore, status: "final" })
    .eq("id", game.id)

  if (gameError) {
    console.error("Failed to finalize game score:", gameError)
    return
  }

  await recalcTeamRecords(supabase, [game.home_team_id, game.away_team_id])
}
