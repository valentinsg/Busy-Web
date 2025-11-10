// =====================================================
// BUSY BLACKTOP - Repositorio de datos
// =====================================================

import { getServiceClient } from '@/lib/supabase/server';
import type {
  Tournament,
  TournamentFormData,
  Team,
  TeamWithPlayers,
  Player,
  Match,
  MatchWithTeams,
  PlayerMatchStats,
  TournamentMedia,
  TournamentWithStats,
  PlayerWithStats,
  TournamentLeaderboard,
  TeamRegistrationFormData,
  MatchFormData,
  PlayerStatsFormData,
  TournamentMediaFormData,
} from '@/types/blacktop';

// =====================================================
// TOURNAMENTS
// =====================================================

export async function getAllTournaments(): Promise<Tournament[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPublicTournaments(): Promise<Tournament[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_hidden', false)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTournamentBySlug(slug: string): Promise<Tournament | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function getTournamentById(id: number): Promise<Tournament | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function getTournamentWithStats(id: number): Promise<TournamentWithStats | null> {
  const supabase = getServiceClient();
  
  const [tournament, teamsCount, playersCount, matchesCount] = await Promise.all([
    getTournamentById(id),
    supabase.from('teams').select('id', { count: 'exact', head: true }).eq('tournament_id', id).eq('status', 'approved'),
    supabase.from('players').select('id', { count: 'exact', head: true }).eq('tournament_id', id),
    supabase.from('matches').select('id', { count: 'exact', head: true }).eq('tournament_id', id),
  ]);

  if (!tournament) return null;

  return {
    ...tournament,
    teams_count: teamsCount.count || 0,
    players_count: playersCount.count || 0,
    matches_count: matchesCount.count || 0,
  };
}

export async function createTournament(data: TournamentFormData): Promise<Tournament> {
  const supabase = getServiceClient();
  // Omit fields that are not real DB columns (e.g., 'time') and undefined values
  const { time, ...rest } = (data as any) ?? {};
  const payload = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined)
  );
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return tournament;
}

export async function updateTournament(id: number, data: Partial<TournamentFormData>): Promise<Tournament> {
  const supabase = getServiceClient();
  // Omit fields that are not real DB columns (e.g., 'time') and undefined values
  const { time, ...rest } = (data as any) ?? {};
  const payload = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined)
  );
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return tournament;
}

export async function deleteTournament(id: number): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// TEAMS
// =====================================================

export async function getTeamsByTournament(tournamentId: number, statusFilter?: string): Promise<TeamWithPlayers[]> {
  const supabase = getServiceClient();
  
  let query = supabase
    .from('teams')
    .select(`
      *,
      players:players(*)
    `)
    .eq('tournament_id', tournamentId)
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getTeamById(id: number): Promise<TeamWithPlayers | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      players:players(*)
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createTeam(data: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<Team> {
  const supabase = getServiceClient();
  const { data: team, error } = await supabase
    .from('teams')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return team;
}

export async function updateTeamStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<Team> {
  const supabase = getServiceClient();
  const { data: team, error } = await supabase
    .from('teams')
    .update({ status, is_confirmed: status === 'approved' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return team;
}

export async function deleteTeam(id: number): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Normalizar nombre de equipo (quitar mayúsculas, espacios extras, etc)
export function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // múltiples espacios a uno solo
    .replace(/[^\w\s]/g, ''); // quitar caracteres especiales
}

// Verificar si un equipo ya existe (por nombre normalizado)
export async function findExistingTeam(tournamentId: number, teamName: string): Promise<Team | null> {
  const supabase = getServiceClient();
  const normalized = normalizeTeamName(teamName);
  
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .eq('tournament_id', tournamentId);

  if (!teams) return null;

  // Buscar coincidencia normalizada
  const existing = teams.find(t => normalizeTeamName(t.name) === normalized);
  return existing || null;
}

// =====================================================
// PLAYERS
// =====================================================

export async function getPlayersByTournament(tournamentId: number): Promise<Player[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPlayersByTeam(teamId: number): Promise<Player[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('is_captain', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createPlayer(data: Omit<Player, 'id' | 'created_at' | 'updated_at'>): Promise<Player> {
  const supabase = getServiceClient();
  const { data: player, error } = await supabase
    .from('players')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return player;
}

export async function createPlayers(players: Omit<Player, 'id' | 'created_at' | 'updated_at'>[]): Promise<Player[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('players')
    .insert(players)
    .select();

  if (error) throw error;
  return data || [];
}

// Normalizar Instagram handle
export function normalizeInstagram(handle: string): string {
  return handle
    .toLowerCase()
    .trim()
    .replace('@', '')
    .replace(/\s+/g, '');
}

// =====================================================
// MATCHES
// =====================================================

export async function getMatchesByTournament(tournamentId: number): Promise<MatchWithTeams[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:team_a_id(id, name),
      team_b:team_b_id(id, name),
      winner:winner_id(id, name)
    `)
    .eq('tournament_id', tournamentId)
    .order('match_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getMatchesByRound(tournamentId: number, round: string): Promise<MatchWithTeams[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:team_a_id(id, name),
      team_b:team_b_id(id, name),
      winner:winner_id(id, name)
    `)
    .eq('tournament_id', tournamentId)
    .eq('round', round)
    .order('match_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createMatch(data: MatchFormData): Promise<Match> {
  const supabase = getServiceClient();
  const { data: match, error } = await supabase
    .from('matches')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return match;
}

export async function updateMatch(id: number, data: Partial<MatchFormData>): Promise<Match> {
  const supabase = getServiceClient();
  const { data: match, error } = await supabase
    .from('matches')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return match;
}

export async function deleteMatch(id: number): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// PLAYER STATS
// =====================================================

export async function getPlayerStatsByMatch(matchId: number): Promise<PlayerMatchStats[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('player_match_stats')
    .select('*')
    .eq('match_id', matchId);

  if (error) throw error;
  return data || [];
}

export async function getTournamentLeaderboard(tournamentId: number): Promise<TournamentLeaderboard[]> {
  const supabase = getServiceClient();
  
  // Obtener todos los jugadores con sus stats
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select(`
      *,
      team:team_id(id, name),
      stats:player_match_stats(points, assists, rebounds, steals, blocks, turnovers, is_mvp)
    `)
    .eq('tournament_id', tournamentId);

  if (playersError) throw playersError;
  if (!players) return [];

  // Calcular totales
  const leaderboard: TournamentLeaderboard[] = players.map((player: any) => {
    const stats = player.stats || [];
    return {
      player: player,
      team: player.team,
      total_points: stats.reduce((sum: number, s: any) => sum + (s.points || 0), 0),
      total_assists: stats.reduce((sum: number, s: any) => sum + (s.assists || 0), 0),
      total_rebounds: stats.reduce((sum: number, s: any) => sum + (s.rebounds || 0), 0),
      total_steals: stats.reduce((sum: number, s: any) => sum + (s.steals || 0), 0),
      total_blocks: stats.reduce((sum: number, s: any) => sum + (s.blocks || 0), 0),
      total_turnovers: stats.reduce((sum: number, s: any) => sum + (s.turnovers || 0), 0),
      mvp_count: stats.filter((s: any) => s.is_mvp).length,
      games_played: stats.length,
    };
  });

  // Ordenar por puntos
  return leaderboard.sort((a, b) => b.total_points - a.total_points);
}

export async function createPlayerStats(data: PlayerStatsFormData): Promise<PlayerMatchStats> {
  const supabase = getServiceClient();
  const { data: stats, error } = await supabase
    .from('player_match_stats')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return stats;
}

export async function updatePlayerStats(id: number, data: Partial<PlayerStatsFormData>): Promise<PlayerMatchStats> {
  const supabase = getServiceClient();
  const { data: stats, error } = await supabase
    .from('player_match_stats')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return stats;
}

// =====================================================
// TOURNAMENT MEDIA
// =====================================================

export async function getTournamentMedia(tournamentId: number): Promise<TournamentMedia[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('tournament_media')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createTournamentMedia(data: TournamentMediaFormData): Promise<TournamentMedia> {
  const supabase = getServiceClient();
  const { data: media, error } = await supabase
    .from('tournament_media')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return media;
}

export async function deleteTournamentMedia(id: number): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('tournament_media')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// TEAM REGISTRATION (proceso completo)
// =====================================================

export async function registerTeam(formData: TeamRegistrationFormData) {
  const supabase = getServiceClient();

  try {
    // 1. Verificar si el equipo ya existe (normalizado)
    const existingTeam = await findExistingTeam(formData.tournament_id, formData.team_name);
    
    if (existingTeam) {
      // Equipo ya existe, verificar si el capitán ya estaba registrado
      const normalizedInstagram = normalizeInstagram(formData.captain_instagram);
      const { data: existingPlayers } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', existingTeam.id);

      const playerExists = existingPlayers?.some(
        p => normalizeInstagram(p.instagram_handle) === normalizedInstagram
      );

      if (playerExists) {
        return {
          success: true,
          message: 'Ya estás registrado en este equipo. Te confirmaremos por DM o WhatsApp.',
          team: existingTeam,
          isNewTeam: false,
        } as const;
      }

      // No auto-agregamos jugadores a un equipo existente para evitar confusiones.
      return {
        success: false,
        code: 'TEAM_NAME_TAKEN',
        message: 'Ya existe un equipo con ese nombre. Elegí otro nombre o contactá al capitán para unirte.',
        team: existingTeam,
        isNewTeam: false,
      } as const;
    }

    // 2. Crear nuevo equipo
    const team = await createTeam({
      tournament_id: formData.tournament_id,
      name: formData.team_name,
      captain_name: formData.captain_name,
      captain_email: formData.email,
      captain_phone: formData.whatsapp_or_phone,
      captain_instagram: normalizeInstagram(formData.captain_instagram),
      accept_image_rights: formData.accept_image_rights || false,
      accept_rules: formData.accept_rules || false,
      status: 'pending',
      is_confirmed: false,
    });

    // 3. Crear jugadores
    const players = formData.players.map(p => ({
      tournament_id: formData.tournament_id,
      team_id: team.id,
      full_name: p.full_name,
      instagram_handle: normalizeInstagram(p.instagram_handle),
      email: p.email,
      is_captain: p.is_captain,
      consent_media: formData.accept_image_rights || false,
    }));

    await createPlayers(players);

    return {
      success: true,
      message: 'Quedaste junto a tu equipo pre-registrado en BUSY BLACKTOP. Te vamos a confirmar por DM o WhatsApp.',
      team,
      isNewTeam: true,
    };
  } catch (error) {
    console.error('Error registering team:', error);
    throw error;
  }
}

