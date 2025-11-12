import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';
import { calculateElapsedSeconds } from '@/lib/blacktop/timer';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient();
    const matchId = parseInt(params.id);
    
    const { data: currentMatch } = await supabase.from('matches').select('*').eq('id', matchId).single();
    if (!currentMatch) throw new Error('Partido no encontrado');
    
    const elapsed = calculateElapsedSeconds(currentMatch);
    
    const { data: match, error } = await supabase
      .from('matches')
      .update({
        status: 'halftime',
        paused_at: new Date().toISOString(),
        elapsed_seconds: elapsed,
      })
      .eq('id', matchId)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(match);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
