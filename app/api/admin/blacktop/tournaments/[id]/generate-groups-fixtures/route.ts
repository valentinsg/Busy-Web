import { NextRequest, NextResponse } from 'next/server';
import { generateGroupsFixtures } from '@/lib/blacktop/fixtures';
import { getServiceClient } from '@/lib/supabase/server';
import { invalidateTournamentCache } from '@/lib/blacktop/cache';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tournamentId = parseInt(params.id);
    const matches = await generateGroupsFixtures(tournamentId);
    
    const supabase = getServiceClient();
    await supabase.from('tournaments').update({ tournament_status: 'groups' }).eq('id', tournamentId);
    
    // Invalidar cache del torneo
    invalidateTournamentCache(tournamentId);
    
    return NextResponse.json({ success: true, matchesCreated: matches.length, matches });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
