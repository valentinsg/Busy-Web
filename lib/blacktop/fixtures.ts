// lib/blacktop/fixtures.ts
import { getServiceClient } from '@/lib/supabase/server';
import type { Match } from '@/types/blacktop';

/**
 * Genera todos los enfrentamientos posibles para un grupo (round-robin)
 */
function generateRoundRobinMatches(teams: { id: number; name: string }[]) {
  const matches: Array<[number, number]> = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push([teams[i].id, teams[j].id]);
    }
  }
  return matches;
}

/**
 * Algoritmo mejorado que distribuye partidos evitando que un equipo juegue 3 veces seguidas
 * Usa un enfoque greedy: prioriza partidos donde los equipos llevan más tiempo sin jugar
 */
function optimizeMatchOrder(allGroupMatches: Array<{ groupId: number; groupName: string; matches: Array<[number, number]> }>) {
  const orderedMatches: any[] = [];
  const lastPlayedIndex: Map<number, number> = new Map(); // teamId -> último índice donde jugó
  let globalIndex = 0;

  // Crear pool de partidos pendientes por grupo
  const pendingByGroup = allGroupMatches.map(g => ({
    groupId: g.groupId,
    groupName: g.groupName,
    pending: [...g.matches]
  }));

  while (pendingByGroup.some(g => g.pending.length > 0)) {
    let bestMatch: { groupIdx: number; matchIdx: number; score: number } | undefined = undefined;

    // Evaluar todos los partidos pendientes
    pendingByGroup.forEach((group, groupIdx) => {
      group.pending.forEach((match, matchIdx) => {
        const [teamA, teamB] = match;
        const lastA = lastPlayedIndex.get(teamA) ?? -1000;
        const lastB = lastPlayedIndex.get(teamB) ?? -1000;

        // Score: cuanto mayor, mejor (más tiempo sin jugar)
        const gapA = globalIndex - lastA;
        const gapB = globalIndex - lastB;
        const score = Math.min(gapA, gapB); // Priorizamos el equipo que jugó más recientemente

        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { groupIdx, matchIdx, score };
        }
      });
    });

    if (!bestMatch) break;

    // Agregar el mejor partido encontrado
    const { groupIdx, matchIdx } = bestMatch;
    const selectedGroup = pendingByGroup[groupIdx];
    const [teamA, teamB] = selectedGroup.pending[matchIdx];

    orderedMatches.push({
      groupId: selectedGroup.groupId,
      groupName: selectedGroup.groupName,
      teamA,
      teamB
    });

    // Actualizar índices
    lastPlayedIndex.set(teamA, globalIndex);
    lastPlayedIndex.set(teamB, globalIndex);
    globalIndex++;

    // Remover partido del pool
    selectedGroup.pending.splice(matchIdx, 1);
  }

  return orderedMatches;
}

export async function generateGroupsFixtures(tournamentId: number): Promise<Match[]> {
  const supabase = getServiceClient();

  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('order_index', { ascending: true });

  if (!groups || groups.length === 0) {
    throw new Error('No hay grupos configurados para este torneo. Configura las zonas en el Admin antes de generar el fixture.');
  }

  // 1. Generar todos los enfrentamientos por grupo
  const allGroupMatches: Array<{ groupId: number; groupName: string; matches: Array<[number, number]> }> = [];

  for (const group of groups) {
    // 1) Fuente principal: equipos vinculados por group_id
    let teamsResult = await supabase
      .from('teams')
      .select('id, name')
      .eq('tournament_id', tournamentId)
      .eq('group_id', group.id)
      .eq('status', 'approved');

    let teams = teamsResult.data;

    // 2) Fallback legacy: si no hay equipos por group_id, intentar resolver por group_name
    if (!teams || teams.length === 0) {
      // Normalizar nombre de grupo a una letra: A, B, C...
      const letters = (group.name || '').match(/[A-Z]/gi) || [];
      const normalized = (letters[letters.length - 1] || 'A').toUpperCase();

      const fallbackQuery = await supabase
        .from('teams')
        .select('id, name')
        .eq('tournament_id', tournamentId)
        .eq('status', 'approved')
        .or(`group_name.eq.${normalized},group_name.eq.Zona ${normalized}`);

      const fallbackTeams = fallbackQuery.data || [];

      if (fallbackTeams.length > 0) {
        teams = fallbackTeams;

        // Self-heal: asignar group_id a estos equipos para futuras ejecuciones
        await supabase
          .from('teams')
          .update({ group_id: group.id })
          .eq('tournament_id', tournamentId)
          .eq('status', 'approved')
          .or(`group_name.eq.${normalized},group_name.eq.Zona ${normalized}`);
      }
    }

    if (!teams || teams.length === 0) {
      // Grupo sin equipos aprobados: lo saltamos pero dejamos un mensaje claro para debugging
      console.warn?.(
        '[BLACKTOP] Grupo sin equipos aprobados al generar fixture',
        { tournamentId, groupId: group.id, groupName: group.name }
      );
      continue;
    }

    const matches = generateRoundRobinMatches(teams);
    allGroupMatches.push({
      groupId: group.id,
      groupName: group.name,
      matches
    });
  }

  if (allGroupMatches.length === 0) {
    throw new Error(
      'No se encontraron equipos asignados a grupos (group_id). Verifica que todos los equipos aprobados tengan zona asignada y vuelve a intentar.'
    );
  }

  // 2. Optimizar orden de partidos
  const optimizedMatches = optimizeMatchOrder(allGroupMatches);

  // 3. Crear objetos de partido
  const matches = optimizedMatches.map((m, idx) => ({
    tournament_id: tournamentId,
    phase: 'groups',
    round: m.groupName,
    group_id: m.groupId,
    team_a_id: m.teamA,
    team_b_id: m.teamB,
    status: 'pending',
    match_number: idx + 1,
    current_period: 1,
    elapsed_seconds: 0,
    fouls_a: 0,
    fouls_b: 0,
  }));

  // 4. BORRAR TODOS LOS PARTIDOS DEL TORNEO (no solo grupos)
  await supabase.from('matches').delete().eq('tournament_id', tournamentId);

  // 5. Insertar nuevos partidos
  const { data: insertedMatches, error } = await supabase.from('matches').insert(matches).select();

  if (error) throw new Error(`Error al generar partidos: ${error.message}`);

  return insertedMatches || [];
}
