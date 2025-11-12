// lib/blacktop/standings.ts
import { getServiceClient } from '@/lib/supabase/server';
import type { StandingsRow } from '@/types/blacktop';

export async function calculateStandings(tournamentId: number, groupId: string): Promise<StandingsRow[]> {
  const supabase = getServiceClient();
  
  const { data: matches } = await supabase
    .from('matches')
    .select('*, fouls_a, fouls_b')
    .eq('tournament_id', tournamentId)
    .eq('group_id', groupId)
    .eq('phase', 'groups')
    .eq('status', 'finished');
  
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('tournament_id', tournamentId)
    .eq('group_id', groupId)
    .eq('status', 'approved');
  
  if (!matches || !teams) return [];
  
  const standings: Map<number, StandingsRow> = new Map();
  teams.forEach(team => {
    standings.set(team.id, {
      team_id: team.id,
      team_name: team.name,
      played: 0,
      won: 0,
      lost: 0,
      points_for: 0,
      points_against: 0,
      point_diff: 0,
      tournament_points: 0,
      win_pct: 0,
      streak: 0,
      total_fouls: 0,
    });
  });
  
  // Ordenar partidos por fecha para calcular racha
  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateA - dateB;
  });

  // Rastrear resultados por equipo para calcular racha
  const teamResults: Map<number, ('W' | 'L')[]> = new Map();
  teams.forEach(team => teamResults.set(team.id, []));

  sortedMatches.forEach((match: any) => {
    const teamAId = match.team_a_id;
    const teamBId = match.team_b_id;
    const scoreA = match.team_a_score || 0;
    const scoreB = match.team_b_score || 0;
    const foulsA = match.fouls_a || 0;
    const foulsB = match.fouls_b || 0;
    
    if (!teamAId || !teamBId) return;
    
    const statsA = standings.get(teamAId);
    const statsB = standings.get(teamBId);
    
    if (!statsA || !statsB) return;
    
    statsA.played++;
    statsB.played++;
    statsA.points_for += scoreA;
    statsA.points_against += scoreB;
    statsB.points_for += scoreB;
    statsB.points_against += scoreA;
    statsA.total_fouls += foulsA;
    statsB.total_fouls += foulsB;
    
    if (scoreA > scoreB) {
      statsA.won++;
      statsB.lost++;
      statsA.tournament_points += 2;
      statsB.tournament_points += 1;
      teamResults.get(teamAId)?.push('W');
      teamResults.get(teamBId)?.push('L');
    } else if (scoreB > scoreA) {
      statsB.won++;
      statsA.lost++;
      statsB.tournament_points += 2;
      statsA.tournament_points += 1;
      teamResults.get(teamBId)?.push('W');
      teamResults.get(teamAId)?.push('L');
    } else {
      statsA.tournament_points += 1;
      statsB.tournament_points += 1;
      // Empate no afecta racha
    }
  });
  
  const standingsArray = Array.from(standings.values());
  standingsArray.forEach(row => {
    row.point_diff = row.points_for - row.points_against;
    
    // Calcular porcentaje de victorias
    row.win_pct = row.played > 0 ? row.won / row.played : 0;
    
    // Calcular racha actual
    const results = teamResults.get(row.team_id) || [];
    let streak = 0;
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i] === 'W') {
        streak = streak >= 0 ? streak + 1 : 1;
      } else if (results[i] === 'L') {
        streak = streak <= 0 ? streak - 1 : -1;
      }
      // Si cambia la racha, parar
      if (i < results.length - 1 && results[i] !== results[i + 1]) break;
    }
    row.streak = streak;
  });
  
  standingsArray.sort((a, b) => {
    if (b.tournament_points !== a.tournament_points) return b.tournament_points - a.tournament_points;
    if (b.point_diff !== a.point_diff) return b.point_diff - a.point_diff;
    return b.points_for - a.points_for;
  });
  
  return standingsArray;
}

export async function getTopTeams(tournamentId: number, groupId: string, count: number): Promise<number[]> {
  const standings = await calculateStandings(tournamentId, groupId);
  return standings.slice(0, count).map(row => row.team_id);
}
