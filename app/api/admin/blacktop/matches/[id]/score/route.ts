import { invalidateTournamentCache } from '@/lib/blacktop/cache';
import { getServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient();
    const matchId = parseInt(params.id);
    const body = await req.json();

    const { team_a_score, team_b_score, fouls_a, fouls_b } = body;

    // 1) Obtener el partido con su torneo para validar golden point
    const { data: currentMatch, error: matchFetchError } = await supabase
      .from('matches')
      .select('id, tournament_id')
      .eq('id', matchId)
      .single();

    if (matchFetchError || !currentMatch) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, golden_point_enabled')
      .eq('id', currentMatch.tournament_id)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }

    // 2) Si el torneo tiene punto de oro, NO permitir empates
    if (tournament.golden_point_enabled && team_a_score !== null && team_b_score !== null && team_a_score === team_b_score) {
      return NextResponse.json(
        { error: 'Este torneo tiene Punto de Oro activado: no se pueden guardar partidos empatados.' },
        { status: 400 }
      );
    }

    const { data: match, error } = await supabase
      .from('matches')
      .update({
        team_a_score,
        team_b_score,
        fouls_a,
        fouls_b,
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;

    // Invalidar cache del torneo
    if (match) {
      invalidateTournamentCache(match.tournament_id);
    }

    return NextResponse.json(match);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
