// lib/blacktop/playoffs.ts
import { getServiceClient } from '@/lib/supabase/server';
import type { Match } from '@/types/blacktop';
import { calculateStandings } from './standings';

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

  if (!groups || groups.length === 0) {
    throw new Error('No hay grupos configurados para este torneo');
  }

  const teamsAdvancePerGroup = tournament.teams_advance_per_group || 2;
  const qualified: { groupId: string; teamIds: number[] }[] = [];

  // Solo consideramos grupos que realmente tienen standings/equipos
  for (const group of groups) {
    const standings = await calculateStandings(tournamentId, group.id);

    if (!standings || standings.length === 0) {
      // Grupo sin equipos o sin partidos finalizados: lo ignoramos para playoffs
      continue;
    }

    const topTeams = standings.slice(0, teamsAdvancePerGroup).map((s) => s.team_id);

    if (topTeams.length === 0) {
      continue;
    }

    qualified.push({ groupId: group.id, teamIds: topTeams });
  }

  if (qualified.length < 2) {
    throw new Error('Se requieren al menos 2 grupos con equipos para generar playoffs');
  }

  const playoffMatches: Partial<Match>[] = [];
  let matchNumber = 1;

  const { data: lastMatch } = await supabase
    .from('matches')
    .select('match_number')
    .eq('tournament_id', tournamentId)
    .order('match_number', { ascending: false })
    .limit(1)
    .single();

  if (lastMatch) matchNumber = (lastMatch.match_number || 0) + 1;

  // Caso 1: formato clásico 2 grupos x 2 clasificados -> Semifinales + Final (+ 3er puesto)
  if (qualified.length === 2 && teamsAdvancePerGroup >= 2) {
    const groupA = qualified[0];
    const groupB = qualified[1];

    playoffMatches.push({
      tournament_id: tournamentId,
      phase: 'semifinals',
      round: 'Semifinal 1',
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
      round: 'Semifinal 2',
      team_a_id: groupB.teamIds[0],
      team_b_id: groupA.teamIds[1],
      status: 'pending',
      match_number: matchNumber++,
      current_period: 1,
      elapsed_seconds: 0,
      fouls_a: 0,
      fouls_b: 0,
    });

    playoffMatches.push({
      tournament_id: tournamentId,
      phase: 'final',
      round: 'Final',
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
        round: 'Tercer Puesto',
        status: 'pending',
        match_number: matchNumber++,
        current_period: 1,
        elapsed_seconds: 0,
        fouls_a: 0,
        fouls_b: 0,
      });
    }
  } else if (qualified.length === 4 && teamsAdvancePerGroup === 2) {
    // Caso 2: 4 grupos x 2 clasificados -> Cuartos + Semis + Final (+ 3er puesto)
    const [groupA, groupB, groupC, groupD] = qualified;

    // Cuartos de final
    const quarterPairs: [number, number, string][] = [
      [groupA.teamIds[0], groupB.teamIds[1], 'Cuartos de Final 1 (1A vs 2B)'],
      [groupB.teamIds[0], groupA.teamIds[1], 'Cuartos de Final 2 (1B vs 2A)'],
      [groupC.teamIds[0], groupD.teamIds[1], 'Cuartos de Final 3 (1C vs 2D)'],
      [groupD.teamIds[0], groupC.teamIds[1], 'Cuartos de Final 4 (1D vs 2C)'],
    ];

    for (const [teamAId, teamBId, roundLabel] of quarterPairs) {
      playoffMatches.push({
        tournament_id: tournamentId,
        phase: 'quarterfinals',
        round: roundLabel,
        team_a_id: teamAId,
        team_b_id: teamBId,
        status: 'pending',
        match_number: matchNumber++,
        current_period: 1,
        elapsed_seconds: 0,
        fouls_a: 0,
        fouls_b: 0,
      });
    }

    // Semifinales y finales como placeholders (se llenan al cerrar cuartos)
    playoffMatches.push({
      tournament_id: tournamentId,
      phase: 'semifinals',
      round: 'Semifinal 1',
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
      round: 'Semifinal 2',
      status: 'pending',
      match_number: matchNumber++,
      current_period: 1,
      elapsed_seconds: 0,
      fouls_a: 0,
      fouls_b: 0,
    });

    playoffMatches.push({
      tournament_id: tournamentId,
      phase: 'final',
      round: 'Final',
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
        round: 'Tercer Puesto',
        status: 'pending',
        match_number: matchNumber++,
        current_period: 1,
        elapsed_seconds: 0,
        fouls_a: 0,
        fouls_b: 0,
      });
    }
  } else {
    throw new Error(
      'El generador automático de playoffs solo soporta, por ahora, 2 zonas con 2 clasificados por zona o 4 zonas con 2 clasificados por zona.'
    );
  }

  await supabase
    .from('matches')
    .delete()
    .eq('tournament_id', tournamentId)
    .in('phase', ['quarterfinals', 'semifinals', 'third_place', 'final']);

  const { data: insertedMatches, error } = await supabase.from('matches').insert(playoffMatches).select();
  if (error) throw new Error(`Error al generar playoffs: ${error.message}`);

  await supabase.from('tournaments').update({ tournament_status: 'playoffs' }).eq('id', tournamentId);

  return insertedMatches || [];
}

type TeamSlot = 'team_a_id' | 'team_b_id';

interface SlotAssignment {
  round: string;
  slot: TeamSlot;
}

type MatchSlotRow = {
  id: number;
  team_a_id: number | null;
  team_b_id: number | null;
};

function getQuarterfinalSlot(round?: string): SlotAssignment | null {
  if (!round) return null;
  const match = round.match(/(\d+)/);
  const number = match ? parseInt(match[1], 10) : NaN;
  if (!number || number < 1 || number > 4) return null;

  if (number === 1) return { round: 'Semifinal 1', slot: 'team_a_id' };
  if (number === 2) return { round: 'Semifinal 1', slot: 'team_b_id' };
  if (number === 3) return { round: 'Semifinal 2', slot: 'team_a_id' };
  return { round: 'Semifinal 2', slot: 'team_b_id' };
}

function getSemifinalWinnerSlot(round?: string): SlotAssignment | null {
  if (!round) return null;
  if (round === 'Semifinal 1') return { round: 'Final', slot: 'team_a_id' };
  if (round === 'Semifinal 2') return { round: 'Final', slot: 'team_b_id' };
  return null;
}

function getSemifinalLoserSlot(round?: string): SlotAssignment | null {
  if (!round) return null;
  if (round === 'Semifinal 1') return { round: 'Tercer Puesto', slot: 'team_a_id' };
  if (round === 'Semifinal 2') return { round: 'Tercer Puesto', slot: 'team_b_id' };
  return null;
}

async function assignTeamToMatch(
  tournamentId: number,
  phase: Match['phase'],
  round: string,
  slot: TeamSlot,
  teamId: number
) {
  const supabase = getServiceClient();
  const { data: targetMatch } = await supabase
    .from('matches')
    .select('id, team_a_id, team_b_id')
    .eq('tournament_id', tournamentId)
    .eq('phase', phase)
    .eq('round', round)
    .limit(1)
    .maybeSingle<MatchSlotRow>();

  if (!targetMatch || targetMatch[slot] === teamId) return;

  await supabase
    .from('matches')
    .update({ [slot]: teamId })
    .eq('id', targetMatch.id);
}

export async function propagatePlayoffProgress(tournamentId: number, finishedMatch: Match) {
  if (!finishedMatch.winner_id) return;

  if (finishedMatch.phase === 'quarterfinals') {
    const slotInfo = getQuarterfinalSlot(finishedMatch.round);
    if (slotInfo) {
      await assignTeamToMatch(tournamentId, 'semifinals', slotInfo.round, slotInfo.slot, finishedMatch.winner_id);
    }
  }

  if (finishedMatch.phase === 'semifinals') {
    const winnerSlot = getSemifinalWinnerSlot(finishedMatch.round);
    if (winnerSlot) {
      await assignTeamToMatch(tournamentId, 'final', winnerSlot.round, winnerSlot.slot, finishedMatch.winner_id);
    }

    const loserId = finishedMatch.team_a_id && finishedMatch.team_b_id
      ? (finishedMatch.winner_id === finishedMatch.team_a_id ? finishedMatch.team_b_id : finishedMatch.team_a_id)
      : null;

    if (loserId) {
      const loserSlot = getSemifinalLoserSlot(finishedMatch.round);
      if (loserSlot) {
        await assignTeamToMatch(tournamentId, 'third_place', loserSlot.round, loserSlot.slot, loserId);
      }
    }
  }
}
