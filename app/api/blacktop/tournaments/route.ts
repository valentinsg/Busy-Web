import { NextRequest, NextResponse } from 'next/server';
import { getAllTournaments, createTournament } from '@/lib/repo/blacktop';
import type { TournamentFormData } from '@/types/blacktop';

export async function GET() {
  try {
    const tournaments = await getAllTournaments();
    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: 'Error al obtener torneos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TournamentFormData = await request.json();
    const tournament = await createTournament(body);
    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { error: 'Error al crear torneo' },
      { status: 500 }
    );
  }
}
