import { Button } from '@/components/ui/button';
import type { Tournament } from '@/types/blacktop';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface TournamentHeaderProps {
  tournament: Tournament;
  teamsCount?: number;
  children?: ReactNode;
}

export function TournamentHeader({ tournament, teamsCount = 0, children }: TournamentHeaderProps) {
  const isFull = teamsCount >= tournament.max_teams;

  // Usar banner por defecto
  const bannerSrc = '/blacktop-bannerr.png';

  return (
    <div className="relative">
      {/* Banner con zoom para recortar bordes y más altura para mostrar la pelota */}
      <div id="tournament-hero" className="relative w-full h-[420px] sm:h-[520px] md:h-[620px] overflow-hidden ">
        <div className="absolute inset-0 scale-110">
          <Image
            src={bannerSrc}
            alt={tournament.name}
            fill
            sizes="100vw"
            priority
            className="object-cover object-center"
          />
        </div>
        {/* Gradient suave de conexión inferior */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Contenido sobre el banner */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 sm:pb-16 md:pb-20">
          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 text-center">
            {/* CTA Button / Estado - Arriba */}
            <div className="mb-6">
              {tournament.registration_open && !isFull ? (
                <Link href={`/blacktop/${tournament.slug}/inscripcion`}>
                  <Button
                    size="lg"
                    className="relative text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 font-bold text-white hover:text-white transition-all hover:scale-[1.02] rounded-xl overflow-hidden group"
                    style={{ 
                      backgroundColor: tournament.accent_color,
                      boxShadow: `0 8px 32px ${tournament.accent_color}25, inset 0 1px 0 rgba(255,255,255,0.1)`
                    }}
                  >
                    {/* Liquid glass effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <span className="relative z-10">INSCRIBÍ TU EQUIPO</span>
                  </Button>
                </Link>
              ) : (
                <div className="relative inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-black/40 backdrop-blur-xl border overflow-hidden" style={{ borderColor: `${tournament.accent_color}30`, boxShadow: `0 8px 32px ${tournament.accent_color}15, inset 0 1px 0 rgba(255,255,255,0.05)` }}>
                  {/* Liquid glass shine */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
                  <div className="w-2 h-2 rounded-full animate-pulse relative z-10" style={{ backgroundColor: tournament.accent_color, boxShadow: `0 0 8px ${tournament.accent_color}` }} />
                  <span className="text-sm sm:text-base font-bold tracking-wide relative z-10" style={{ color: tournament.accent_color }}>
                    {isFull ? 'CUPOS COMPLETOS' : 'INSCRIPCIONES CERRADAS'}
                  </span>
                </div>
              )}
            </div>

            {/* Info bar - diseño horizontal sin wrap */}
            <div className="relative w-full max-w-6xl mx-auto px-2 sm:px-4">
              <div className="relative flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-black/30 backdrop-blur-2xl border overflow-x-auto scrollbar-hide font-body" style={{ borderColor: `${tournament.accent_color}20`, boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)` }}>
                {/* Liquid glass gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none rounded-xl sm:rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-xl sm:rounded-2xl" />
                {/* Fecha */}
                {tournament.date && (
                  <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
                    <div className="p-1.5 sm:p-2 rounded-lg" style={{ backgroundColor: `${tournament.accent_color}30` }}>
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: tournament.accent_color, filter: 'brightness(1.2)' }} />
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-medium whitespace-nowrap" style={{ color: tournament.accent_color, opacity: 0.8 }}>Fecha</p>
                      <p className="text-xs sm:text-sm font-bold whitespace-nowrap" style={{ color: tournament.accent_color }}>{format(new Date(tournament.date), "d MMM, yyyy", { locale: es })}</p>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="w-px h-8 sm:h-10 flex-shrink-0 relative z-10" style={{ backgroundColor: `${tournament.accent_color}20` }} />

                {/* Ubicación */}
                {tournament.location && (
                  <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
                    <div className="p-1.5 sm:p-2 rounded-lg" style={{ backgroundColor: `${tournament.accent_color}30` }}>
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: tournament.accent_color, filter: 'brightness(1.2)' }} />
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-medium whitespace-nowrap" style={{ color: tournament.accent_color, opacity: 0.8 }}>Ubicación</p>
                      <p className="text-xs sm:text-sm font-bold whitespace-nowrap" style={{ color: tournament.accent_color }}>{tournament.location}</p>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="w-px h-8 sm:h-10 flex-shrink-0 relative z-10" style={{ backgroundColor: `${tournament.accent_color}20` }} />

                {/* Equipos */}
                <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
                  <div className="p-1.5 sm:p-2 rounded-lg" style={{ backgroundColor: `${tournament.accent_color}30` }}>
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: tournament.accent_color, filter: 'brightness(1.2)' }} />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-medium whitespace-nowrap" style={{ color: tournament.accent_color, opacity: 0.8 }}>Equipos</p>
                    <p className="text-xs sm:text-sm font-bold whitespace-nowrap">
                      <span style={{ color: tournament.accent_color }}>{teamsCount || 0}</span>
                      <span className="text-white/40">/{tournament.max_teams}</span>
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px h-8 sm:h-10 flex-shrink-0 relative z-10" style={{ backgroundColor: `${tournament.accent_color}20` }} />

                {/* Jugadores por equipo */}
                <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
                  <div className="p-1.5 sm:p-2 rounded-lg" style={{ backgroundColor: `${tournament.accent_color}30` }}>
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: tournament.accent_color, filter: 'brightness(1.2)' }} />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-medium whitespace-nowrap" style={{ color: tournament.accent_color, opacity: 0.8 }}>Jugadores</p>
                    <p className="text-xs sm:text-sm font-bold whitespace-nowrap" style={{ color: tournament.accent_color }}>
                      {tournament.players_per_team_min}-{tournament.players_per_team_max} por equipo
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full" style={{ backgroundColor: tournament.accent_color, opacity: 0.5 }} />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full" style={{ backgroundColor: tournament.accent_color, opacity: 0.5 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation - separado del banner */}
      <div className="relative bg-black py-6">
        <div className="max-w-7xl mx-auto px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
