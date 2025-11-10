import { TournamentForm } from '@/components/admin/blacktop/tournament-form';

export default function NewTournamentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo torneo</h1>
        <p className="text-muted-foreground mt-1">
          Crea un nuevo torneo 3v3 de BUSY BLACKTOP
        </p>
      </div>

      <TournamentForm mode="create" />
    </div>
  );
}
