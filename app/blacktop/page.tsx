import { Button } from '@/components/ui/button';
import { getPublicTournaments, getTournamentWithStats } from '@/lib/repo/blacktop';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Busy Blacktop | Torneos 3v3 de básquet',
  description:
    'Busy Blacktop es nuestro circuito de torneos 3v3: cultura, comunidad y competencia. Inscribí tu equipo y viví la experiencia Busy en la cancha.',
  keywords: [
    'busy blacktop',
    'torneo 3v3',
    'básquet',
    'streetball',
    'mar del plata',
  ],
  openGraph: {
    title: 'Busy Blacktop | Torneos 3v3 de básquet',
    description:
      'Nuestro circuito de torneos 3v3 con cultura, comunidad y competencia. Sumate con tu equipo.',
    type: 'website',
    url: 'https://busyclothing.com.ar/blacktop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Busy Blacktop | Torneos 3v3 de básquet',
    description:
      'Nuestro circuito de torneos 3v3 con cultura, comunidad y competencia. Sumate con tu equipo.',
  },
};

async function TournamentsList() {
  const tournaments = await getPublicTournaments();
  const tournamentsWithStats = await Promise.all(
    tournaments.map(async (t) => ({
      ...t,
      ...(await getTournamentWithStats(t.id)),
    }))
  );

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
      {tournamentsWithStats.map((tournament) => {
        const teamsCount = tournament.teams_count ?? 0;
        const isFull = teamsCount >= tournament.max_teams;
        const canRegister = tournament.registration_open && !isFull;
        return (
        <div
          key={tournament.id}
          className="group relative rounded-2xl p-[2px] bg-gradient-to-br from-white/45 via-white/20 to-white/30 shadow-[0_0_50px_rgba(35,35,35,0.3)] ring-2 ring-white/30 transition-all duration-300 hover:from-[#ef4444]/60 hover:via-[#ef4444]/40 hover:to-[#ef4444]/50 hover:ring-[#ef4444]/50 hover:shadow-[0_0_40px_rgba(239,68,68,0.25)]"
        >
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-transparent group-hover:bg-[#ef4444]/5 transition-colors duration-300" />
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15 group-hover:ring-[#ef4444]/30 transition-colors duration-300" />

          {/* Content card */}
          <div className="relative overflow-hidden rounded-[16px] bg-background ring-1 ring-white/10 group-hover:ring-[#ef4444]/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)] group-hover:shadow-[0_8px_40px_rgba(239,68,68,0.2)] transition-all duration-300">
            {/* Gentle sheen on hover - Rojo */}
            <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-[#ef4444]/15 via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

            {/* Cover area with banner or pattern and big title overlay */}
            <Link href={`/blacktop/${tournament.slug}`} className="block">
              <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer">
                {tournament.banner_url ? (
                  <Image
                    src={tournament.banner_url}
                    alt={tournament.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[url('/pattern-black.jpg')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-0 flex items-end p-6">
                  <h3 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    {tournament.name}
                  </h3>
                </div>
              </div>
            </Link>

            {/* Content */}
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {canRegister ? (
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-[#ef4444]/15 text-[#ef4444] ring-1 ring-[#ef4444]/30">
                    Inscripciones abiertas
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-white/10 text-white/70 ring-1 ring-white/20">
                    Inscripciones cerradas
                  </span>
                )}
                <span className="text-xs text-white/50">{teamsCount}/{tournament.max_teams} equipos</span>
              </div>

              <div className="space-y-2 text-sm text-white/70 mb-4">
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
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#ef4444]/30 hover:bg-[#ef4444]/10 hover:border-[#ef4444] hover:text-[#ef4444] font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg"
                >
                  <Link href={`/blacktop/${tournament.slug}`} className="flex items-center justify-center gap-2">
                    Explorar Torneo
                  </Link>
                </Button>

                {canRegister && (
                  <Button
                    asChild
                    className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg"
                  >
                    <Link href={`/blacktop/${tournament.slug}/inscripcion`} className="flex items-center justify-center gap-2">
                      Inscribirse
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );})}
    </div>
  );
}

export default async function BlacktopPage() {
  const tournaments = await getPublicTournaments();
  const nextTournamentStats = tournaments[0] ? await getTournamentWithStats(tournaments[0].id) : null;
  const nextTournament = tournaments[0] && nextTournamentStats ? { ...tournaments[0], ...nextTournamentStats } : null;
  const nextIsFull = nextTournament ? ((nextTournament.teams_count ?? 0) >= nextTournament.max_teams) : false;
  const showHeroCta = !!(nextTournament && nextTournament.registration_open && !nextIsFull);
  return (
    <div className="min-h-screen bg-black font-body overflow-x-hidden">
      {/* Hero (same layout as Playlists, but red and without button) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-[#ef4444]/10 to-black py-20 sm:py-20 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('/pattern-black.jpg')] opacity-10" />

        <div className="container relative z-0 px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo Busy Rojo */}
            <div className="mb-1 sm:mb-1 flex justify-center">
              <div className="relative">
                <Image
                  src="/logo-busy-white.png"
                  alt="Busy Blacktop"
                  width={120}
                  height={120}
                  className="object-contain sm:w-[120px] sm:h-[120px]"
                  style={{ filter: 'brightness(0) saturate(100%) invert(17%) sepia(93%) saturate(5606%) hue-rotate(350deg) brightness(92%) contrast(106%)' }}
                />
              </div>
            </div>

            {/* Título + Subtítulo como en Playlists (en rojo) */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-3 bg-gradient-to-r from-white via-[#ef4444] to-white bg-clip-text text-transparent px-4">
              Busy Blacktop
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-6 leading-relaxed px-4">
              Torneos 3v3 de básquet. Cultura, comunidad y competencia.
            </p>

            {showHeroCta && (
              <div className="flex justify-center items-center px-4 mt-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold"
                >
                  <Link href={`/blacktop/${nextTournament.slug}`}>
                    Ver próximo Blacktop
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Torneos - sin título/subtítulo */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <Suspense fallback={<div>Cargando torneos...</div>}>
          <TournamentsList />
        </Suspense>
      </div>
    </div>
  );
}
