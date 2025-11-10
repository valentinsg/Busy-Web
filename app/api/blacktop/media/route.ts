import { NextRequest, NextResponse } from 'next/server';
import { createTournamentMedia, deleteTournamentMedia } from '@/lib/repo/blacktop';
import type { TournamentMediaFormData } from '@/types/blacktop';

export async function POST(request: NextRequest) {
  try {
    const body: TournamentMediaFormData = await request.json();
    const media = await createTournamentMedia(body);
    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error('Error creating media:', error);
    return NextResponse.json(
      { error: 'Error al crear media' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      );
    }

    await deleteTournamentMedia(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Error al eliminar media' },
      { status: 500 }
    );
  }
}
