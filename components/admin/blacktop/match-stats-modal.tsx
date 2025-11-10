'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trophy, Target, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Match, Player, TeamWithPlayers } from '@/types/blacktop';

interface MatchStatsModalProps {
  match: Match;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PlayerStats {
  player_id: number;
  player_name: string;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  is_mvp: boolean;
}

export function MatchStatsModal({ match, open, onClose, onSuccess }: MatchStatsModalProps) {
  const [loading, setLoading] = useState(false);
  const [teamA, setTeamA] = useState<TeamWithPlayers | null>(null);
  const [teamB, setTeamB] = useState<TeamWithPlayers | null>(null);
  const [teamAScore, setTeamAScore] = useState(match.team_a_score || 0);
  const [teamBScore, setTeamBScore] = useState(match.team_b_score || 0);
  const [teamAStats, setTeamAStats] = useState<PlayerStats[]>([]);
  const [teamBStats, setTeamBStats] = useState<PlayerStats[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open && match.team_a_id && match.team_b_id) {
      loadTeamsAndStats();
    }
  }, [open, match]);

  const loadTeamsAndStats = async () => {
    try {
      const [teamARes, teamBRes] = await Promise.all([
        fetch(`/api/blacktop/teams/${match.team_a_id}`),
        fetch(`/api/blacktop/teams/${match.team_b_id}`),
      ]);

      if (teamARes.ok && teamBRes.ok) {
        const teamAData = await teamARes.json();
        const teamBData = await teamBRes.json();
        setTeamA(teamAData);
        setTeamB(teamBData);

        // Inicializar stats
        setTeamAStats(
          teamAData.players.map((p: Player) => ({
            player_id: p.id,
            player_name: p.full_name,
            points: 0,
            assists: 0,
            rebounds: 0,
            steals: 0,
            blocks: 0,
            turnovers: 0,
            is_mvp: false,
          }))
        );

        setTeamBStats(
          teamBData.players.map((p: Player) => ({
            player_id: p.id,
            player_name: p.full_name,
            points: 0,
            assists: 0,
            rebounds: 0,
            steals: 0,
            blocks: 0,
            turnovers: 0,
            is_mvp: false,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const updatePlayerStat = (
    team: 'A' | 'B',
    playerIndex: number,
    stat: keyof PlayerStats,
    value: number | boolean
  ) => {
    // Si es MVP, solo permitir 1 MVP por partido
    if (stat === 'is_mvp' && value === true) {
      // Quitar MVP de todos los jugadores
      const clearedA = teamAStats.map(s => ({ ...s, is_mvp: false }));
      const clearedB = teamBStats.map(s => ({ ...s, is_mvp: false }));
      setTeamAStats(clearedA);
      setTeamBStats(clearedB);
      
      // Asignar MVP al jugador seleccionado
      if (team === 'A') {
        const updated = [...clearedA];
        updated[playerIndex] = { ...updated[playerIndex], is_mvp: true };
        setTeamAStats(updated);
      } else {
        const updated = [...clearedB];
        updated[playerIndex] = { ...updated[playerIndex], is_mvp: true };
        setTeamBStats(updated);
      }
      return;
    }

    if (team === 'A') {
      const updated = [...teamAStats];
      updated[playerIndex] = { ...updated[playerIndex], [stat]: value };
      setTeamAStats(updated);
    } else {
      const updated = [...teamBStats];
      updated[playerIndex] = { ...updated[playerIndex], [stat]: value };
      setTeamBStats(updated);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Actualizar resultado del partido
      await fetch(`/api/blacktop/matches/${match.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_a_score: teamAScore,
          team_b_score: teamBScore,
          status: 'completed',
          winner_id: teamAScore > teamBScore ? match.team_a_id : match.team_b_id,
        }),
      });

      // Guardar stats de jugadores
      const allStats = [...teamAStats, ...teamBStats];
      for (const stat of allStats) {
        await fetch(`/api/blacktop/matches/${match.id}/player-stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            match_id: match.id,
            player_id: stat.player_id,
            points: stat.points,
            assists: stat.assists,
            rebounds: stat.rebounds,
            steals: stat.steals,
            blocks: stat.blocks,
            turnovers: stat.turnovers,
            is_mvp: stat.is_mvp,
          }),
        });
      }

      toast({
        title: 'Estadísticas guardadas',
        description: 'El partido y las estadísticas se guardaron correctamente.',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving stats:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las estadísticas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Planilla del Partido
          </DialogTitle>
          <DialogDescription>
            {teamA?.name} vs {teamB?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resultado */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <div>
              <Label>{teamA?.name}</Label>
              <Input
                type="number"
                min={0}
                value={teamAScore}
                onChange={(e) => setTeamAScore(parseInt(e.target.value) || 0)}
                className="text-2xl font-bold text-center"
              />
            </div>
            <div className="text-center text-2xl font-bold text-muted-foreground">VS</div>
            <div>
              <Label>{teamB?.name}</Label>
              <Input
                type="number"
                min={0}
                value={teamBScore}
                onChange={(e) => setTeamBScore(parseInt(e.target.value) || 0)}
                className="text-2xl font-bold text-center"
              />
            </div>
          </div>

          {/* Tabs por equipo */}
          <Tabs defaultValue="teamA">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teamA">
                <Users className="h-4 w-4 mr-2" />
                {teamA?.name}
              </TabsTrigger>
              <TabsTrigger value="teamB">
                <Users className="h-4 w-4 mr-2" />
                {teamB?.name}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teamA" className="space-y-4">
              {teamAStats.map((stat, index) => (
                <div key={stat.player_id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">{stat.player_name}</span>
                    <Button
                      variant={stat.is_mvp ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePlayerStat('A', index, 'is_mvp', !stat.is_mvp)}
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      MVP
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {(['points', 'assists', 'rebounds', 'steals', 'blocks', 'turnovers'] as const).map((statKey) => (
                      <div key={statKey}>
                        <Label className="text-xs capitalize">{statKey}</Label>
                        <Input
                          type="number"
                          min={0}
                          value={stat[statKey]}
                          onChange={(e) =>
                            updatePlayerStat('A', index, statKey, parseInt(e.target.value) || 0)
                          }
                          className="text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="teamB" className="space-y-4">
              {teamBStats.map((stat, index) => (
                <div key={stat.player_id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">{stat.player_name}</span>
                    <Button
                      variant={stat.is_mvp ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePlayerStat('B', index, 'is_mvp', !stat.is_mvp)}
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      MVP
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {(['points', 'assists', 'rebounds', 'steals', 'blocks', 'turnovers'] as const).map((statKey) => (
                      <div key={statKey}>
                        <Label className="text-xs capitalize">{statKey}</Label>
                        <Input
                          type="number"
                          min={0}
                          value={stat[statKey]}
                          onChange={(e) =>
                            updatePlayerStat('B', index, statKey, parseInt(e.target.value) || 0)
                          }
                          className="text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Guardar estadísticas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
