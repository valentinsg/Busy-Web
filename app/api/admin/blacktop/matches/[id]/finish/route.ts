import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';
import { invalidateTournamentCache } from '@/lib/blacktop/cache';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient();
    const matchId = parseInt(params.id);
    
    const { data: currentMatch } = await supabase.from('matches').select('*').eq('id', matchId).single();
    if (!currentMatch) throw new Error('Partido no encontrado');
    
    const winnerId = (currentMatch.team_a_score || 0) > (currentMatch.team_b_score || 0) 
      ? currentMatch.team_a_id 
      : currentMatch.team_b_id;
    
    const { data: match, error } = await supabase
      .from('matches')
      .update({
        status: 'finished',
        finished_at: new Date().toISOString(),
        winner_id: winnerId,
      })
      .eq('id', matchId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Invalidar cache del torneo
    invalidateTournamentCache(currentMatch.tournament_id);
    
    return NextResponse.json(match);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
