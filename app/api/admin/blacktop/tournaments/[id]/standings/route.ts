import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';
import { calculateStandings } from '@/lib/blacktop/standings';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tournamentId = parseInt(params.id);
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    
    if (groupId) {
      const standings = await calculateStandings(tournamentId, groupId);
      return NextResponse.json({ groupId, standings });
    }
    
    const supabase = getServiceClient();
    const { data: groups } = await supabase.from('groups').select('*').eq('tournament_id', tournamentId);
    
    if (!groups) return NextResponse.json({ standings: [] });
    
    const allStandings = await Promise.all(
      groups.map(async (group) => ({
        group,
        standings: await calculateStandings(tournamentId, group.id),
      }))
    );
    
    return NextResponse.json({ standings: allStandings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
