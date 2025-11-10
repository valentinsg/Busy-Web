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
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription className="mt-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Instagram className="h-3 w-3" />
                        @{team.captain_instagram}
                      </div>
                      {team.captain_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {team.captain_email}
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
                  <div className="space-y-1">
                    {team.players?.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Instagram className="h-3 w-3" />
                        <span>@{player.instagram_handle}</span>
                        <span>-</span>
                        <span>{player.full_name}</span>
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
    </div>
  );
}
