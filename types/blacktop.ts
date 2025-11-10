// =====================================================
// BUSY BLACKTOP - Tipos TypeScript
// =====================================================

export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';
export type TeamStatus = 'pending' | 'approved' | 'rejected';
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type MatchRound = 'group_a' | 'group_b' | 'semifinal' | 'final' | 'third_place';
export type MediaType = 'image' | 'video';

export type TournamentFormatType = 'groups_playoff' | 'single_elimination' | 'round_robin' | 'custom';
export type PlayoffFormat = 'single_elimination' | 'double_elimination';

export interface TournamentFormatConfig {
  groups?: {
    [key: string]: number[]; // group_name: [team_ids]
  };
  playoff_bracket?: {
    round: string;
    matches: Array<{
      position: number;
      team_a_id?: number;
      team_b_id?: number;
    }>;
  }[];
}

export interface Tournament {
  id: number;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
  max_teams: number;
  players_per_team_min: number;
  players_per_team_max: number;
  registration_open: boolean;
  registration_start?: string;
  registration_end?: string;
  is_hidden: boolean;
  primary_color: string;
  accent_color: string;
  prizes_title: string;
  prizes_description?: string;
  rules_content?: string;
  rules_url?: string;
  // Formato de torneo
  format_type: TournamentFormatType;
  num_groups: number;
  teams_per_group?: number;
  teams_advance_per_group: number;
  playoff_format: PlayoffFormat;
  third_place_match: boolean;
  format_config?: TournamentFormatConfig;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  tournament_id: number;
  name: string;
  captain_name: string;
  captain_email: string;
  captain_phone?: string;
  captain_instagram: string;
  logo_url?: string;
  notes?: string;
  is_confirmed: boolean;
  status: TeamStatus;
  accept_image_rights: boolean;
  accept_rules: boolean;
  group_name?: string;
  group_position?: number;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: number;
  tournament_id: number;
  team_id: number;
  full_name: string;
  instagram_handle: string;
  email?: string;
  photo_url?: string;
  position?: string;
  is_captain: boolean;
  consent_media: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlayerProfile {
  id: number;
  instagram_handle: string;
  display_name?: string;
  bio?: string;
  total_tournaments: number;
  total_points: number;
  total_mvps: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: number;
  tournament_id: number;
  team_a_id?: number;
  team_b_id?: number;
  team_a_score?: number;
  team_b_score?: number;
  winner_id?: number;
  round: MatchRound;
  match_number?: number;
  scheduled_time?: string;
  status: MatchStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerMatchStats {
  id: number;
  match_id: number;
  player_id: number;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  is_mvp: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMatchStats {
  id: number;
  match_id: number;
  team_id: number;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  created_at: string;
  updated_at: string;
}

export interface TournamentMedia {
  id: number;
  tournament_id: number;
  url: string;
  type: MediaType;
  caption?: string;
  display_order: number;
  created_at: string;
}

// Tipos extendidos con relaciones
export interface TeamWithPlayers extends Team {
  players?: Player[];
}

export interface MatchWithTeams extends Match {
  team_a?: Team;
  team_b?: Team;
  winner?: Team;
}

export interface TournamentWithStats extends Tournament {
  teams_count?: number;
  players_count?: number;
  matches_count?: number;
}

export interface PlayerWithStats extends Player {
  team?: Team;
  total_points?: number;
  total_assists?: number;
  total_rebounds?: number;
  mvp_count?: number;
}

// DTOs para formularios
export interface TournamentFormData {
  name: string;
  slug: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
  max_teams?: number;
  players_per_team_min?: number;
  players_per_team_max?: number;
  registration_open?: boolean;
  registration_start?: string;
  registration_end?: string;
  is_hidden?: boolean;
  primary_color?: string;
  accent_color?: string;
  prizes_title?: string;
  prizes_description?: string;
  rules_content?: string;
  rules_url?: string;
  // Opcional: configuración de formato enviada como JSON para evitar dependencias de columnas
  format_config?: TournamentFormatConfig & {
    format_type?: TournamentFormatType;
    num_groups?: number;
    teams_advance_per_group?: number;
    playoff_format?: PlayoffFormat;
    third_place_match?: boolean;
    playoff_series_length?: number; // cantidad de partidos por serie (best of)
  };
}

export interface TeamRegistrationFormData {
  tournament_id: number;
  team_name: string;
  captain_name: string;
  captain_instagram: string;
  email: string;
  whatsapp_or_phone: string;
  players: {
    full_name: string;
    instagram_handle: string;
    email: string;
    is_captain: boolean;
  }[];
  accept_rules: boolean;
  accept_image_rights: boolean;
}

export interface MatchFormData {
  tournament_id: number;
  team_a_id?: number;
  team_b_id?: number;
  round: MatchRound;
  match_number?: number;
  scheduled_time?: string;
  team_a_score?: number;
  team_b_score?: number;
  winner_id?: number;
  status?: MatchStatus;
  notes?: string;
}

export interface PlayerStatsFormData {
  match_id: number;
  player_id: number;
  points?: number;
  assists?: number;
  rebounds?: number;
  is_mvp?: boolean;
}

export interface TournamentMediaFormData {
  tournament_id: number;
  url: string;
  type?: MediaType;
  caption?: string;
  display_order?: number;
}

// Utilidades
export interface TournamentLeaderboard {
  player: Player;
  team: { id: number; name: string };
  total_points: number;
  total_assists: number;
  total_rebounds: number;
  total_steals: number;
  total_blocks: number;
  total_turnovers: number;
  mvp_count: number;
  games_played: number;
}

export interface TeamLeaderboard {
  team: Team;
  total_points: number;
  total_assists: number;
  total_rebounds: number;
  total_steals: number;
  total_blocks: number;
  total_turnovers: number;
  games_played: number;
}

export interface TournamentStandings {
  team: Team;
  wins: number;
  losses: number;
  points_for: number;
  points_against: number;
  point_differential: number;
}
