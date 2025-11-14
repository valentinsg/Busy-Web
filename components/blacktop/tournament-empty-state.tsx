'use client';

import { Button } from '@/components/ui/button';
import type { Tournament } from '@/types/blacktop';
import { Instagram, Mail, Phone } from 'lucide-react';
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
      {/* Título simple arriba del flyer, sin bordes ni fondo */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">¡El torneo está por comenzar!</h2>
        {startDate && (
          <p className="text-xl sm:text-2xl font-semibold" style={{ color: tournament.accent_color }}>
            {startDate}
          </p>
        )}
      </div>

      {/* Carousel de flyers si existen */}
      {tournament.flyer_images && tournament.flyer_images.length > 0 && (
        <TournamentFlyerCarousel
          images={tournament.flyer_images}
          tournamentName={tournament.name}
          accentColor={tournament.accent_color}
        />
      )}

      {/* Descripción + Información importante en el mismo bloque, sin card */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <p className="text-lg text-white/80 leading-relaxed">
          Las inscripciones están abiertas. Registra tu equipo y te avisaremos por <strong className="text-white">email</strong> o <strong className="text-white">WhatsApp</strong> cuando sea el momento de participar.
        </p>
        <p className="text-sm text-white/70 leading-relaxed">
          <strong className="text-white">Información importante:</strong> revisa atentamente las <strong className="text-white">Reglas</strong> antes de inscribirte. Serán estrictamente respetadas para asegurar la integridad de la gente y la calidad de la competencia.
        </p>
        <div className="flex flex-col items-center justify-center text-white/70">
          <p className="text-sm sm:text-base items-center gap-2">
            No olvides seguir los pasos que dejamos en {""}
            <span className="inline-flex items-center gap-1 font-semibold text-white mt-2">
              <Instagram className="h-4 w-4" style={{ color: tournament.accent_color }} />
              @busy.streetwear
            </span>
          </p>
        </div>
      </div>

      {/* CTAs: Inscripción + Seguir en Instagram */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        {tournament.registration_open && (
          <Button
            onClick={() => router.push(`/blacktop/${tournament.slug}/inscripcion`)}
            size="lg"
            className="relative text-lg px-8 py-6 font-bold transition-all hover:scale-105 rounded-xl overflow-hidden border text-white"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.98))',
              borderColor: tournament.accent_color,
              boxShadow: `0 8px 28px ${tournament.accent_color}20, 0 0 0 1px ${tournament.accent_color}40 inset`
            }}
          >
            <span className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.08), transparent 40%)' }} />
            <span className="relative z-10">Inscribir mi equipo</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/60 max-w-xl mx-auto">
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
  );
}
