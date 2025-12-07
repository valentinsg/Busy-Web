import { calculateStandings } from '@/lib/blacktop/standings';
import { getServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
