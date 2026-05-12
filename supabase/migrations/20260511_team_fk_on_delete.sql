-- Fix ON DELETE behavior for FKs referencing teams.
-- Live DB has none of these set, so deleting a team fails whenever any row anywhere references it.
-- After this migration, deleting a team only fails if it has games (which is the desired behavior —
-- games are historical records and shouldn't be silently destroyed).

-- players.team_id: nullable, should null out when team is deleted
alter table public.players
  drop constraint if exists players_team_id_fkey;
alter table public.players
  add constraint players_team_id_fkey
  foreign key (team_id) references public.teams(id) on delete set null;

-- registrations.team_preference: nullable, should null out
alter table public.registrations
  drop constraint if exists registrations_team_preference_fkey;
alter table public.registrations
  add constraint registrations_team_preference_fkey
  foreign key (team_preference) references public.teams(id) on delete set null;

-- team_registrations.team_id: nullable, should null out (registration record stays as historical artifact)
alter table public.team_registrations
  drop constraint if exists team_registrations_team_id_fkey;
alter table public.team_registrations
  add constraint team_registrations_team_id_fkey
  foreign key (team_id) references public.teams(id) on delete set null;

-- player_stats.game_id: when a game is deleted, its stats should go too
alter table public.player_stats
  drop constraint if exists player_stats_game_id_fkey;
alter table public.player_stats
  add constraint player_stats_game_id_fkey
  foreign key (game_id) references public.games(id) on delete cascade;

-- player_stats.player_id: when a player is deleted, their stats should go too
alter table public.player_stats
  drop constraint if exists player_stats_player_id_fkey;
alter table public.player_stats
  add constraint player_stats_player_id_fkey
  foreign key (player_id) references public.players(id) on delete cascade;

-- games.home_team_id / away_team_id stay RESTRICT — they're NOT NULL and games are historical records.
-- player_stats.team_id stays RESTRICT — stats are deleted via game cascade above, not directly.
