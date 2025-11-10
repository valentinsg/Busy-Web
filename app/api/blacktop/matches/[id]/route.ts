import { NextRequest, NextResponse } from 'next/server';
import { updateMatch, deleteMatch } from '@/lib/repo/blacktop';
import type { MatchFormData } from '@/types/blacktop';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Partial<MatchFormData> = await request.json();
    const match = await updateMatch(parseInt(params.id), body);
    return NextResponse.json(match);
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Error al actualizar partido' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteMatch(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting match:', error);
    return NextResponse.json(
      { error: 'Error al eliminar partido' },
      { status: 500 }
    );
  }
}
