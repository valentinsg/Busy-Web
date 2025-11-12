import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';
import { invalidateTournamentCache } from '@/lib/blacktop/cache';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient();
    const matchId = parseInt(params.id);
    const { stats } = await req.json();

    // Obtener el match para saber el tournament_id
    const { data: match } = await supabase
      .from('matches')
      .select('tournament_id')
      .eq('id', matchId)
      .single();

    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    // Borrar stats anteriores de este partido
    await supabase
      .from('player_match_stats')
      .delete()
      .eq('match_id', matchId);

    // Insertar nuevas stats
    const statsToInsert = stats.map((s: any) => ({
      match_id: matchId,
      player_id: s.player_id,
      points: s.points || 0,
      assists: s.assists || 0,
      rebounds: s.rebounds || 0,
      steals: s.steals || 0,
      blocks: s.blocks || 0,
      turnovers: s.turnovers || 0,
      is_mvp: s.is_mvp || false,
    }));

    const { error } = await supabase
      .from('player_match_stats')
      .insert(statsToInsert);

    if (error) throw error;

    // Invalidar cache del torneo
    invalidateTournamentCache(match.tournament_id);

    return NextResponse.json({ success: true, statsCount: statsToInsert.length });
  } catch (error: any) {
    console.error('Error saving player stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
