import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';
import { invalidateTournamentCache } from '@/lib/blacktop/cache';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient();
    const matchId = parseInt(params.id);
    const body = await req.json();
    
    const { team_a_score, team_b_score, fouls_a, fouls_b } = body;
    
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
