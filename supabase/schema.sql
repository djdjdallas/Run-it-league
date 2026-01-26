-- Run It League Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Seasons table (for historical tracking)
create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- "Spring 2025", "Summer 2025"
  start_date date,
  end_date date,
  is_current boolean default false,
  created_at timestamptz default now()
);

-- Teams table
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text,
  logo_url text,
  primary_color text default '#000000',
  secondary_color text default '#FFFFFF',
  season_id uuid references seasons(id) on delete set null,
  wins integer default 0,
  losses integer default 0,
  created_at timestamptz default now()
);

-- Players table
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete set null,
  name text not null,
  number integer,
  position text, -- PG, SG, SF, PF, C
  height text, -- "6'2"
  photo_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Games table
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid references teams(id) not null,
  away_team_id uuid references teams(id) not null,
  game_date timestamptz not null,
  location text,
  home_score integer,
  away_score integer,
  status text default 'scheduled', -- scheduled, in_progress, final
  stat_sheet_url text, -- stored image of handwritten stats
  season_id uuid references seasons(id) on delete set null,
  created_at timestamptz default now()
);

-- Player Game Stats table
create table if not exists player_stats (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade not null,
  player_id uuid references players(id) on delete cascade not null,
  team_id uuid references teams(id) not null,
  minutes integer default 0,
  points integer default 0,
  rebounds integer default 0,
  assists integer default 0,
  steals integer default 0,
  blocks integer default 0,
  turnovers integer default 0,
  fouls integer default 0,
  fg_made integer default 0,
  fg_attempted integer default 0,
  three_made integer default 0,
  three_attempted integer default 0,
  ft_made integer default 0,
  ft_attempted integer default 0,
  created_at timestamptz default now(),
  unique(game_id, player_id)
);

-- Announcements table
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  is_pinned boolean default false,
  created_at timestamptz default now()
);

-- Create indexes for better query performance
create index if not exists idx_players_team_id on players(team_id);
create index if not exists idx_games_home_team on games(home_team_id);
create index if not exists idx_games_away_team on games(away_team_id);
create index if not exists idx_games_date on games(game_date);
create index if not exists idx_games_status on games(status);
create index if not exists idx_player_stats_game on player_stats(game_id);
create index if not exists idx_player_stats_player on player_stats(player_id);
create index if not exists idx_teams_season on teams(season_id);
create index if not exists idx_games_season on games(season_id);

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
alter table seasons enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table games enable row level security;
alter table player_stats enable row level security;
alter table announcements enable row level security;

-- Public read access for all tables (anyone can view)
create policy "Public read access for seasons"
  on seasons for select
  to anon, authenticated
  using (true);

create policy "Public read access for teams"
  on teams for select
  to anon, authenticated
  using (true);

create policy "Public read access for players"
  on players for select
  to anon, authenticated
  using (true);

create policy "Public read access for games"
  on games for select
  to anon, authenticated
  using (true);

create policy "Public read access for player_stats"
  on player_stats for select
  to anon, authenticated
  using (true);

create policy "Public read access for announcements"
  on announcements for select
  to anon, authenticated
  using (true);

-- Admin write access (authenticated users only)
create policy "Admin insert for seasons"
  on seasons for insert
  to authenticated
  with check (true);

create policy "Admin update for seasons"
  on seasons for update
  to authenticated
  using (true);

create policy "Admin delete for seasons"
  on seasons for delete
  to authenticated
  using (true);

create policy "Admin insert for teams"
  on teams for insert
  to authenticated
  with check (true);

create policy "Admin update for teams"
  on teams for update
  to authenticated
  using (true);

create policy "Admin delete for teams"
  on teams for delete
  to authenticated
  using (true);

create policy "Admin insert for players"
  on players for insert
  to authenticated
  with check (true);

create policy "Admin update for players"
  on players for update
  to authenticated
  using (true);

create policy "Admin delete for players"
  on players for delete
  to authenticated
  using (true);

create policy "Admin insert for games"
  on games for insert
  to authenticated
  with check (true);

create policy "Admin update for games"
  on games for update
  to authenticated
  using (true);

create policy "Admin delete for games"
  on games for delete
  to authenticated
  using (true);

create policy "Admin insert for player_stats"
  on player_stats for insert
  to authenticated
  with check (true);

create policy "Admin update for player_stats"
  on player_stats for update
  to authenticated
  using (true);

create policy "Admin delete for player_stats"
  on player_stats for delete
  to authenticated
  using (true);

create policy "Admin insert for announcements"
  on announcements for insert
  to authenticated
  with check (true);

create policy "Admin update for announcements"
  on announcements for update
  to authenticated
  using (true);

create policy "Admin delete for announcements"
  on announcements for delete
  to authenticated
  using (true);

-- Storage bucket for images (logos, photos, stat sheets)
-- Run this separately in Supabase dashboard or via API:
-- insert into storage.buckets (id, name, public) values ('images', 'images', true);

-- Storage policies for the images bucket
-- create policy "Public read access for images"
--   on storage.objects for select
--   to anon, authenticated
--   using (bucket_id = 'images');

-- create policy "Admin upload for images"
--   on storage.objects for insert
--   to authenticated
--   with check (bucket_id = 'images');

-- create policy "Admin delete for images"
--   on storage.objects for delete
--   to authenticated
--   using (bucket_id = 'images');
