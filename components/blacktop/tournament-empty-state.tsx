'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Mail, Phone, Instagram } from 'lucide-react';
import type { Tournament } from '@/types/blacktop';
import { useRouter } from 'next/navigation';
import { TournamentFlyerCarousel } from './tournament-flyer-carousel';

interface TournamentEmptyStateProps {
  tournament: Tournament;
}

export function TournamentEmptyState({ tournament }: TournamentEmptyStateProps) {
  const router = useRouter();
  
  // Formatear fecha de inicio
  const startDate = tournament.date 
    ? new Date(tournament.date).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  return (
    <div className="space-y-8 font-body max-w-4xl mx-auto">
      {/* Carousel de flyers si existen */}
      {tournament.flyer_images && tournament.flyer_images.length > 0 && (
        <TournamentFlyerCarousel
          images={tournament.flyer_images}
          tournamentName={tournament.name}
          accentColor={tournament.accent_color}
        />
      )}

      {/* Card principal con información */}
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border-2 border-white/20">
        <CardContent className="p-8 sm:p-12 text-center space-y-6">
          {/* Icono */}
          <div 
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${tournament.accent_color}20` }}
          >
            <Calendar className="h-10 w-10" style={{ color: tournament.accent_color }} />
          </div>

          {/* Título */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              ¡El torneo está por comenzar!
            </h2>
            {startDate && (
              <p className="text-xl sm:text-2xl font-semibold" style={{ color: tournament.accent_color }}>
                {startDate}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="text-lg text-white/80 leading-relaxed">
              Las inscripciones están abiertas. Registra tu equipo y te avisaremos por <strong className="text-white">email</strong> o <strong className="text-white">WhatsApp</strong> cuando sea el momento de participar.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-white/70">
              <Instagram className="h-5 w-5" style={{ color: tournament.accent_color }} />
              <p className="text-sm sm:text-base">
                No olvides seguir los pasos que dejamos en <strong className="text-white">@busy.streetwear</strong>
              </p>
            </div>
          </div>

          {/* CTAs: Inscripción + Seguir en Instagram */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {tournament.registration_open && (
              <Button
                onClick={() => router.push(`/blacktop/${tournament.slug}/inscripcion`)}
                size="lg"
                className="text-lg px-8 py-6 font-bold shadow-lg hover:scale-105 transition-all"
                style={{ 
                  backgroundColor: tournament.accent_color,
                  color: '#000'
                }}
              >
                Inscribir mi equipo
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open('https://instagram.com/busy.streetwear', '_blank', 'noopener,noreferrer')}
              className="text-lg px-8 py-6 font-bold bg-white/10 border-white/20 hover:bg-white/20"
            >
              Seguir en Instagram
            </Button>
          </div>

          {/* Info adicional */}
          <div className="pt-6 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/60">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Confirmación por email</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Notificaciones por WhatsApp</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reglas si existen */}
      {tournament.rules_content && (
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span style={{ color: tournament.accent_color }}>📋</span>
              Información importante
            </h3>
            <div className="prose prose-invert prose-sm max-w-none text-white/70">
              <p>
                Revisa el reglamento completo en la pestaña <strong className="text-white">Reglas</strong> antes de inscribirte.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Mapa de ubicación del evento */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Ubicación del evento</h3>
            {tournament.location && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tournament.location)}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm underline text-white/80 hover:text-white"
              >
                Abrir en Google Maps
              </a>
            )}
          </div>
          <div className="relative w-full aspect-[4/3]">
            <iframe
              title="Mapa del evento"
              className="absolute inset-0 w-full h-full border-0 rounded-b-md"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(tournament.location || tournament.name)}&output=embed`}
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
