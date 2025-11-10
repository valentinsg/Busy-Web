import { NextRequest, NextResponse } from 'next/server';
import { registerTeam, getTournamentById } from '@/lib/repo/blacktop';
import { notifyTeamRegistration } from '@/lib/repo/blacktop-notifications';
import type { TeamRegistrationFormData } from '@/types/blacktop';

export async function POST(request: NextRequest) {
  try {
    const body: TeamRegistrationFormData = await request.json();

    // Validaciones básicas
    if (!body.team_name || !body.captain_name || !body.captain_instagram) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    if (!body.players || body.players.length < 3) {
      return NextResponse.json(
        { error: 'Se requieren al menos 3 jugadores' },
        { status: 400 }
      );
    }

    if (!body.accept_rules) {
      return NextResponse.json(
        { error: 'Debes aceptar el reglamento' },
        { status: 400 }
      );
    }

    const result = await registerTeam(body);

    if ((result as any).code === 'TEAM_NAME_TAKEN') {
      return NextResponse.json(result, { status: 409 });
    }

    // Si es un equipo nuevo, crear notificación
    if (result.isNewTeam && result.team) {
      try {
        const tournament = await getTournamentById(body.tournament_id);
        if (tournament) {
          await notifyTeamRegistration({
            teamId: result.team.id,
            teamName: result.team.name,
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            tournamentSlug: tournament.slug,
            captainName: result.team.captain_name,
            captainInstagram: result.team.captain_instagram,
            playersCount: body.players.length,
          });
        }
      } catch (notifError) {
        // No fallar el registro si falla la notificación
        console.error('Error creating notification:', notifError);
      }
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error registering team:', error);
    return NextResponse.json(
      { error: 'Error al registrar equipo' },
      { status: 500 }
    );
  }
}
