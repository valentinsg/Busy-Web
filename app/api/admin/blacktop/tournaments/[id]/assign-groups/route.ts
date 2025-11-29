import { getServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Assignment {
  teamId: number;
  groupName: string;
  position: number;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient();
    const tournamentId = parseInt(params.id);

    const body = await req.json();
    const assignments: Assignment[] = body?.assignments || [];

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ error: 'No se enviaron asignaciones de grupos' }, { status: 400 });
    }

    // 1. Obtener torneo para conocer configuración básica
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }

    // 2. Determinar grupos necesarios a partir de las asignaciones
    const groupNames = Array.from(new Set(assignments.map(a => a.groupName))).sort();

    // 3. Obtener grupos existentes para el torneo
    const { data: existingGroups, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('order_index', { ascending: true });

    if (groupsError) {
      throw groupsError;
    }

    const groupsByName = new Map<string, any>();
    (existingGroups || []).forEach(g => {
      groupsByName.set(g.name, g);
    });

    // 4. Crear grupos que falten
    const groupsToInsert = groupNames
      .filter(name => !groupsByName.has(name))
      .map((name, index) => ({
        tournament_id: tournamentId,
        name,
        display_name: `Zona ${name}`,
        order_index: (existingGroups?.length || 0) + index + 1,
      }));

    if (groupsToInsert.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('groups')
        .insert(groupsToInsert)
        .select();

      if (insertError) {
        throw insertError;
      }

      (inserted || []).forEach(g => {
        groupsByName.set(g.name, g);
      });
    }

    // 5. Construir mapa definitivo groupName -> group_id
    const groupIdByName: Record<string, string> = {};
    groupNames.forEach(name => {
      const group = groupsByName.get(name);
      if (group) {
        groupIdByName[name] = group.id;
      }
    });

    // Sanity check: asegurarse de que todos los grupos tengan id
    const missing = groupNames.filter(name => !groupIdByName[name]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `No se pudieron resolver los grupos: ${missing.join(', ')}` },
        { status: 500 },
      );
    }

    // 6. Actualizar equipos con group_id, group_name y group_position
    await Promise.all(
      assignments.map(a => {
        const groupId = groupIdByName[a.groupName];
        return supabase
          .from('teams')
          .update({
            group_id: groupId,
            group_name: a.groupName,
            group_position: a.position,
          })
          .eq('id', a.teamId);
      }),
    );

    // 7. Respuesta con resumen
    return NextResponse.json({
      success: true,
      tournamentId,
      groups: groupIdByName,
      assignmentsCount: assignments.length,
    });
  } catch (error: any) {
    console.error('Error assigning groups for tournament', params.id, error);
    return NextResponse.json(
      { error: error?.message || 'Error al asignar grupos' },
      { status: 500 },
    );
  }
}
