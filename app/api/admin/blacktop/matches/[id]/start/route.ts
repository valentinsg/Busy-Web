import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient();
    const matchId = parseInt(params.id);
    
    const { data: match, error } = await supabase
      .from('matches')
      .update({
        status: 'live',
        started_at: new Date().toISOString(),
        paused_at: null,
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
