-- =====================================================
-- BUSY BLACKTOP - Sistema de Torneos 3v3
-- =====================================================

-- Tabla principal de torneos
create table if not exists public.tournaments (
  id bigint primary key generated always as identity,
  name text not null,
  slug text unique not null,
  description text,
  location text,
  date timestamp with time zone,
  max_teams integer default 8,
  players_per_team_min integer default 3,
  players_per_team_max integer default 4,
  registration_start timestamp with time zone,
  registration_end timestamp with time zone,
  is_hidden boolean default false,
  accent_color text default '#ef4444',
  prizes_title text,
  prizes_description text,
  rules_content text,
  rules_url text,
  -- Configuración de formato
  format_type text default 'groups_playoff' check (format_type in ('groups_playoff', 'single_elimination', 'round_robin', 'custom')),
  num_groups integer default 2,
  teams_per_group integer,
  teams_advance_per_group integer default 2,
  playoff_format text default 'single_elimination' check (playoff_format in ('single_elimination', 'double_elimination')),
  third_place_match boolean default false,
  format_config jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabla de equipos
create table if not exists public.teams (
  id bigint primary key generated always as identity,
  tournament_id bigint not null references public.tournaments(id) on delete cascade,
  name text not null,
  captain_name text not null,
  captain_email text not null,
  captain_phone text,
  captain_instagram text not null,
  logo_url text,
  notes text,
  is_confirmed boolean default false,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  accept_image_rights boolean default false,
  accept_rules boolean default false,
  group_name text,
  group_position integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para equipos
create index if not exists idx_teams_tournament on public.teams(tournament_id);
create index if not exists idx_teams_status on public.teams(status);

-- Tabla de jugadores (perfil por torneo)
create table if not exists public.players (
  id bigint primary key generated always as identity,
  tournament_id bigint not null references public.tournaments(id) on delete cascade,
  team_id bigint not null references public.teams(id) on delete cascade,
  full_name text not null,
  instagram_handle text not null,
  email text,
  photo_url text,
  position text,
  is_captain boolean default false,
  consent_media boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para jugadores
create index if not exists idx_players_tournament on public.players(tournament_id);
create index if not exists idx_players_team on public.players(team_id);
create index if not exists idx_players_instagram on public.players(instagram_handle);

-- Tabla de perfiles globales de jugadores (opcional para futuro)
create table if not exists public.player_profiles (
  id bigint primary key generated always as identity,
  instagram_handle text unique not null,
  display_name text,
  bio text,
  total_tournaments integer default 0,
  total_points integer default 0,
  total_mvps integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabla de partidos (fixture)
create table if not exists public.matches (
  id bigint primary key generated always as identity,
  tournament_id bigint not null references public.tournaments(id) on delete cascade,
  team_a_id bigint references public.teams(id) on delete set null,
  team_b_id bigint references public.teams(id) on delete set null,
  team_a_score integer,
  team_b_score integer,
  winner_id bigint references public.teams(id) on delete set null,
  round text not null, -- 'group_a', 'group_b', 'semifinal', 'final', 'third_place'
  match_number integer,
  scheduled_time timestamp with time zone,
  status text default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para partidos
create index if not exists idx_matches_tournament on public.matches(tournament_id);
create index if not exists idx_matches_round on public.matches(round);
create index if not exists idx_matches_status on public.matches(status);

-- Tabla de estadísticas de jugadores por partido
create table if not exists public.player_match_stats (
  id bigint primary key generated always as identity,
  match_id bigint not null references public.matches(id) on delete cascade,
  player_id bigint not null references public.players(id) on delete cascade,
  points integer default 0,
  assists integer default 0,
  rebounds integer default 0,
  steals integer default 0,
  blocks integer default 0,
  turnovers integer default 0,
  is_mvp boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para estadísticas
create index if not exists idx_player_stats_match on public.player_match_stats(match_id);
create index if not exists idx_player_stats_player on public.player_match_stats(player_id);

-- Tabla de estadísticas de equipos por partido
create table if not exists public.team_match_stats (
  id bigint primary key generated always as identity,
  match_id bigint not null references public.matches(id) on delete cascade,
  team_id bigint not null references public.teams(id) on delete cascade,
  points integer default 0,
  assists integer default 0,
  rebounds integer default 0,
  steals integer default 0,
  blocks integer default 0,
  turnovers integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para estadísticas de equipos
create index if not exists idx_team_stats_match on public.team_match_stats(match_id);
create index if not exists idx_team_stats_team on public.team_match_stats(team_id);

-- Tabla de galería de medios del torneo
create table if not exists public.tournament_media (
  id bigint primary key generated always as identity,
  tournament_id bigint not null references public.tournaments(id) on delete cascade,
  url text not null,
  type text default 'image' check (type in ('image', 'video')),
  caption text,
  display_order integer default 0,
  created_at timestamp with time zone default now()
);

-- Índices para medios
create index if not exists idx_tournament_media_tournament on public.tournament_media(tournament_id);
create index if not exists idx_tournament_media_order on public.tournament_media(display_order);

-- Función para actualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para updated_at
drop trigger if exists update_tournaments_updated_at on public.tournaments;
create trigger update_tournaments_updated_at
  before update on public.tournaments
  for each row execute function update_updated_at_column();

drop trigger if exists update_teams_updated_at on public.teams;
create trigger update_teams_updated_at
  before update on public.teams
  for each row execute function update_updated_at_column();

drop trigger if exists update_players_updated_at on public.players;
create trigger update_players_updated_at
  before update on public.players
  for each row execute function update_updated_at_column();

drop trigger if exists update_player_profiles_updated_at on public.player_profiles;
create trigger update_player_profiles_updated_at
  before update on public.player_profiles
  for each row execute function update_updated_at_column();

drop trigger if exists update_matches_updated_at on public.matches;
create trigger update_matches_updated_at
  before update on public.matches
  for each row execute function update_updated_at_column();

-- RLS Policies (público puede ver torneos no ocultos, admin puede todo)
alter table public.tournaments enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.player_profiles enable row level security;
alter table public.matches enable row level security;
alter table public.player_match_stats enable row level security;
alter table public.tournament_media enable row level security;

-- Políticas para torneos
create policy "Torneos públicos son visibles para todos"
  on public.tournaments for select
  using (is_hidden = false or auth.role() = 'authenticated');

create policy "Solo admins pueden modificar torneos"
  on public.tournaments for all
  using (auth.role() = 'authenticated');

-- Políticas para equipos (todos pueden insertar inscripciones, solo admin modifica)
create policy "Todos pueden ver equipos aprobados"
  on public.teams for select
  using (status = 'approved' or auth.role() = 'authenticated');

create policy "Todos pueden inscribir equipos"
  on public.teams for insert
  with check (true);

create policy "Solo admins pueden modificar equipos"
  on public.teams for update
  using (auth.role() = 'authenticated');

create policy "Solo admins pueden eliminar equipos"
  on public.teams for delete
  using (auth.role() = 'authenticated');

-- Políticas para jugadores
create policy "Todos pueden ver jugadores de equipos aprobados"
  on public.players for select
  using (
    exists (
      select 1 from public.teams
      where teams.id = players.team_id
      and teams.status = 'approved'
    ) or auth.role() = 'authenticated'
  );

create policy "Todos pueden inscribir jugadores"
  on public.players for insert
  with check (true);

create policy "Solo admins pueden modificar jugadores"
  on public.players for update
  using (auth.role() = 'authenticated');

create policy "Solo admins pueden eliminar jugadores"
  on public.players for delete
  using (auth.role() = 'authenticated');

-- Políticas para perfiles de jugadores (público)
create policy "Todos pueden ver perfiles de jugadores"
  on public.player_profiles for select
  using (true);

create policy "Solo admins pueden modificar perfiles"
  on public.player_profiles for all
  using (auth.role() = 'authenticated');

-- Políticas para partidos (público puede ver)
create policy "Todos pueden ver partidos"
  on public.matches for select
  using (true);

create policy "Solo admins pueden modificar partidos"
  on public.matches for all
  using (auth.role() = 'authenticated');

-- Políticas para estadísticas de jugadores (público puede ver)
create policy "Todos pueden ver estadísticas de jugadores"
  on public.player_match_stats for select
  using (true);

create policy "Solo admins pueden modificar estadísticas de jugadores"
  on public.player_match_stats for all
  using (auth.role() = 'authenticated');

-- Políticas para estadísticas de equipos (público puede ver)
create policy "Todos pueden ver estadísticas de equipos"
  on public.team_match_stats for select
  using (true);

create policy "Solo admins pueden modificar estadísticas de equipos"
  on public.team_match_stats for all
  using (auth.role() = 'authenticated');

-- Políticas para galería (público puede ver)
create policy "Todos pueden ver galería"
  on public.tournament_media for select
  using (true);

create policy "Solo admins pueden modificar galería"
  on public.tournament_media for all
  using (auth.role() = 'authenticated');

-- Comentarios para documentación
comment on table public.tournaments is 'Torneos 3v3 de BUSY BLACKTOP';
comment on table public.teams is 'Equipos inscritos en torneos';
comment on table public.players is 'Jugadores por torneo y equipo';
comment on table public.player_profiles is 'Perfiles globales de jugadores (por Instagram)';
comment on table public.matches is 'Partidos del fixture';
comment on table public.player_match_stats is 'Estadísticas de jugadores por partido';
comment on table public.team_match_stats is 'Estadísticas de equipos por partido';
comment on table public.tournament_media is 'Galería de fotos/videos del torneo';
