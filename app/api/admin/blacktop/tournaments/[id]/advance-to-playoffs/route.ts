import { NextRequest, NextResponse } from 'next/server';
import { advanceToPlayoffs } from '@/lib/blacktop/playoffs';
import { invalidateTournamentCache } from '@/lib/blacktop/cache';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tournamentId = parseInt(params.id);
    const matches = await advanceToPlayoffs(tournamentId);
    
    // Invalidar cache del torneo
    invalidateTournamentCache(tournamentId);
    
    return NextResponse.json({ success: true, playoffMatchesCreated: matches.length, matches });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
