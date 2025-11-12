import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const matchId = parseInt(params.id);
    const supabase = getServiceClient();

    // Get current match
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('*, tournaments(periods_count)')
      .eq('id', matchId)
      .single();

    if (fetchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const tournament = match.tournaments as any;
    const nextPeriod = match.current_period + 1;

    // Validate
    if (nextPeriod > tournament.periods_count) {
      return NextResponse.json({ error: 'No more periods' }, { status: 400 });
    }

    // Update to next period and set status to halftime
    const { data: updated, error: updateError } = await supabase
      .from('matches')
      .update({
        current_period: nextPeriod,
        status: 'halftime',
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
