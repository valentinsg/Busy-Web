import { NextRequest, NextResponse } from 'next/server';
import { registerTeam, getTournamentById } from '@/lib/repo/blacktop';
import { notifyTeamRegistration } from '@/lib/repo/blacktop-notifications';
import type { TeamRegistrationFormData } from '@/types/blacktop';
import { getServiceClient } from '@/lib/supabase/server';

async function uploadImage(file: File, path: string): Promise<string | null> {
  try {
    const supabase = getServiceClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('blacktop')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('blacktop')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extraer datos del formulario
    const tournament_id = parseInt(formData.get('tournament_id') as string);
    const team_name = formData.get('team_name') as string;
    const captain_name = formData.get('captain_name') as string;
    const captain_instagram = formData.get('captain_instagram') as string;
    const email = formData.get('email') as string;
    const whatsapp_or_phone = formData.get('whatsapp_or_phone') as string;
    const accept_rules = formData.get('accept_rules') === 'true';
    const accept_image_rights = formData.get('accept_image_rights') === 'true';
    const team_photo = formData.get('team_photo') as File | null;

    // Validaciones básicas
    if (!team_name || !captain_name || !captain_instagram || !email) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    if (!accept_rules) {
      return NextResponse.json(
        { error: 'Debes aceptar el reglamento' },
        { status: 400 }
      );
    }

    // Extraer jugadores
    const players: any[] = [];
    let playerIndex = 0;
    
    while (formData.has(`players[${playerIndex}][full_name]`)) {
      const player = {
        full_name: formData.get(`players[${playerIndex}][full_name]`) as string,
        instagram_handle: formData.get(`players[${playerIndex}][instagram_handle]`) as string,
        email: formData.get(`players[${playerIndex}][email]`) as string,
        is_captain: formData.get(`players[${playerIndex}][is_captain]`) === 'true',
        photo: formData.get(`players[${playerIndex}][photo]`) as File | null,
      };
      players.push(player);
      playerIndex++;
    }

    if (players.length < 3) {
      return NextResponse.json(
        { error: 'Se requieren al menos 3 jugadores' },
        { status: 400 }
      );
    }

    // Upload de foto del equipo
    let team_logo_url: string | null = null;
    if (team_photo && team_photo.size > 0) {
      team_logo_url = await uploadImage(team_photo, 'teams');
    }

    // Upload de fotos de jugadores
    const playersWithPhotos = await Promise.all(
      players.map(async (player) => {
        let photo_url: string | null = null;
        if (player.photo && player.photo.size > 0) {
          photo_url = await uploadImage(player.photo, 'players');
        }
        return {
          full_name: player.full_name,
          instagram_handle: player.instagram_handle,
          email: player.email,
          is_captain: player.is_captain,
          photo_url,
        };
      })
    );

    // Preparar datos para registro
    const registrationData: TeamRegistrationFormData = {
      tournament_id,
      team_name,
      captain_name,
      captain_instagram,
      email,
      whatsapp_or_phone,
      players: playersWithPhotos,
      accept_rules,
      accept_image_rights,
    };

    const result = await registerTeam(registrationData, team_logo_url);

    if ((result as any).code === 'TEAM_NAME_TAKEN') {
      return NextResponse.json(result, { status: 409 });
    }

    // Si es un equipo nuevo, crear notificación y agregar emails a newsletter
    if (result.isNewTeam && result.team) {
      try {
        const tournament = await getTournamentById(tournament_id);
        if (tournament) {
          await notifyTeamRegistration({
            teamId: result.team.id,
            teamName: result.team.name,
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            tournamentSlug: tournament.slug,
            captainName: result.team.captain_name,
            captainInstagram: result.team.captain_instagram,
            playersCount: players.length,
          });
        }
      } catch (notifError) {
        // No fallar el registro si falla la notificación
        console.error('Error creating notification:', notifError);
      }

      // Agregar emails a la newsletter (capitán + jugadores)
      try {
        const supabase = getServiceClient();
        const allEmails = [email, ...playersWithPhotos.map(p => p.email)];
        const uniqueEmails = [...new Set(allEmails)]; // Eliminar duplicados

        for (const playerEmail of uniqueEmails) {
          // Verificar si ya existe
          const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('email, status')
            .eq('email', playerEmail)
            .maybeSingle();

          if (!existing) {
            // Agregar nuevo suscriptor
            await supabase
              .from('newsletter_subscribers')
              .insert({
                email: playerEmail,
                status: 'subscribed',
                token: null,
              });
          } else if (existing.status !== 'subscribed') {
            // Reactivar si estaba inactivo
            await supabase
              .from('newsletter_subscribers')
              .update({ status: 'subscribed', token: null })
              .eq('email', playerEmail);
          }
        }
      } catch (newsletterError) {
        // No fallar el registro si falla la newsletter
        console.error('Error adding to newsletter:', newsletterError);
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
