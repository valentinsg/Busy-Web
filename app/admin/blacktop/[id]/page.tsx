import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTournamentWithStats } from '@/lib/repo/blacktop';
import { ArrowLeft, Edit } from 'lucide-react';
import { TournamentOverview } from '@/components/admin/blacktop/tournament-overview';
import { TournamentTeams } from '@/components/admin/blacktop/tournament-teams';
import { TournamentFixture } from '@/components/admin/blacktop/tournament-fixture';
import { TournamentGallery } from '@/components/admin/blacktop/tournament-gallery';
import { TournamentFormatTab } from '@/components/admin/blacktop/tournament-format-tab';

interface TournamentDetailPageProps {
  params: {
    id: string;
  };
}

async function TournamentDetail({ id }: { id: string }) {
  const tournament = await getTournamentWithStats(parseInt(id));

  if (!tournament) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blacktop">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tournament.name}</h1>
            <p className="text-muted-foreground mt-1">
              {tournament.teams_count} equipos • {tournament.players_count} jugadores • {tournament.matches_count} partidos
            </p>
          </div>
        </div>
        <Link href={`/admin/blacktop/${id}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="format">Formato y Zonas</TabsTrigger>
          <TabsTrigger value="teams">
            Inscripciones ({tournament.teams_count})
          </TabsTrigger>
          <TabsTrigger value="fixture">
            Fixture ({tournament.matches_count})
          </TabsTrigger>
          <TabsTrigger value="gallery">Galería</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TournamentOverview tournament={tournament} />
        </TabsContent>

        <TabsContent value="format">
          <TournamentFormatTab tournamentId={tournament.id} />
        </TabsContent>

        <TabsContent value="teams">
          <TournamentTeams tournamentId={tournament.id} />
        </TabsContent>

        <TabsContent value="fixture">
          <TournamentFixture tournamentId={tournament.id} />
        </TabsContent>

        <TabsContent value="gallery">
          <TournamentGallery tournamentId={tournament.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function TournamentDetailPage({ params }: TournamentDetailPageProps) {
  return (
    <Suspense fallback={<div>Cargando torneo...</div>}>
      <TournamentDetail id={params.id} />
    </Suspense>
  );
}
