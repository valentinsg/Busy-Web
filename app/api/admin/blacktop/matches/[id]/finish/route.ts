import { invalidateTournamentCache } from '@/lib/blacktop/cache';
import { propagatePlayoffProgress } from '@/lib/blacktop/playoffs';
import { getServiceClient } from '@/lib/supabase/server';
import type { Match } from '@/types/blacktop';
import { NextRequest, NextResponse } from 'next/server';

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

    await propagatePlayoffProgress(currentMatch.tournament_id, match as Match);

    // Invalidar cache del torneo
    invalidateTournamentCache(currentMatch.tournament_id);

    return NextResponse.json(match);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
