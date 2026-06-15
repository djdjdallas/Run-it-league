-- Auto-maintain team records (wins/losses) from final game results.
--
-- Background: teams.wins / teams.losses are displayed across the app (admin
-- teams table, public standings ordered by wins) but nothing kept them in sync
-- with game results, so they were stuck at their initial value of 0.
--
-- After this migration, a team's record is always derived from games that are
-- marked 'final' with both scores present. The record updates automatically
-- whenever a game is inserted, updated (score/status/teams), or deleted.
-- Ties (equal scores) count as neither a win nor a loss.

-- Recalculate a single team's wins/losses from all of its final games.
create or replace function public.recalc_team_record(p_team_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_team_id is null then
    return;
  end if;

  update teams t
  set
    wins = (
      select count(*)
      from games g
      where g.status = 'final'
        and g.home_score is not null
        and g.away_score is not null
        and (
          (g.home_team_id = p_team_id and g.home_score > g.away_score)
          or (g.away_team_id = p_team_id and g.away_score > g.home_score)
        )
    ),
    losses = (
      select count(*)
      from games g
      where g.status = 'final'
        and g.home_score is not null
        and g.away_score is not null
        and (
          (g.home_team_id = p_team_id and g.home_score < g.away_score)
          or (g.away_team_id = p_team_id and g.away_score < g.home_score)
        )
    )
  where t.id = p_team_id;
end;
$$;

-- Trigger function: recalc the records of every team touched by the change.
create or replace function public.games_sync_team_records()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'DELETE') then
    perform recalc_team_record(old.home_team_id);
    perform recalc_team_record(old.away_team_id);
    return old;
  end if;

  -- INSERT or UPDATE: recalc the teams currently on the game.
  perform recalc_team_record(new.home_team_id);
  perform recalc_team_record(new.away_team_id);

  -- On UPDATE, if the matchup changed, also recalc the teams that were removed.
  if (tg_op = 'UPDATE') then
    if (old.home_team_id is distinct from new.home_team_id) then
      perform recalc_team_record(old.home_team_id);
    end if;
    if (old.away_team_id is distinct from new.away_team_id) then
      perform recalc_team_record(old.away_team_id);
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_games_sync_team_records on public.games;
create trigger trg_games_sync_team_records
  after insert or update or delete on public.games
  for each row execute function public.games_sync_team_records();

-- Backfill existing teams so records reflect games already in the database.
do $$
declare
  t record;
begin
  for t in select id from teams loop
    perform recalc_team_record(t.id);
  end loop;
end;
$$;
