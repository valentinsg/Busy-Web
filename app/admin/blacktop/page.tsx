import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllTournaments } from '@/lib/repo/blacktop';
import { Plus, Calendar, MapPin, Users, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

async function TournamentsList() {
  const tournaments = await getAllTournaments();

  if (tournaments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No hay torneos creados</p>
          <Link href="/admin/blacktop/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear primer torneo
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tournaments.map((tournament) => (
        <Link key={tournament.id} href={`/admin/blacktop/${tournament.id}`}>
          <Card className="hover:border-accent-brand/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{tournament.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {tournament.slug}
                  </CardDescription>
                </div>
                {tournament.is_hidden ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-accent-brand" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tournament.date && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format((() => { const d = String(tournament.date); return /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T12:00:00Z`) : new Date(d) })(), "d 'de' MMMM, yyyy", { locale: es })}
                </div>
              )}
              {tournament.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {tournament.location}
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                Máx. {tournament.max_teams} equipos
              </div>
              <div className="pt-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    tournament.registration_open
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {tournament.registration_open ? 'Inscripciones abiertas' : 'Inscripciones cerradas'}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function BlacktopAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BUSY BLACKTOP</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de torneos 3v3 de básquet
          </p>
        </div>
        <Link href="/admin/blacktop/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo torneo
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Cargando torneos...</div>}>
        <TournamentsList />
      </Suspense>
    </div>
  );
}
