import { NextRequest, NextResponse } from 'next/server';
import { getTeamsByTournament } from '@/lib/repo/blacktop';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const teams = await getTeamsByTournament(parseInt(params.id), status);
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Error al obtener equipos' },
      { status: 500 }
    );
  }
}
