import { NextRequest, NextResponse } from 'next/server';
import { getMatchesByTournament } from '@/lib/repo/blacktop';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matches = await getMatchesByTournament(parseInt(params.id));
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Error al obtener partidos' },
      { status: 500 }
    );
  }
}
