// lib/blacktop/simulation.ts
import { getServiceClient } from '@/lib/supabase/server';
import type { Match } from '@/types/blacktop';
import { propagatePlayoffProgress } from './playoffs';

export async function simulateMatch(matchId: number): Promise<void> {
  const supabase = getServiceClient();

  const scoreA = Math.floor(Math.random() * 10) + 15;
  const scoreB = Math.floor(Math.random() * 10) + 15;
  const foulsA = Math.floor(Math.random() * 5);
  const foulsB = Math.floor(Math.random() * 5);

  const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single();
  if (!match) throw new Error('Partido no encontrado');

  const winnerId = scoreA > scoreB ? match.team_a_id : match.team_b_id;

  await supabase
    .from('matches')
    .update({
      team_a_score: scoreA,
      team_b_score: scoreB,
      fouls_a: foulsA,
      fouls_b: foulsB,
      winner_id: winnerId,
      status: 'finished',
      finished_at: new Date().toISOString(),
    })
    .eq('id', matchId);
}

export async function simulatePhase(tournamentId: number): Promise<void> {
  const supabase = getServiceClient();

  const { data: tournament } = await supabase.from('tournaments').select('tournament_status').eq('id', tournamentId).single();
  if (!tournament) throw new Error('Torneo no encontrado');

  const phase = tournament.tournament_status === 'groups'
    ? 'groups'
    : tournament.tournament_status === 'playoffs'
      ? ['quarterfinals', 'semifinals', 'third_place', 'final']
      : null;

  if (!phase) throw new Error('Fase no válida para simulación');

  let query = supabase.from('matches').select('id').eq('tournament_id', tournamentId).eq('status', 'pending');

  if (Array.isArray(phase)) {
    query = query.in('phase', phase);
  } else {
    query = query.eq('phase', phase);
  }

  const { data: matches } = await query.select('id');

  if (!matches || matches.length === 0) return;

  for (const match of matches) {
    await simulateMatch(match.id);
    const { data: finishedMatch } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match.id)
      .single<Match>();
    if (finishedMatch) {
      await propagatePlayoffProgress(tournamentId, finishedMatch);
    }
  }
}
