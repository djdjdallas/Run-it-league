-- ============================================================
-- Multi-league support
-- ============================================================
-- Adds a `leagues` dimension so Run It League and the Asian &
-- Pacific Islander (AAPI) League can share one codebase, one
-- database and one admin panel while keeping fully separate
-- teams, players, schedules, standings and stats.
--
-- Safe to run more than once. Additive only: no column is
-- dropped and no existing row changes meaning -- everything that
-- exists today is backfilled to Run It League.
--
-- Order matters. Run top to bottom in one go.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Leagues
-- ------------------------------------------------------------

create table if not exists leagues (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,          -- URL segment: /l/aapi
  name text not null,                 -- "Asian & Pacific Islander League"
  short_name text,                    -- nav pill label: "AAPI"
  tagline text,
  logo_url text,
  -- Presentational only. Read by the layout to set CSS variables,
  -- so a league can be re-skinned without a migration.
  --   accent/accent2/accent3 are space-separated RGB triples to
  --   match the --neon custom properties in app/globals.css.
  --   pattern is the background texture utility: grain | seigaiha | tapa
  theme jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz default now()
);

-- Exactly one league may be the default (the one served from "/").
create unique index if not exists idx_leagues_single_default
  on leagues (is_default) where is_default;

create index if not exists idx_leagues_slug on leagues(slug);


-- Seed the two leagues. `on conflict do nothing` keeps re-runs safe
-- and will not clobber theme edits made later from the admin panel.
insert into leagues (slug, name, short_name, tagline, theme, is_default, display_order)
values
  (
    'run-it',
    'Run It League',
    'RUN IT',
    'Las Vegas'' most competitive adult basketball league.',
    '{
       "accent":   "201 43 42",
       "accent2":  "201 43 42",
       "accent3":  "201 43 42",
       "pattern":  "grain",
       "wordmark": "RUN IT LEAGUE"
     }'::jsonb,
    true,
    0
  ),
  (
    'aapi',
    'Asian & Pacific Islander League',
    'AAPI',
    'Asian and Pacific Islander basketball in Las Vegas.',
    '{
       "accent":   "201 43 42",
       "accent2":  "27 58 92",
       "accent3":  "200 150 74",
       "pattern":  "seigaiha",
       "wordmark": "777 RUN IT SPORTS"
     }'::jsonb,
    false,
    1
  )
on conflict (slug) do nothing;


-- Resolves the default league. Used as a column DEFAULT below so that
-- insert paths which do not yet set league_id (the registration API,
-- the Stripe webhook, the roster-completion route) keep working and
-- land in Run It League rather than failing the NOT NULL check.
create or replace function default_league_id()
returns uuid
language sql
stable
as $$
  select id from leagues where is_default limit 1
$$;


-- ------------------------------------------------------------
-- 2. Add league_id columns (nullable first, so backfill can run)
-- ------------------------------------------------------------

alter table teams              add column if not exists league_id uuid references leagues(id) on delete restrict;
alter table games              add column if not exists league_id uuid references leagues(id) on delete restrict;
alter table announcements      add column if not exists league_id uuid references leagues(id) on delete cascade;
alter table live_streams       add column if not exists league_id uuid references leagues(id) on delete cascade;
alter table gallery_photos     add column if not exists league_id uuid references leagues(id) on delete cascade;
alter table events             add column if not exists league_id uuid references leagues(id) on delete cascade;
alter table registrations      add column if not exists league_id uuid references leagues(id) on delete restrict;
alter table team_registrations add column if not exists league_id uuid references leagues(id) on delete restrict;

-- Seasons are league-scoped only when a league runs its own calendar.
-- NULL means "shared season", valid for both leagues at once. Left
-- nullable deliberately so either arrangement works.
alter table seasons add column if not exists league_id uuid references leagues(id) on delete cascade;

-- Players are league-scoped through their team, but team_id is nullable
-- (free agents, and players whose team was deleted). Without a column of
-- their own those players would disappear from BOTH leagues' admin lists.
--
-- So league_id is carried on the row and kept in sync from the team by
-- trigger (section 7b). It is always accurate, which means queries can
-- filter on players.league_id directly instead of joining through teams.
alter table players add column if not exists league_id uuid references leagues(id) on delete restrict;

-- player_stats needs no column: it scopes through team_id -> teams.league_id.


-- ------------------------------------------------------------
-- 3. Backfill everything that exists today to Run It League
-- ------------------------------------------------------------

update teams              set league_id = default_league_id() where league_id is null;
update announcements      set league_id = default_league_id() where league_id is null;
update live_streams       set league_id = default_league_id() where league_id is null;
update gallery_photos     set league_id = default_league_id() where league_id is null;
update events             set league_id = default_league_id() where league_id is null;
update registrations      set league_id = default_league_id() where league_id is null;
update team_registrations set league_id = default_league_id() where league_id is null;

-- Players follow their team; team-less players (free agents) fall back to
-- the default league so they stay visible in a league-scoped list.
update players p
   set league_id = coalesce(
         (select t.league_id from teams t where t.id = p.team_id),
         default_league_id()
       )
 where p.league_id is null;

-- Games inherit from their home team so that any game already tied to a
-- team stays consistent with it; fall back to the default league for
-- orphans.
update games g
   set league_id = coalesce(
         (select t.league_id from teams t where t.id = g.home_team_id),
         default_league_id()
       )
 where g.league_id is null;


-- ------------------------------------------------------------
-- 4. Defaults + NOT NULL
-- ------------------------------------------------------------

alter table teams              alter column league_id set default default_league_id();
alter table games              alter column league_id set default default_league_id();
alter table announcements      alter column league_id set default default_league_id();
alter table live_streams       alter column league_id set default default_league_id();
alter table gallery_photos     alter column league_id set default default_league_id();
alter table events             alter column league_id set default default_league_id();
alter table registrations      alter column league_id set default default_league_id();
alter table team_registrations alter column league_id set default default_league_id();

alter table teams              alter column league_id set not null;
alter table games              alter column league_id set not null;
alter table announcements      alter column league_id set not null;
alter table live_streams       alter column league_id set not null;
alter table gallery_photos     alter column league_id set not null;
alter table events             alter column league_id set not null;
alter table registrations      alter column league_id set not null;
alter table team_registrations alter column league_id set not null;

alter table players alter column league_id set default default_league_id();
alter table players alter column league_id set not null;

-- seasons.league_id stays nullable on purpose: NULL means "shared season".


-- ------------------------------------------------------------
-- 5. Indexes for the league-scoped read paths
-- ------------------------------------------------------------

create index if not exists idx_teams_league              on teams(league_id);
create index if not exists idx_games_league              on games(league_id);
create index if not exists idx_games_league_date         on games(league_id, game_date desc);
create index if not exists idx_games_league_status       on games(league_id, status);
create index if not exists idx_announcements_league      on announcements(league_id);
create index if not exists idx_streams_league            on live_streams(league_id);
create index if not exists idx_gallery_league            on gallery_photos(league_id);
create index if not exists idx_events_league             on events(league_id);
create index if not exists idx_registrations_league      on registrations(league_id);
create index if not exists idx_team_regs_league          on team_registrations(league_id);
create index if not exists idx_seasons_league            on seasons(league_id);
create index if not exists idx_players_league            on players(league_id);


-- ------------------------------------------------------------
-- 6. Sponsors: many-to-many, because a sponsor may back both leagues
-- ------------------------------------------------------------
-- A join table rather than a column, so a sponsor can appear in one
-- league, the other, or both. Existing sponsors are linked to Run It
-- League only, which preserves current behaviour exactly.
--
-- If sponsors should simply be shared across every league, delete this
-- section and skip the join in the sponsor query -- nothing else
-- depends on it.

create table if not exists league_sponsors (
  league_id  uuid references leagues(id)  on delete cascade not null,
  sponsor_id uuid references sponsors(id) on delete cascade not null,
  display_order integer default 0,
  primary key (league_id, sponsor_id)
);

insert into league_sponsors (league_id, sponsor_id, display_order)
select default_league_id(), s.id, coalesce(s.display_order, 0)
  from sponsors s
on conflict do nothing;

create index if not exists idx_league_sponsors_league on league_sponsors(league_id);


-- ------------------------------------------------------------
-- 7. Keep games and teams in the same league
-- ------------------------------------------------------------
-- A CHECK constraint cannot run a subquery, so this is a trigger.
-- Guards against an admin dropdown bug quietly creating a cross-league
-- matchup, which would corrupt both leagues' standings.

create or replace function enforce_game_league_consistency()
returns trigger
language plpgsql
as $$
declare
  home_league uuid;
  away_league uuid;
begin
  select league_id into home_league from teams where id = new.home_team_id;
  select league_id into away_league from teams where id = new.away_team_id;

  if home_league is distinct from new.league_id
     or away_league is distinct from new.league_id then
    raise exception
      'Game league (%) must match both team leagues (home=%, away=%)',
      new.league_id, home_league, away_league;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_game_league_consistency on games;
create trigger trg_game_league_consistency
  before insert or update of home_team_id, away_team_id, league_id on games
  for each row execute function enforce_game_league_consistency();


-- ------------------------------------------------------------
-- 7b. Keep players.league_id in step with their team
-- ------------------------------------------------------------
-- Fires when a player is created or moved between teams. A player with
-- no team keeps whatever league they were last in, which is what makes
-- free agents stay visible.

create or replace function sync_player_league()
returns trigger
language plpgsql
as $$
begin
  if new.team_id is not null then
    select t.league_id into new.league_id from teams t where t.id = new.team_id;
  elsif new.league_id is null then
    new.league_id := default_league_id();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_player_league on players;
create trigger trg_sync_player_league
  before insert or update of team_id on players
  for each row execute function sync_player_league();


-- Moving a team between leagues is only safe while it has no games. Its
-- opponents stay behind, so any existing game would be left pointing at
-- two different leagues -- which the games trigger cannot catch, because
-- it only fires on games. Block the move and make the admin deal with
-- the schedule first.
create or replace function guard_team_league_change()
returns trigger
language plpgsql
as $$
declare
  game_count integer;
begin
  if new.league_id is distinct from old.league_id then
    select count(*) into game_count
      from games
     where home_team_id = new.id or away_team_id = new.id;

    if game_count > 0 then
      raise exception
        'Cannot move team % to another league: % game(s) reference it. '
        'Reassign or delete those games first.',
        old.name, game_count;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_team_league on teams;
create trigger trg_guard_team_league
  before update of league_id on teams
  for each row execute function guard_team_league_change();


-- If a team is ever moved to a different league, its roster moves with
-- it. Without this the roster would be stranded in the old league.
create or replace function cascade_team_league_to_players()
returns trigger
language plpgsql
as $$
begin
  if new.league_id is distinct from old.league_id then
    update players set league_id = new.league_id where team_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_cascade_team_league on teams;
create trigger trg_cascade_team_league
  after update of league_id on teams
  for each row execute function cascade_team_league_to_players();


-- ------------------------------------------------------------
-- 8. Stat leaders as a view
-- ------------------------------------------------------------
-- Replaces the JavaScript aggregation in lib/queries.js getStatLeaders(),
-- which fetched every row of player_stats into Node on each request.
-- Aggregating in Postgres also lets the leaderboard be filtered by
-- league without pulling the other league's rows across the wire.

create or replace view player_stat_totals
with (security_invoker = true)
as
select
  ps.player_id,
  t.league_id,
  count(distinct ps.game_id)                          as games,
  sum(ps.points)                                      as points,
  sum(ps.rebounds)                                    as rebounds,
  sum(ps.assists)                                     as assists,
  sum(ps.steals)                                      as steals,
  sum(ps.blocks)                                      as blocks,
  sum(ps.turnovers)                                   as turnovers,
  sum(ps.fg_made)                                     as fg_made,
  sum(ps.fg_attempted)                                as fg_attempted,
  sum(ps.three_made)                                  as three_made,
  sum(ps.three_attempted)                             as three_attempted,
  sum(ps.ft_made)                                     as ft_made,
  sum(ps.ft_attempted)                                as ft_attempted,
  round(sum(ps.points)::numeric
        / nullif(count(distinct ps.game_id), 0), 1)   as ppg,
  round(sum(ps.rebounds)::numeric
        / nullif(count(distinct ps.game_id), 0), 1)   as rpg,
  round(sum(ps.assists)::numeric
        / nullif(count(distinct ps.game_id), 0), 1)   as apg,
  round(sum(ps.steals)::numeric
        / nullif(count(distinct ps.game_id), 0), 1)   as spg,
  round(sum(ps.blocks)::numeric
        / nullif(count(distinct ps.game_id), 0), 1)   as bpg
from player_stats ps
join teams t on t.id = ps.team_id
group by ps.player_id, t.league_id;

grant select on player_stat_totals to anon, authenticated;


-- ------------------------------------------------------------
-- 9. Row Level Security
-- ------------------------------------------------------------

alter table leagues         enable row level security;
alter table league_sponsors enable row level security;

drop policy if exists "Public read access for leagues" on leagues;
create policy "Public read access for leagues"
  on leagues for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Admin full access for leagues" on leagues;
create policy "Admin full access for leagues"
  on leagues for all
  to authenticated
  using (true);

drop policy if exists "Public read access for league_sponsors" on league_sponsors;
create policy "Public read access for league_sponsors"
  on league_sponsors for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin full access for league_sponsors" on league_sponsors;
create policy "Admin full access for league_sponsors"
  on league_sponsors for all
  to authenticated
  using (true);


-- ------------------------------------------------------------
-- 10. Verification
-- ------------------------------------------------------------
-- Every count below should be 0. Anything else means a backfill was
-- missed and the app will leak rows between leagues.

do $$
declare
  orphans integer;
begin
  select count(*) into orphans from (
    select 1 from teams              where league_id is null
    union all select 1 from games    where league_id is null
    union all select 1 from announcements      where league_id is null
    union all select 1 from live_streams       where league_id is null
    union all select 1 from gallery_photos     where league_id is null
    union all select 1 from events             where league_id is null
    union all select 1 from registrations      where league_id is null
    union all select 1 from team_registrations where league_id is null
    union all select 1 from players           where league_id is null
  ) x;

  if orphans > 0 then
    raise exception 'Migration incomplete: % rows still have a null league_id', orphans;
  end if;

  -- No game may reference a team from a different league.
  select count(*) into orphans
    from games g
    join teams h on h.id = g.home_team_id
    join teams a on a.id = g.away_team_id
   where h.league_id <> g.league_id
      or a.league_id <> g.league_id;

  if orphans > 0 then
    raise exception 'Migration incomplete: % game(s) span two leagues', orphans;
  end if;

  raise notice 'Multi-league migration complete. Leagues: %',
    (select string_agg(slug, ', ' order by display_order) from leagues);
end $$;
