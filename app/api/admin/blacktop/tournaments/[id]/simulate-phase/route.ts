import { NextRequest, NextResponse } from 'next/server';
import { simulatePhase } from '@/lib/blacktop/simulation';
import { invalidateTournamentCache } from '@/lib/blacktop/cache';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tournamentId = parseInt(params.id);
    await simulatePhase(tournamentId);
    
    // Invalidar cache del torneo
    invalidateTournamentCache(tournamentId);
    
    return NextResponse.json({ success: true, message: 'Fase simulada' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
