import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Tournament } from '@/types/blacktop';
import type { ReactNode } from 'react';

interface TournamentHeaderProps {
  tournament: Tournament;
  teamsCount?: number;
  children?: ReactNode;
}

export function TournamentHeader({ tournament, teamsCount = 0, children }: TournamentHeaderProps) {
  const isFull = teamsCount >= tournament.max_teams;
  return (
    <div className="relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6">
          {/* Logo/Título */}
          <div className="space-y-2">
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-abstract-slab)' }}
            >
              {tournament.name}
            </h1>
            {tournament.description && (
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-body">
                {tournament.description}
              </p>
            )}
          </div>

          {/* Info del torneo */}
          <div className="flex flex-wrap justify-center gap-6 text-white/90 font-body">
            {tournament.date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {format(new Date(tournament.date), "d 'de' MMMM, yyyy", { locale: es })}
                  {tournament.time && ` • ${tournament.time}`}
                </span>
              </div>
            )}
            {tournament.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{tournament.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{tournament.max_teams} equipos</span>
            </div>
          </div>

          {/* CTA */}
          {tournament.registration_open && !isFull && (
            <div className="pt-6">
              <Link href={`/blacktop/${tournament.slug}/inscripcion`}>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 font-bold text-white hover:text-white"
                  style={{ backgroundColor: tournament.accent_color }}
                >
                  INSCRIBÍ TU EQUIPO
                </Button>
              </Link>
              <p className="text-sm text-white/60 mt-3 font-body">
                {tournament.players_per_team_min}-{tournament.players_per_team_max} jugadores por equipo
              </p>
            </div>
          )}
          {isFull && (
            <div className="pt-6">
              <div className="text-lg px-8 py-4 font-bold text-white/70 border-2 border-white/20 rounded-lg inline-block">
                CUPOS COMPLETOS
              </div>
            </div>
          )}

          {/* Extra header content (e.g., Tabs navigation) */}
          {children}
        </div>
      </div>
    </div>
  );
}
