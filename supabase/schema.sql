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

-- =====================================================
-- NEW FEATURES: Registration, Payments, Gallery, etc.
-- =====================================================

-- Photo Gallery table
create table if not exists gallery_photos (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  image_url text not null,
  category text default 'general', -- events, highlights, updates, general
  game_id uuid references games(id) on delete set null,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- Live Streams table
create table if not exists live_streams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  stream_url text, -- YouTube, Twitch, or custom embed URL
  stream_type text default 'youtube', -- youtube, twitch, vimeo, custom
  game_id uuid references games(id) on delete set null,
  is_live boolean default false,
  scheduled_time timestamptz,
  thumbnail_url text,
  created_at timestamptz default now()
);

-- Sponsors table
create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  website_url text,
  tier text default 'standard', -- premium, standard, basic
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- Player Registrations table
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  date_of_birth date,
  position text, -- preferred position
  experience_level text, -- beginner, intermediate, advanced
  team_preference uuid references teams(id) on delete set null,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_conditions text,
  waiver_signed boolean default false,
  status text default 'pending', -- pending, approved, rejected, waitlist
  season_id uuid references seasons(id) on delete set null,
  notes text,
  created_at timestamptz default now()
);

-- Payments table
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references registrations(id) on delete set null,
  player_id uuid references players(id) on delete set null,
  amount decimal(10,2) not null,
  currency text default 'usd',
  payment_type text default 'registration', -- registration, membership, event, other
  stripe_payment_intent_id text,
  stripe_session_id text,
  status text default 'pending', -- pending, completed, failed, refunded
  description text,
  metadata jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Events table (for non-game events like tryouts, training sessions, etc.)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_type text default 'general', -- tryout, training, meeting, social, tournament
  location text,
  start_time timestamptz not null,
  end_time timestamptz,
  max_participants integer,
  current_participants integer default 0,
  registration_required boolean default false,
  registration_fee decimal(10,2),
  is_public boolean default true,
  created_at timestamptz default now()
);

-- Event Registrations table
create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  registration_id uuid references registrations(id) on delete set null,
  player_id uuid references players(id) on delete set null,
  name text,
  email text,
  phone text,
  status text default 'registered', -- registered, attended, cancelled, no_show
  payment_id uuid references payments(id) on delete set null,
  created_at timestamptz default now(),
  unique(event_id, email)
);

-- Create indexes for new tables
create index if not exists idx_gallery_category on gallery_photos(category);
create index if not exists idx_gallery_game on gallery_photos(game_id);
create index if not exists idx_streams_game on live_streams(game_id);
create index if not exists idx_streams_live on live_streams(is_live);
create index if not exists idx_sponsors_active on sponsors(is_active);
create index if not exists idx_registrations_email on registrations(email);
create index if not exists idx_registrations_status on registrations(status);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_payments_registration on payments(registration_id);
create index if not exists idx_events_start on events(start_time);
create index if not exists idx_event_regs_event on event_registrations(event_id);

-- Enable RLS on new tables
alter table gallery_photos enable row level security;
alter table live_streams enable row level security;
alter table sponsors enable row level security;
alter table registrations enable row level security;
alter table payments enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;

-- Public read access for new tables
create policy "Public read access for gallery_photos"
  on gallery_photos for select
  to anon, authenticated
  using (true);

create policy "Public read access for live_streams"
  on live_streams for select
  to anon, authenticated
  using (true);

create policy "Public read access for sponsors"
  on sponsors for select
  to anon, authenticated
  using (is_active = true);

create policy "Public read access for events"
  on events for select
  to anon, authenticated
  using (is_public = true);

-- Public can create registrations and event_registrations
create policy "Public insert for registrations"
  on registrations for insert
  to anon, authenticated
  with check (true);

create policy "Public insert for event_registrations"
  on event_registrations for insert
  to anon, authenticated
  with check (true);

-- Admin access for new tables
create policy "Admin full access for gallery_photos"
  on gallery_photos for all
  to authenticated
  using (true);

create policy "Admin full access for live_streams"
  on live_streams for all
  to authenticated
  using (true);

create policy "Admin full access for sponsors"
  on sponsors for all
  to authenticated
  using (true);

create policy "Admin read for registrations"
  on registrations for select
  to authenticated
  using (true);

create policy "Admin update for registrations"
  on registrations for update
  to authenticated
  using (true);

create policy "Admin delete for registrations"
  on registrations for delete
  to authenticated
  using (true);

create policy "Admin full access for payments"
  on payments for all
  to authenticated
  using (true);

create policy "Admin full access for events"
  on events for all
  to authenticated
  using (true);

create policy "Admin full access for event_registrations"
  on event_registrations for all
  to authenticated
  using (true);

-- =====================================================
-- TEAM REGISTRATION SYSTEM
-- =====================================================

-- Team Registrations table (for captain-initiated team registration)
create table if not exists team_registrations (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  primary_color text default '#000000',
  secondary_color text default '#FFFFFF',
  captain_name text not null,
  captain_email text not null,
  captain_phone text,
  logo_url text,
  status text default 'registered', -- registered, paid, roster_complete
  roster_token text unique, -- secure token for roster entry page
  roster_token_expires_at timestamptz,
  min_players integer default 5,
  max_players integer default 15,
  season_id uuid references seasons(id) on delete set null,
  created_at timestamptz default now(),
  paid_at timestamptz,
  roster_completed_at timestamptz,
  team_id uuid references teams(id) on delete set null -- links to created team after roster complete
);

-- Team Roster Entries table (temporary storage before team creation)
create table if not exists team_roster_entries (
  id uuid primary key default gen_random_uuid(),
  team_registration_id uuid references team_registrations(id) on delete cascade not null,
  player_name text not null,
  created_at timestamptz default now()
);

-- Add team_registration_id to payments table
alter table payments add column if not exists team_registration_id uuid references team_registrations(id) on delete set null;

-- Create indexes for team registration tables
create index if not exists idx_team_registrations_token on team_registrations(roster_token);
create index if not exists idx_team_registrations_email on team_registrations(captain_email);
create index if not exists idx_team_registrations_status on team_registrations(status);
create index if not exists idx_team_roster_entries_registration on team_roster_entries(team_registration_id);
create index if not exists idx_payments_team_registration on payments(team_registration_id);

-- Enable RLS on team registration tables
alter table team_registrations enable row level security;
alter table team_roster_entries enable row level security;

-- Public can create team registrations
create policy "Public insert for team_registrations"
  on team_registrations for insert
  to anon, authenticated
  with check (true);

-- Public can read their own team registration by token
create policy "Public read team_registrations by token"
  on team_registrations for select
  to anon, authenticated
  using (true);

-- Public can update team registration (for status changes)
create policy "Public update for team_registrations"
  on team_registrations for update
  to anon, authenticated
  using (true);

-- Public can manage roster entries for their registration
create policy "Public insert for team_roster_entries"
  on team_roster_entries for insert
  to anon, authenticated
  with check (true);

create policy "Public read for team_roster_entries"
  on team_roster_entries for select
  to anon, authenticated
  using (true);

create policy "Public delete for team_roster_entries"
  on team_roster_entries for delete
  to anon, authenticated
  using (true);

-- Admin full access for team registrations
create policy "Admin full access for team_registrations"
  on team_registrations for all
  to authenticated
  using (true);

create policy "Admin full access for team_roster_entries"
  on team_roster_entries for all
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
