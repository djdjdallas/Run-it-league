-- Backfill final scores from saved player stats.
-- Run in: Supabase Dashboard -> SQL Editor (runs as postgres, bypasses RLS).
-- Idempotent: recomputes from player_stats each time.

-- 1. Finalize every game where BOTH teams have nonzero stat totals
WITH totals AS (
  SELECT game_id, team_id, SUM(points) AS pts
  FROM public.player_stats
  GROUP BY game_id, team_id
),
scored AS (
  SELECT g.id, h.pts AS home_pts, a.pts AS away_pts
  FROM public.games g
  JOIN totals h ON h.game_id = g.id AND h.team_id = g.home_team_id
  JOIN totals a ON a.game_id = g.id AND a.team_id = g.away_team_id
  WHERE h.pts > 0 AND a.pts > 0
)
UPDATE public.games g
SET home_score = s.home_pts,
    away_score = s.away_pts,
    status = 'final'
FROM scored s
WHERE g.id = s.id;

-- 2. Recalculate wins/losses for every team from all final games
WITH outcomes AS (
  SELECT home_team_id AS team_id, home_score > away_score AS won
  FROM public.games
  WHERE status = 'final' AND home_score IS NOT NULL AND away_score IS NOT NULL AND home_score <> away_score
  UNION ALL
  SELECT away_team_id, away_score > home_score
  FROM public.games
  WHERE status = 'final' AND home_score IS NOT NULL AND away_score IS NOT NULL AND home_score <> away_score
),
records AS (
  SELECT team_id,
         COUNT(*) FILTER (WHERE won)     AS wins,
         COUNT(*) FILTER (WHERE NOT won) AS losses
  FROM outcomes
  GROUP BY team_id
)
UPDATE public.teams t
SET wins = r.wins,
    losses = r.losses
FROM records r
WHERE r.team_id = t.id;

-- 3. Show the results
SELECT ht.name AS home, g.home_score, g.away_score, aw.name AS away, g.status, g.game_date::date
FROM public.games g
JOIN public.teams ht ON ht.id = g.home_team_id
JOIN public.teams aw ON aw.id = g.away_team_id
WHERE g.status = 'final'
ORDER BY g.game_date;

SELECT name, wins, losses FROM public.teams ORDER BY wins DESC, losses ASC, name;
