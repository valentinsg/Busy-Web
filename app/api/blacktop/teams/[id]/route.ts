import { NextRequest, NextResponse } from 'next/server';
import { getTeamById, deleteTeam } from '@/lib/repo/blacktop';
import { getServiceClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const team = await getTeamById(parseInt(params.id));
    if (!team) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Error al obtener equipo' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient();
    const body = await request.json();

    // Sanitizar: no permitir id/tournament_id en update
    const { id, tournament_id, created_at, updated_at, ...update } = body || {};

    const { data, error } = await supabase
      .from('teams')
      .update(update)
      .eq('id', parseInt(params.id))
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Error al actualizar equipo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTeam(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Error al eliminar equipo' },
      { status: 500 }
    );
  }
}
