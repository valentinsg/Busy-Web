import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPublicTournaments } from '@/lib/repo/blacktop';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

async function TournamentsList() {
  const tournaments = await getPublicTournaments();

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-white/60">
          Próximamente...
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tournaments.map((tournament) => (
        <Link key={tournament.id} href={`/blacktop/${tournament.slug}`}>
          <div
            className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all hover:scale-105 cursor-pointer h-full"
            style={{ borderColor: `${tournament.accent_color}40` }}
          >
            <h3 className="text-2xl font-bold mb-4" style={{ color: tournament.accent_color }}>
              {tournament.name}
            </h3>

            {tournament.description && (
              <p className="text-white/70 mb-4">{tournament.description}</p>
            )}

            <div className="space-y-2 text-sm text-white/60 mb-4">
              {tournament.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(tournament.date), "d 'de' MMMM, yyyy", { locale: es })}
                  </span>
                </div>
              )}
              {tournament.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{tournament.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Máx. {tournament.max_teams} equipos</span>
              </div>
            </div>

            {tournament.registration_open && (
              <div
                className="inline-flex items-center gap-2 text-sm font-bold"
                style={{ color: tournament.accent_color }}
              >
                Inscripciones abiertas
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function BlacktopPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center space-y-6">
            <h1
              className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-abstract-slab)' }}
            >
              BUSY BLACKTOP
            </h1>
            <p className="text-2xl md:text-3xl text-white/80 max-w-3xl mx-auto">
              Torneos 3v3 de básquet. Cultura, comunidad y competencia.
            </p>
          </div>
        </div>
      </div>

      {/* Torneos */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-2">Torneos</h2>
          <p className="text-white/60">Encontrá tu próximo desafío</p>
        </div>

        <Suspense fallback={<div>Cargando torneos...</div>}>
          <TournamentsList />
        </Suspense>
      </div>

      {/* Footer */}
      <div className="py-12 text-center text-white/60 text-sm border-t border-white/10">
        <p>BUSY BLACKTOP © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
