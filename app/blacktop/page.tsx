import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPublicTournaments } from '@/lib/repo/blacktop';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

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

            {tournament.registration_open ? (
              <div
                className="inline-flex items-center gap-2 text-sm font-bold"
                style={{ color: tournament.accent_color }}
              >
                Inscripciones abiertas
                <ArrowRight className="h-4 w-4" />
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/60">
                Inscripciones cerradas
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function BlacktopPage() {
  const tournaments = await getPublicTournaments();
  const nextTournament = tournaments[0];
  return (
    <div className="min-h-screen bg-black font-body overflow-x-hidden">
      {/* Hero (same layout as Playlists, but red and without button) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-[#ef4444]/10 to-black py-20 sm:py-20 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('/pattern-black.jpg')] opacity-10" />

        <div className="container relative z-0 px-4 sm:px-6">
          {nextTournament && (
            <div className="max-w-3xl mx-auto">
              {/* Card clonada del estilo de PlaylistCard pero en rojo */}
              <div className="group relative rounded-2xl p-[2px] bg-gradient-to-br from-white/45 via-white/20 to-white/30 shadow-[0_0_50px_rgba(35,35,35,0.3)] ring-2 ring-white/30 transition-all duration-300 hover:from-[#ef4444]/60 hover:via-[#ef4444]/40 hover:to-[#ef4444]/50 hover:ring-[#ef4444]/50 hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]">
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-transparent group-hover:bg-[#ef4444]/5 transition-colors duration-300" />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15 group-hover:ring-[#ef4444]/30 transition-colors duration-300" />

                {/* Corners */}
                <span className="pointer-events-none absolute top-3 left-3 h-px w-8 bg-white/40" />
                <span className="pointer-events-none absolute top-3 left-3 h-8 w-px bg-white/40" />
                <span className="pointer-events-none absolute top-3 right-3 h-px w-8 bg-white/40" />
                <span className="pointer-events-none absolute top-3 right-3 h-8 w-px bg-white/40" />
                <span className="pointer-events-none absolute bottom-3 left-3 h-px w-8 bg-white/30" />
                <span className="pointer-events-none absolute bottom-3 left-3 h-8 w-px bg-white/30" />
                <span className="pointer-events-none absolute bottom-3 right-3 h-px w-8 bg-white/30" />
                <span className="pointer-events-none absolute bottom-3 right-3 h-8 w-px bg-white/30" />

                <div className="relative overflow-hidden rounded-[16px] bg-background ring-1 ring-white/10 group-hover:ring-[#ef4444]/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)] group-hover:shadow-[0_8px_40px_rgba(239,68,68,0.2)] transition-all duration-300">
                  <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-[#ef4444]/15 via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

                  <Link href={`/blacktop/${nextTournament.slug}`} className="block">
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      {((nextTournament as any)?.format_config?.cover_image) ? (
                        <Image
                          src={(nextTournament as any).format_config.cover_image as string}
                          alt={nextTournament.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-[url('/pattern-black.jpg')] opacity-20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Image src="/logo-busy-white.png" alt="Busy" width={260} height={260} className="opacity-20" />
                          </div>
                        </>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white/90 drop-shadow-xl">
                          {nextTournament.name}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-6">
                    <div className="space-y-2 text-sm text-white/70 mb-4">
                      {nextTournament.date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(nextTournament.date), "d 'de' MMMM, yyyy", { locale: es })}
                          </span>
                        </div>
                      )}
                      {nextTournament.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{nextTournament.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Máx. {nextTournament.max_teams} equipos</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-[#ef4444]/30 hover:bg-[#ef4444]/10 hover:border-[#ef4444] hover:text-[#ef4444] font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg"
                      >
                        <Link href={`/blacktop/${nextTournament.slug}`}>Explorar Torneo</Link>
                      </Button>

                      <Button
                        asChild
                        className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg"
                      >
                        <Link href={nextTournament.registration_open ? `/blacktop/${nextTournament.slug}/inscripcion` : `/blacktop/${nextTournament.slug}`}>
                          {nextTournament.registration_open ? 'Inscribirse' : 'Ver detalles'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

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
