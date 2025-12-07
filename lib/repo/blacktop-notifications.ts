import { getServiceClient } from '@/lib/supabase/server';
import type { BlacktopMatchResultMetadata, BlacktopMatchUpcomingMetadata, BlacktopTeamRegistrationMetadata } from '@/types/notifications';

/**
 * Create notification when a team registers for a tournament
 */
export async function notifyTeamRegistration(params: {
  teamId: number;
  teamName: string;
  tournamentId: number;
  tournamentName: string;
  tournamentSlug: string;
  captainName: string;
  captainInstagram: string;
  playersCount: number;
}): Promise<string | null> {
  const supabase = getServiceClient();

  const metadata: BlacktopTeamRegistrationMetadata = {
    team_id: params.teamId,
    team_name: params.teamName,
    tournament_id: params.tournamentId,
    tournament_name: params.tournamentName,
    tournament_slug: params.tournamentSlug,
    captain_name: params.captainName,
    captain_instagram: params.captainInstagram,
    players_count: params.playersCount,
  };

  const { data, error } = await supabase
    .from('blacktop_notifications')
    .insert({
      type: 'blacktop_team_registration',
      title: `🏀 Nuevo equipo inscrito: ${params.teamName}`,
      message: `El equipo "${params.teamName}" se ha inscrito en ${params.tournamentName}. Capitán: ${params.captainName} (@${params.captainInstagram}). ${params.playersCount} jugadores.`,
      metadata,
      action_url: `/admin/blacktop/${params.tournamentId}`,
      priority: 'medium',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating blacktop notification:', error);
    return null;
  }

  return data?.id || null;
}

/**
 * Create notification for upcoming match (24h before)
 */
export async function notifyUpcomingMatch(params: {
  matchId: number;
  tournamentName: string;
  tournamentSlug: string;
  teamAName: string;
  teamBName: string;
  scheduledTime: string;
  round: string;
}): Promise<string | null> {
  const metadata: BlacktopMatchUpcomingMetadata = {
    match_id: params.matchId,
    tournament_name: params.tournamentName,
    tournament_slug: params.tournamentSlug,
    team_a_name: params.teamAName,
    team_b_name: params.teamBName,
    scheduled_time: params.scheduledTime,
    round: params.round,
  };

  const supabase = getServiceClient();

  const matchDate = new Date(params.scheduledTime).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  const { data, error } = await supabase
    .from('blacktop_notifications')
    .insert({
      type: 'blacktop_match_upcoming',
      title: `📅 Próximo partido: ${params.teamAName} vs ${params.teamBName}`,
      message: `Partido programado para ${matchDate}. ${params.round.replace('_', ' ').toUpperCase()} - ${params.tournamentName}`,
      metadata,
      action_url: `/blacktop/${params.tournamentSlug}#fixture`,
      priority: 'medium',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating blacktop notification:', error);
    return null;
  }

  return data?.id || null;
}

/**
 * Create notification when match result is recorded
 */
export async function notifyMatchResult(params: {
  matchId: number;
  tournamentName: string;
  tournamentSlug: string;
  teamAName: string;
  teamAScore: number;
  teamBName: string;
  teamBScore: number;
  winnerName: string;
  round: string;
}): Promise<string | null> {
  const metadata: BlacktopMatchResultMetadata = {
    match_id: params.matchId,
    tournament_name: params.tournamentName,
    tournament_slug: params.tournamentSlug,
    team_a_name: params.teamAName,
    team_a_score: params.teamAScore,
    team_b_name: params.teamBName,
    team_b_score: params.teamBScore,
    winner_name: params.winnerName,
    round: params.round,
  };

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('blacktop_notifications')
    .insert({
      type: 'blacktop_match_result',
      title: `🏆 Resultado: ${params.winnerName} ganó!`,
      message: `${params.teamAName} ${params.teamAScore} - ${params.teamBScore} ${params.teamBName}. ${params.round.replace('_', ' ').toUpperCase()} - ${params.tournamentName}`,
      metadata,
      action_url: `/blacktop/${params.tournamentSlug}#fixture`,
      priority: 'low',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating blacktop notification:', error);
    return null;
  }

  return data?.id || null;
}
