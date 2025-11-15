'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, X, Trash2, Instagram, Phone, Mail, Loader2, Edit } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TeamEditModal } from './team-edit-modal';
import type { TeamWithPlayers } from '@/types/blacktop';
import { useRouter } from 'next/navigation';

interface TournamentTeamsProps {
  tournamentId: number;
}

export function TournamentTeams({ tournamentId }: TournamentTeamsProps) {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [editingTeam, setEditingTeam] = useState<TeamWithPlayers | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, [tournamentId]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`/api/blacktop/tournaments/${tournamentId}/teams`);
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (teamId: number, status: 'approved' | 'rejected') => {
    setActionLoading(teamId);
    try {
      const response = await fetch(`/api/blacktop/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchTeams();
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating team status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (teamId: number) => {
    if (!confirm('¿Eliminar este equipo y todos sus jugadores?')) return;

    setActionLoading(teamId);
    try {
      const response = await fetch(`/api/blacktop/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTeams();
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTeams = filter === 'all' 
    ? teams 
    : teams.filter(t => t.status === filter);

  const pendingCount = teams.filter(t => t.status === 'pending').length;
  const approvedCount = teams.filter(t => t.status === 'approved').length;
  const rejectedCount = teams.filter(t => t.status === 'rejected').length;

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Inscripciones</CardTitle>
          <CardDescription>
            Gestiona las inscripciones de equipos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todos ({teams.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pendientes ({pendingCount})
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('approved')}
            >
              Aprobados ({approvedCount})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('rejected')}
            >
              Rechazados ({rejectedCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de equipos */}
      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay equipos {filter !== 'all' && filter}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      {team.logo_url ? (
                        <button
                          type="button"
                          onClick={() => setPreviewUrl(team.logo_url!)}
                          className="relative w-14 h-14 rounded-md overflow-hidden ring-1 ring-white/15 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/40"
                          aria-label="Ver logo del equipo"
                        >
                          <Image
                            src={team.logo_url}
                            alt={`${team.name} logo`}
                            width={56}
                            height={56}
                            sizes="56px"
                            quality={45}
                            loading="lazy"
                            className="object-cover"
                          />
                        </button>
                      ) : (
                        <div className="w-14 h-14 rounded-md bg-white/10 ring-1 ring-white/15 flex items-center justify-center text-sm text-white/70 flex-shrink-0">
                          {team.name?.slice(0,2).toUpperCase()}
                        </div>
                      )}
                      <CardTitle className="text-lg truncate">{team.name}</CardTitle>
                    </div>
                    <CardDescription className="mt-2 space-y-1">
                      <a
                        className="flex items-center gap-2 hover:text-white/90 transition-colors"
                        href={`https://instagram.com/${team.captain_instagram?.replace(/^@/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="h-3 w-3" />
                        @{team.captain_instagram}
                      </a>
                      {team.captain_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{team.captain_email}</span>
                        </div>
                      )}
                      {team.captain_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {team.captain_phone}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      team.status === 'approved'
                        ? 'default'
                        : team.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {team.status === 'approved' && 'Aprobado'}
                    {team.status === 'rejected' && 'Rechazado'}
                    {team.status === 'pending' && 'Pendiente'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Jugadores */}
                <div>
                  <p className="text-sm font-medium mb-2">
                    Jugadores ({team.players?.length || 0})
                  </p>
                  <div className="space-y-2">
                    {team.players?.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                      >
                        {/* Avatar jugador */}
                        {player.photo_url ? (
                          <button
                            type="button"
                            onClick={() => setPreviewUrl(player.photo_url!)}
                            className="relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/40"
                            aria-label={`Ver foto de ${player.full_name}`}
                          >
                            <Image
                              src={player.photo_url}
                              alt={player.full_name}
                              width={36}
                              height={36}
                              sizes="36px"
                              quality={35}
                              loading="lazy"
                              className="object-cover"
                            />
                          </button>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-white/10 ring-1 ring-white/10 flex items-center justify-center text-[11px] text-white/70 flex-shrink-0">
                            {player.full_name?.slice(0,2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="font-medium text-white/90 truncate max-w-[140px]">{player.full_name}</span>
                          <span className="text-white/30">•</span>
                          <a
                            className="truncate max-w-[140px] hover:text-white/90 transition-colors"
                            href={`https://instagram.com/${player.instagram_handle?.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            @{player.instagram_handle}
                          </a>
                          {player.email && (
                            <>
                              <span className="text-white/30">•</span>
                              <span className="inline-flex items-center gap-1 truncate max-w-[160px]">
                                <Mail className="h-3 w-3" />
                                {player.email}
                              </span>
                            </>
                          )}
                        </div>
                        {player.is_captain && (
                          <Badge variant="outline" className="text-xs">
                            Capitán
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {team.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notas</p>
                    <p className="text-sm text-muted-foreground">{team.notes}</p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTeam(team)}
                    disabled={actionLoading === team.id}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  {team.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(team.id, 'approved')}
                        disabled={actionLoading === team.id}
                      >
                        {actionLoading === team.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(team.id, 'rejected')}
                        disabled={actionLoading === team.id}
                      >
                        {actionLoading === team.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <X className="mr-2 h-4 w-4" />
                        )}
                        Rechazar
                      </Button>
                    </>
                  )}
                  {team.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(team.id, 'pending' as any)}
                      disabled={actionLoading === team.id}
                    >
                      Volver a pendiente
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(team.id)}
                    disabled={actionLoading === team.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {editingTeam && (
        <TeamEditModal
          team={editingTeam}
          open={!!editingTeam}
          onClose={() => setEditingTeam(null)}
          onSuccess={() => {
            fetchTeams();
            router.refresh();
          }}
        />
      )}

      {/* Lightbox imagen */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-[700px] bg-black/95 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white/90">Vista previa</DialogTitle>
          </DialogHeader>
          <div className="relative w-full" style={{ aspectRatio: '4 / 4' }}>
            {previewUrl && (
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                sizes="(max-width: 768px) 90vw, 700px"
                quality={70}
                className="object-contain"
                priority
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
