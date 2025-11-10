import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supabase = getServiceClient();

    // Verificar si ya existe stat para este jugador en este partido
    const { data: existing } = await supabase
      .from('player_match_stats')
      .select('id')
      .eq('match_id', parseInt(params.id))
      .eq('player_id', body.player_id)
      .single();

    if (existing) {
      // Actualizar
      const { data, error } = await supabase
        .from('player_match_stats')
        .update({
          points: body.points || 0,
          assists: body.assists || 0,
          rebounds: body.rebounds || 0,
          steals: body.steals || 0,
          blocks: body.blocks || 0,
          turnovers: body.turnovers || 0,
          is_mvp: !!body.is_mvp,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // Crear
      const { data, error } = await supabase
        .from('player_match_stats')
        .insert({
          match_id: parseInt(params.id),
          player_id: body.player_id,
          points: body.points || 0,
          assists: body.assists || 0,
          rebounds: body.rebounds || 0,
          steals: body.steals || 0,
          blocks: body.blocks || 0,
          turnovers: body.turnovers || 0,
          is_mvp: !!body.is_mvp,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    }
  } catch (error) {
    console.error('Error saving player stats:', error);
    return NextResponse.json(
      { error: 'Error al guardar estadísticas' },
      { status: 500 }
    );
  }
}
