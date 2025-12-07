import { Button } from '@/components/ui/button';
import { getPublicTournaments, getTournamentWithStats } from '@/lib/repo/blacktop';
import { generateSEO } from '@/lib/seo';
import { generateBreadcrumbSchema } from '@/lib/structured-data';
import type { Tournament } from '@/types/blacktop';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { Suspense } from 'react';

export const metadata: Metadata = {
  ...generateSEO({
    title: 'Busy Blacktop | Torneos de Básquet',
    description:
      'Busy Blacktop es el torneo 3x3 de básquet de Busy Streetwear en Mar del Plata. Competencia, premios para jugadores y público, música, contenido y comunidad alrededor de la plaza.',
    image: '/busy-og-image.png',
    url: (process.env.SITE_URL || 'https://busy.com.ar') + '/blacktop',
  }),
  alternates: {
    canonical: '/blacktop',
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
      <BlacktopStructuredData tournaments={tournamentsWithStats} />
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
                  <div className="absolute inset-0 bg-[url('/backgrounds/pattern-black.jpg')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity" />
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
                      {format((() => { const d = String(tournament.date); const day = /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(0,10) : d; return /^\d{4}-\d{2}-\d{2}$/.test(day) ? new Date(`${day}T12:00:00Z`) : new Date(day) })(), "d 'de' MMMM, yyyy", { locale: es })}
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
                    className="relative w-full text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 rounded-xl overflow-hidden border"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.98))',
                      borderColor: '#ef4444',
                      boxShadow: '0 8px 28px rgba(239,68,68,0.2), 0 0 0 1px rgba(239,68,68,0.4) inset'
                    }}
                  >
                    <Link href={`/blacktop/${tournament.slug}/inscripcion`} className="relative flex items-center justify-center gap-2 px-6 py-3">
                      <span className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.08), transparent 40%)' }} />
                      <span className="relative z-10">Inscribirse</span>
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
        <div className="absolute inset-0 bg-[url('/backgrounds/pattern-black.jpg')] opacity-10" />

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
                  unoptimized
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
              Torneo 3x3 de básquet creado por Busy Streetwear en Mar del Plata. Un día de plaza: competencia, música, premios y contenido para jugadores y público.
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

type TournamentWithStats = Tournament & {
  teams_count?: number | null;
  banner_url?: string | null;
  flyer_images?: string[] | null;
};

function BlacktopStructuredData({ tournaments }: { tournaments: TournamentWithStats[] }) {
  const RAW_SITE_URL = process.env.SITE_URL || '';
  const SITE_URL = /^https?:\/\//.test(RAW_SITE_URL) && RAW_SITE_URL ? RAW_SITE_URL : 'https://busy.com.ar';
  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Blacktop', url: `${SITE_URL}/blacktop` },
  ]);
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Torneos Busy Blacktop',
    itemListElement: tournaments.map((t, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: t.name,
      url: `${SITE_URL}/blacktop/${t.slug}`,
      image: t.banner_url || t.flyer_images?.[0] || `${SITE_URL}/busy-og-image.png`,
    })),
  };
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Busy Blacktop',
    url: `${SITE_URL}/blacktop`,
    description: 'Busy Blacktop es el torneo 3x3 de básquet de Busy Streetwear en Mar del Plata. Competencia, premios para jugadores y público, música, contenido y comunidad alrededor de la plaza.',
  };
  return (
    <>
      <Script id="blacktop-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Script id="blacktop-itemlist" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <Script id="blacktop-webpage" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
    </>
  );
}
