'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2 } from 'lucide-react';
import type { TeamWithPlayers, Tournament } from '@/types/blacktop';
import { useToast } from '@/hooks/use-toast';

interface TeamEditModalProps {
  team: TeamWithPlayers;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TeamEditModal({ team, open, onClose, onSuccess }: TeamEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState(team.name);
  const [captainName, setCaptainName] = useState(team.captain_name);
  const [captainEmail, setCaptainEmail] = useState(team.captain_email);
  const [captainPhone, setCaptainPhone] = useState(team.captain_phone || '');
  const [captainInstagram, setCaptainInstagram] = useState(team.captain_instagram);
  const [players, setPlayers] = useState(team.players || []);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadTournament = async () => {
      try {
        const res = await fetch(`/api/blacktop/tournaments/${team.tournament_id}`);
        if (res.ok) {
          const data = await res.json();
          setTournament(data);
        }
      } catch {}
    };
    loadTournament();
  }, [team.tournament_id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Actualizar equipo
      const teamResponse = await fetch(`/api/blacktop/teams/${team.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          captain_name: captainName,
          captain_email: captainEmail,
          captain_phone: captainPhone,
          captain_instagram: captainInstagram,
        }),
      });

      if (!teamResponse.ok) throw new Error('Error al actualizar equipo');

      // Actualizar/crear jugadores
      for (const player of players) {
        if (player.id) {
          await fetch(`/api/blacktop/players/${player.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: player.full_name,
              instagram_handle: player.instagram_handle,
              email: player.email,
            }),
          });
        } else {
          await fetch(`/api/blacktop/players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tournament_id: team.tournament_id,
              team_id: team.id,
              full_name: player.full_name,
              instagram_handle: player.instagram_handle,
              email: player.email,
              is_captain: false,
            }),
          });
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating team:', error);
      toast({ title: 'Error al actualizar equipo', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updatePlayer = (index: number, field: string, value: string) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };
    setPlayers(updated);
  };

  const canAddMorePlayers = tournament
    ? players.length < (tournament.players_per_team_max ?? players.length)
    : true;

  const handleAddPlayer = () => {
    if (!canAddMorePlayers) {
      toast({
        title: 'Límite de jugadores alcanzado',
        description: 'No se pueden agregar más jugadores para este torneo.',
      });
      return;
    }
    setPlayers((prev) => [
      ...prev,
      {
        id: undefined as any,
        tournament_id: team.tournament_id,
        team_id: team.id,
        full_name: '',
        instagram_handle: '',
        email: '',
        is_captain: false,
        consent_media: team.accept_image_rights,
        created_at: '' as any,
        updated_at: '' as any,
      },
    ]);
  };

  const handleDeletePlayer = async (playerId: number | undefined, isCaptain: boolean) => {
    if (!playerId) {
      // Si es un jugador nuevo sin ID, solo quitarlo del estado
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      return;
    }

    if (isCaptain) {
      toast({
        title: 'No se puede eliminar',
        description: 'No puedes eliminar al capitán del equipo.',
        variant: 'destructive',
      });
      return;
    }

    if (players.length <= 3) {
      toast({
        title: 'Mínimo de jugadores',
        description: 'El equipo debe tener al menos 3 jugadores.',
        variant: 'destructive',
      });
      return;
    }

    // Usar modal de confirmación en vez de alert
    const confirmed = window.confirm('¿Eliminar este jugador del equipo?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/blacktop/players/${playerId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error al eliminar jugador');

      setPlayers(prev => prev.filter(p => p.id !== playerId));
      toast({
        title: 'Jugador eliminado',
        description: 'El jugador se eliminó correctamente del equipo.',
      });
    } catch (error) {
      console.error('Error deleting player:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el jugador',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Equipo</DialogTitle>
          <DialogDescription>
            Modifica los datos del equipo y sus jugadores
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Datos del equipo */}
          <div className="space-y-4">
            <h3 className="font-semibold">Datos del Equipo</h3>
            
            <div>
              <Label htmlFor="team_name">Nombre del equipo</Label>
              <Input
                id="team_name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="captain_name">Capitán</Label>
              <Input
                id="captain_name"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="captain_email">Email</Label>
                <Input
                  id="captain_email"
                  type="email"
                  value={captainEmail}
                  onChange={(e) => setCaptainEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="captain_phone">Teléfono</Label>
                <Input
                  id="captain_phone"
                  value={captainPhone}
                  onChange={(e) => setCaptainPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="captain_instagram">Instagram</Label>
              <Input
                id="captain_instagram"
                value={captainInstagram}
                onChange={(e) => setCaptainInstagram(e.target.value)}
              />
            </div>
          </div>

          {/* Jugadores */}
          <div className="space-y-4">
            <h3 className="font-semibold">Jugadores</h3>
            <div className="flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={handleAddPlayer} disabled={!canAddMorePlayers}>
                Agregar jugador
              </Button>
            </div>
            {players.map((player, index) => (
              <div key={player.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Jugador {index + 1} {player.is_captain && '(Capitán)'}
                  </span>
                  {!player.is_captain && players.length > 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlayer(player.id, player.is_captain)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div>
                  <Label>Nombre completo</Label>
                  <Input
                    value={player.full_name}
                    onChange={(e) => updatePlayer(index, 'full_name', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Instagram</Label>
                    <Input
                      value={player.instagram_handle}
                      onChange={(e) => updatePlayer(index, 'instagram_handle', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={player.email || ''}
                      onChange={(e) => updatePlayer(index, 'email', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
