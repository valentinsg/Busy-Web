'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TournamentWithStats } from '@/types/blacktop';
import Link from 'next/link';

interface TournamentOverviewProps {
  tournament: TournamentWithStats;
}

export function TournamentOverview({ tournament }: TournamentOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información del torneo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Slug</p>
            <p className="font-medium">{tournament.slug}</p>
          </div>

          {tournament.description && (
            <div>
              <p className="text-sm text-muted-foreground">Descripción</p>
              <p className="font-medium">{tournament.description}</p>
            </div>
          )}

          {tournament.date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="font-medium">
                  {format(new Date(tournament.date), "d 'de' MMMM, yyyy", { locale: es })}
                  {tournament.time && ` a las ${tournament.time}`}
                </p>
              </div>
            </div>
          )}

          {tournament.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p className="font-medium">{tournament.location}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Configuración</p>
              <p className="font-medium">
                Máx. {tournament.max_teams} equipos • {tournament.players_per_team_min}-{tournament.players_per_team_max} jugadores
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant={tournament.registration_open ? 'default' : 'secondary'}>
              {tournament.registration_open ? 'Inscripciones abiertas' : 'Inscripciones cerradas'}
            </Badge>
            <Badge variant={tournament.is_hidden ? 'outline' : 'default'}>
              {tournament.is_hidden ? (
                <>
                  <EyeOff className="mr-1 h-3 w-3" />
                  Oculto
                </>
              ) : (
                <>
                  <Eye className="mr-1 h-3 w-3" />
                  Público
                </>
              )}
            </Badge>
          </div>

          <div className="pt-4">
            <Link href={`/blacktop/${tournament.slug}`} target="_blank">
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver página pública
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Premios */}
      <Card>
        <CardHeader>
          <CardTitle>{tournament.prizes_title}</CardTitle>
        </CardHeader>
        <CardContent>
          {tournament.prizes_description ? (
            <div className="whitespace-pre-wrap text-sm">
              {tournament.prizes_description}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay premios configurados</p>
          )}
        </CardContent>
      </Card>

      {/* Reglamento */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Reglamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tournament.rules_url && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">URL del reglamento</p>
              <a
                href={tournament.rules_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-brand hover:underline flex items-center gap-1"
              >
                {tournament.rules_url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {tournament.rules_content ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Contenido</p>
              <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                {tournament.rules_content}
              </div>
            </div>
          ) : (
            !tournament.rules_url && (
              <p className="text-sm text-muted-foreground">No hay reglamento configurado</p>
            )
          )}
        </CardContent>
      </Card>

      {/* Colores */}
      <Card>
        <CardHeader>
          <CardTitle>Estética</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Color primario</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: tournament.primary_color }}
                />
                <code className="text-sm">{tournament.primary_color}</code>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Color de acento</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: tournament.accent_color }}
                />
                <code className="text-sm">{tournament.accent_color}</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Equipos inscritos</span>
            <span className="font-medium">{tournament.teams_count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Jugadores totales</span>
            <span className="font-medium">{tournament.players_count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Partidos programados</span>
            <span className="font-medium">{tournament.matches_count}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
