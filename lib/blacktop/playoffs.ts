// lib/blacktop/playoffs.ts
import { getServiceClient } from '@/lib/supabase/server';
import { calculateStandings } from './standings';
import type { Match } from '@/types/blacktop';

export async function validateGroupsComplete(tournamentId: number): Promise<boolean> {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('matches')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('phase', 'groups')
    .neq('status', 'finished');
  
  return !data || data.length === 0;
}

export async function advanceToPlayoffs(tournamentId: number): Promise<Match[]> {
  const supabase = getServiceClient();
  
  const isComplete = await validateGroupsComplete(tournamentId);
  if (!isComplete) throw new Error('Hay partidos de grupos pendientes');
  
  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single();
  if (!tournament) throw new Error('Torneo no encontrado');
  
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('order_index', { ascending: true });
  
  if (!groups || groups.length < 2) throw new Error('Se requieren al menos 2 grupos');
  
  const teamsAdvancePerGroup = tournament.teams_advance_per_group || 2;
  const qualified: { groupId: string; teamIds: number[] }[] = [];
  
  for (const group of groups) {
    const standings = await calculateStandings(tournamentId, group.id);
    const topTeams = standings.slice(0, teamsAdvancePerGroup).map(s => s.team_id);
    qualified.push({ groupId: group.id, teamIds: topTeams });
  }
  
  const playoffMatches: any[] = [];
  let matchNumber = 1;
  
  const { data: lastMatch } = await supabase
    .from('matches')
    .select('match_number')
    .eq('tournament_id', tournamentId)
    .order('match_number', { ascending: false })
    .limit(1)
    .single();
  
  if (lastMatch) matchNumber = (lastMatch.match_number || 0) + 1;
  
  if (qualified.length >= 2 && teamsAdvancePerGroup >= 2) {
    const groupA = qualified[0];
    const groupB = qualified[1];
    
    playoffMatches.push({
      tournament_id: tournamentId,
      phase: 'semifinals',
      round: 'Semifinal 1', // Agregar round requerido
      team_a_id: groupA.teamIds[0],
      team_b_id: groupB.teamIds[1],
      status: 'pending',
      match_number: matchNumber++,
      current_period: 1,
      elapsed_seconds: 0,
      fouls_a: 0,
      fouls_b: 0,
    });
    
    playoffMatches.push({
      tournament_id: tournamentId,
      phase: 'semifinals',
      round: 'Semifinal 2', // Agregar round requerido
      team_a_id: groupB.teamIds[0],
      team_b_id: groupA.teamIds[1],
      status: 'pending',
      match_number: matchNumber++,
      current_period: 1,
      elapsed_seconds: 0,
      fouls_a: 0,
      fouls_b: 0,
    });
  }
  
  playoffMatches.push({
    tournament_id: tournamentId,
    phase: 'final',
    round: 'Final', // Agregar round requerido
    status: 'pending',
    match_number: matchNumber++,
    current_period: 1,
    elapsed_seconds: 0,
    fouls_a: 0,
    fouls_b: 0,
  });
  
  if (tournament.third_place_match) {
    playoffMatches.push({
      tournament_id: tournamentId,
      phase: 'third_place',
      round: 'Tercer Puesto', // Agregar round requerido
      status: 'pending',
      match_number: matchNumber++,
      current_period: 1,
      elapsed_seconds: 0,
      fouls_a: 0,
      fouls_b: 0,
    });
  }
  
  await supabase.from('matches').delete().eq('tournament_id', tournamentId).in('phase', ['semifinals', 'third_place', 'final']);
  
  const { data: insertedMatches, error } = await supabase.from('matches').insert(playoffMatches).select();
  if (error) throw new Error(`Error al generar playoffs: ${error.message}`);
  
  await supabase.from('tournaments').update({ tournament_status: 'playoffs' }).eq('id', tournamentId);
  
  return insertedMatches || [];
}
