import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';
import type { Team } from '@/types/blacktop';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient();
    const tournamentId = parseInt(params.id);

    // Get tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }

    // Get approved teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('status', 'approved')
      .order('group_name', { ascending: true })
      .order('group_position', { ascending: true });

    if (teamsError || !teams || teams.length === 0) {
      return NextResponse.json({ error: 'No hay equipos aprobados' }, { status: 400 });
    }

    const matches: any[] = [];

    if (tournament.format_type === 'groups_playoff') {
      // Agrupar equipos por zona
      const groups: { [key: string]: Team[] } = {};
      teams.forEach(team => {
        const groupKey = team.group_name || 'A';
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(team);
      });

      // Generar partidos de grupos (todos contra todos)
      Object.entries(groups).forEach(([groupName, groupTeams]) => {
        const roundKey = `group_${groupName.toLowerCase()}`;
        
        for (let i = 0; i < groupTeams.length; i++) {
          for (let j = i + 1; j < groupTeams.length; j++) {
            matches.push({
              tournament_id: tournamentId,
              team_a_id: groupTeams[i].id,
              team_b_id: groupTeams[j].id,
              round: roundKey,
              status: 'pending',
              match_number: matches.length + 1,
            });
          }
        }
      });

      // Generar partidos de playoff (sin equipos asignados aún)
      const numGroups = Object.keys(groups).length;
      const teamsAdvancePerGroup = tournament.teams_advance_per_group || 2;

      if (teamsAdvancePerGroup >= 2) {
        // Semifinales
        for (let i = 0; i < teamsAdvancePerGroup; i++) {
          matches.push({
            tournament_id: tournamentId,
            round: 'semifinal',
            status: 'scheduled',
            match_number: matches.length + 1,
          });
        }

        // Final
        matches.push({
          tournament_id: tournamentId,
          round: 'final',
          status: 'scheduled',
          match_number: matches.length + 1,
        });

        // Tercer puesto (si está habilitado)
        if (tournament.third_place_match) {
          matches.push({
            tournament_id: tournamentId,
            round: 'third_place',
            status: 'scheduled',
            match_number: matches.length + 1,
          });
        }
      }
    } else if (tournament.format_type === 'round_robin') {
      // Todos contra todos
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          matches.push({
            tournament_id: tournamentId,
            team_a_id: teams[i].id,
            team_b_id: teams[j].id,
            round: 'group_a',
            status: 'scheduled',
            match_number: matches.length + 1,
          });
        }
      }
    } else if (tournament.format_type === 'single_elimination') {
      // Eliminación directa
      const numRounds = Math.ceil(Math.log2(teams.length));
      let roundTeams = teams.length;

      for (let round = 0; round < numRounds; round++) {
        const roundName = round === numRounds - 1 ? 'final' : 
                         round === numRounds - 2 ? 'semifinal' : 
                         `round_${round + 1}`;
        
        const matchesInRound = Math.ceil(roundTeams / 2);
        
        for (let i = 0; i < matchesInRound; i++) {
          const match: any = {
            tournament_id: tournamentId,
            round: roundName,
            status: 'scheduled',
            match_number: matches.length + 1,
          };

          // Asignar equipos solo en la primera ronda
          if (round === 0 && i * 2 < teams.length) {
            match.team_a_id = teams[i * 2].id;
            if (i * 2 + 1 < teams.length) {
              match.team_b_id = teams[i * 2 + 1].id;
            }
          }

          matches.push(match);
        }

        roundTeams = matchesInRound;
      }

      // Tercer puesto
      if (tournament.third_place_match) {
        matches.push({
          tournament_id: tournamentId,
          round: 'third_place',
          status: 'scheduled',
          match_number: matches.length + 1,
        });
      }
    }

    // Eliminar partidos existentes
    await supabase
      .from('matches')
      .delete()
      .eq('tournament_id', tournamentId);

    // Insertar nuevos partidos
    const { data: insertedMatches, error: insertError } = await supabase
      .from('matches')
      .insert(matches)
      .select();

    if (insertError) {
      console.error('Error inserting matches:', insertError);
      return NextResponse.json({ error: 'Error al generar partidos' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      matchesCreated: insertedMatches?.length || 0,
      matches: insertedMatches,
    });
  } catch (error) {
    console.error('Error generating matches:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
