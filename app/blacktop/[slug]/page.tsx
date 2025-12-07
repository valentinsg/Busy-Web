import { TournamentTabPanels, TournamentTabsNav } from '@/components/blacktop/tournament-content-tabs';
import { TournamentGalleryPublic } from '@/components/blacktop/tournament-gallery-public';
import { TournamentHeader } from '@/components/blacktop/tournament-header';
import { UpcomingMatchesNotification } from '@/components/blacktop/upcoming-matches-notification';
import { Tabs } from '@/components/ui/tabs';
import { getMatchesByTournament, getTeamsByTournament, getTournamentBySlug, getTournamentLeaderboard, getTournamentMedia } from '@/lib/repo/blacktop';
import { generateSEO } from '@/lib/seo';
import { generateBreadcrumbSchema } from '@/lib/structured-data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';

interface TournamentPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: TournamentPageProps
): Promise<Metadata> {
  const tournament = await getTournamentBySlug(params.slug);
  if (!tournament) {
    return {
      title: 'Torneo no encontrado',
      robots: { index: false, follow: false },
      alternates: { canonical: '/blacktop' },
    };
  }

  const RAW_SITE_URL = process.env.SITE_URL || '';
  const SITE_URL = /^https?:\/\//.test(RAW_SITE_URL) && RAW_SITE_URL ? RAW_SITE_URL : 'https://busy.com.ar';

  const image = tournament.banner_url || tournament.flyer_images?.[0] || '/busy-og-image.png';
  const url = `${SITE_URL}/blacktop/${tournament.slug}`;

  // Build a concise description
  const dateText = tournament.date ? (() => { const d = String(tournament.date); const dt = /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T12:00:00Z`) : new Date(d); return dt.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }); })() : undefined;
  const baseDescription = tournament.description ||
    [
      'Torneo 3v3 de básquet de Busy Blacktop',
      tournament.location ? `en ${tournament.location}` : undefined,
      dateText ? `- ${dateText}` : undefined,
    ].filter(Boolean).join(' ');

  return {
    ...generateSEO({
      title: `${tournament.name} | Busy Blacktop`,
      description: baseDescription,
      image,
      url,
      type: 'website',
    }),
    alternates: {
      canonical: `/blacktop/${tournament.slug}`,
    },
    openGraph: {
      ...generateSEO({ title: `${tournament.name} | Busy Blacktop`, description: baseDescription, image, url }).openGraph,
    },
    twitter: {
      ...generateSEO({ title: `${tournament.name} | Busy Blacktop`, description: baseDescription, image, url }).twitter,
    },
  };
}

async function TournamentContent({ slug }: { slug: string }) {
  const tournament = await getTournamentBySlug(slug);

  if (!tournament) {
    notFound();
  }

  const [teams, matches, media, leaderboard] = await Promise.all([
    getTeamsByTournament(tournament.id, 'approved'),
    getMatchesByTournament(tournament.id),
    getTournamentMedia(tournament.id),
    getTournamentLeaderboard(tournament.id),
  ]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: tournament.primary_color,
        color: '#ffffff',
      }}
    >
      <StructuredData slug={slug} tournamentName={tournament.name} tournamentImage={tournament.banner_url || tournament.flyer_images?.[0]} tournamentDate={tournament.date} location={tournament.location} />
      {/* Header + Tabs root */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TournamentHeader tournament={tournament} teamsCount={teams.length}>
          <TournamentTabsNav />
        </TournamentHeader>

        {/* Panels below */}
        <TournamentTabPanels
          tournament={tournament}
          teams={teams}
          matches={matches}
          leaderboard={leaderboard}
        />
      </Tabs>

      {/* Galería */}
      {media.length > 0 && (
        <div className="py-12 px-4">
          <TournamentGalleryPublic media={media} />
        </div>
      )}

      {/* Notificaciones de próximos partidos */}
      <UpcomingMatchesNotification
        matches={matches}
        accentColor={tournament.accent_color}
      />
    </div>
  );
}

export const revalidate = 0; // Disable caching for real-time updates

export default function TournamentPage({ params }: TournamentPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <TournamentContent slug={params.slug} />
    </Suspense>
  );
}

function StructuredData({
  slug,
  tournamentName,
  tournamentImage,
  tournamentDate,
  location,
}: {
  slug: string;
  tournamentName: string;
  tournamentImage?: string;
  tournamentDate?: string;
  location?: string;
}) {
  const RAW_SITE_URL = process.env.SITE_URL || '';
  const SITE_URL = /^https?:\/\//.test(RAW_SITE_URL) && RAW_SITE_URL ? RAW_SITE_URL : 'https://busy.com.ar';

  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Blacktop', url: `${SITE_URL}/blacktop` },
    { name: tournamentName, url: `${SITE_URL}/blacktop/${slug}` },
  ]);

  const event: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: tournamentName,
    sport: 'Basketball',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    organizer: {
      '@type': 'Organization',
      name: 'Busy Streetwear',
      url: SITE_URL,
    },
    url: `${SITE_URL}/blacktop/${slug}`,
    image: tournamentImage ? [tournamentImage] : [`${SITE_URL}/busy-og-image.png`],
  };

  if (location) {
    event.location = {
      '@type': 'Place',
      name: location,
    };
  }
  if (tournamentDate) {
    const d = String(tournamentDate);
    const dt = /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T12:00:00Z`) : new Date(d);
    event.startDate = dt.toISOString();
  }

  return (
    <>
      <Script id="tournament-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Script id="tournament-event" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }} />
    </>
  );
}
