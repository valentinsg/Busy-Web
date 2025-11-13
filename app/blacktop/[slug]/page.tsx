import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTournamentBySlug, getTeamsByTournament, getMatchesByTournament, getTournamentMedia, getTournamentLeaderboard } from '@/lib/repo/blacktop';
import { TournamentHeader } from '@/components/blacktop/tournament-header';
import { TournamentTabsNav, TournamentTabPanels } from '@/components/blacktop/tournament-content-tabs';
import { TournamentGalleryPublic } from '@/components/blacktop/tournament-gallery-public';
import { UpcomingMatchesNotification } from '@/components/blacktop/upcoming-matches-notification';
import { Tabs } from '@/components/ui/tabs';

interface TournamentPageProps {
  params: {
    slug: string;
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
