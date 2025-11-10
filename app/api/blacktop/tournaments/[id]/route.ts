import { NextRequest, NextResponse } from 'next/server';
import { getTournamentById, updateTournament, deleteTournament } from '@/lib/repo/blacktop';
import type { TournamentFormData } from '@/types/blacktop';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournament = await getTournamentById(parseInt(params.id));
    if (!tournament) {
      return NextResponse.json(
        { error: 'Torneo no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { error: 'Error al obtener torneo' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Partial<TournamentFormData> = await request.json();
    const tournament = await updateTournament(parseInt(params.id), body);
    return NextResponse.json(tournament);
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json(
      { error: 'Error al actualizar torneo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTournament(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json(
      { error: 'Error al eliminar torneo' },
      { status: 500 }
    );
  }
}
