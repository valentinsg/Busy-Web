import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTournamentById } from '@/lib/repo/blacktop';
import { TournamentForm } from '@/components/admin/blacktop/tournament-form';

interface EditTournamentPageProps {
  params: {
    id: string;
  };
}

async function EditTournamentContent({ id }: { id: string }) {
  const tournament = await getTournamentById(parseInt(id));

  if (!tournament) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar torneo</h1>
        <p className="text-muted-foreground mt-1">
          {tournament.name}
        </p>
      </div>

      <TournamentForm tournament={tournament} mode="edit" />
    </div>
  );
}

export default function EditTournamentPage({ params }: EditTournamentPageProps) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EditTournamentContent id={params.id} />
    </Suspense>
  );
}
