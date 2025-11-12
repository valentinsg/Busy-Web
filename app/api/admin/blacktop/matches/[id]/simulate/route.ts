import { NextRequest, NextResponse } from 'next/server';
import { simulateMatch } from '@/lib/blacktop/simulation';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const matchId = parseInt(params.id);
    await simulateMatch(matchId);
    
    return NextResponse.json({ success: true, message: 'Partido simulado' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
