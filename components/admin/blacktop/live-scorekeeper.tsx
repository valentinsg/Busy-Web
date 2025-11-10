'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Minus, Trophy, Save, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Match, Player, TeamWithPlayers } from '@/types/blacktop';

interface LiveScorekeeperProps {
  match: Match;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PlayerLiveStats {
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

type NumericStatKey = Exclude<keyof PlayerLiveStats, 'player_id' | 'player_name'>;

export function LiveScorekeeper({ match, open, onClose, onSuccess }: LiveScorekeeperProps) {
  const [teamA, setTeamA] = useState<TeamWithPlayers | null>(null);
  const [teamB, setTeamB] = useState<TeamWithPlayers | null>(null);
  const [scoreA, setScoreA] = useState(match.team_a_score || 0);
  const [scoreB, setScoreB] = useState(match.team_b_score || 0);
  const [statsA, setStatsA] = useState<PlayerLiveStats[]>([]);
  const [statsB, setStatsB] = useState<PlayerLiveStats[]>([]);
  const [selectedPlayerA, setSelectedPlayerA] = useState<number | null>(null);
  const [selectedPlayerB, setSelectedPlayerB] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(match.status === 'in_progress');
  const { toast } = useToast();

  useEffect(() => {
    if (open && match.team_a_id && match.team_b_id) {
      loadTeams();
    }
  }, [open, match]);

  const loadTeams = async () => {
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

        setStatsA(teamAData.players.map((p: Player) => ({
          player_id: p.id,
          player_name: p.full_name,
          points: 0,
          assists: 0,
          rebounds: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          is_mvp: false,
        })));

        setStatsB(teamBData.players.map((p: Player) => ({
          player_id: p.id,
          player_name: p.full_name,
          points: 0,
          assists: 0,
          rebounds: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          is_mvp: false,
        })));

        if (teamAData.players.length > 0) setSelectedPlayerA(teamAData.players[0].id);
        if (teamBData.players.length > 0) setSelectedPlayerB(teamBData.players[0].id);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const updateStat = (team: 'A' | 'B', playerId: number, stat: NumericStatKey, delta: number) => {
    if (team === 'A') {
      setStatsA(prev => prev.map(s =>
        s.player_id === playerId
          ? { ...s, [stat]: Math.max(0, (Number(s[stat]) || 0) + delta) }
          : s 
      ));
    } else {
      setStatsB(prev => prev.map(s =>
        s.player_id === playerId
          ? { ...s, [stat]: Math.max(0, (Number(s[stat]) || 0) + delta) }
          : s
      ));
    }
  };

  const addPoints = (team: 'A' | 'B', playerId: number, points: number) => {
    if (team === 'A') {
      setScoreA(prev => Number(prev) + points);
    } else {
      setScoreB(prev => Number(prev) + points);
    }
    updateStat(team, playerId, 'points', points);
  };

  const toggleMVP = (team: 'A' | 'B', playerId: number) => {
    // Quitar MVP de todos los jugadores
    const clearedA = statsA.map(s => ({ ...s, is_mvp: false }));
    const clearedB = statsB.map(s => ({ ...s, is_mvp: false }));
    
    // Asignar MVP al jugador seleccionado
    if (team === 'A') {
      const updated = clearedA.map(s => 
        s.player_id === playerId ? { ...s, is_mvp: true } : s
      );
      setStatsA(updated);
      setStatsB(clearedB);
    } else {
      const updated = clearedB.map(s => 
        s.player_id === playerId ? { ...s, is_mvp: true } : s
      );
      setStatsA(clearedA);
      setStatsB(updated);
    }
  };

  const handleStartStop = async () => {
    const newStatus = isLive ? 'scheduled' : 'in_progress';
    try {
      await fetch(`/api/blacktop/matches/${match.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setIsLive(!isLive);
      toast({
        title: isLive ? 'Partido pausado' : 'Partido iniciado',
      });
    } catch (error) {
      console.error('Error updating match status:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Actualizar resultado
      await fetch(`/api/blacktop/matches/${match.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_a_score: scoreA,
          team_b_score: scoreB,
          status: 'completed',
          winner_id: scoreA > scoreB ? match.team_a_id : match.team_b_id,
        }),
      });

      // Guardar stats
      const allStats = [...statsA, ...statsB];
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
        title: 'Partido guardado',
        description: 'El resultado y las estadísticas se guardaron correctamente.',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving match:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el partido',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Live Scorekeeper
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Marcador principal */}
          <Card className="p-6 bg-gradient-to-r from-red-500/10 to-blue-500/10">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">{teamA?.name}</div>
                <div className="text-6xl font-bold">{scoreA}</div>
              </div>
              <div className="text-center">
                <Badge variant={isLive ? 'destructive' : 'outline'} className="text-lg px-4 py-2">
                  {isLive ? '🔴 EN VIVO' : 'PAUSADO'}
                </Badge>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleStartStop}
                  className="mt-4 w-full"
                >
                  {isLive ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                  {isLive ? 'Pausar' : 'Iniciar'}
                </Button>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">{teamB?.name}</div>
                <div className="text-6xl font-bold">{scoreB}</div>
              </div>
            </div>
          </Card>

          {/* Controles por equipo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipo A */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 text-center">{teamA?.name}</h3>

              {/* Selector de jugador */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {statsA.map(stat => (
                  <Button
                    key={stat.player_id}
                    variant={selectedPlayerA === stat.player_id ? 'default' : 'outline'}
                    onClick={() => setSelectedPlayerA(stat.player_id)}
                    className="h-auto py-3"
                  >
                    <div className="text-left w-full">
                      <div className="font-semibold text-sm">{stat.player_name}</div>
                      <div className="text-xs opacity-70">{stat.points} pts</div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Botones de puntos */}
              {selectedPlayerA && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="lg" className="h-20 text-2xl" onClick={() => addPoints('A', selectedPlayerA, 1)}>
                      +1
                    </Button>
                    <Button size="lg" className="h-20 text-2xl" onClick={() => addPoints('A', selectedPlayerA, 2)}>
                      +2
                    </Button>
                    <Button size="lg" className="h-20 text-2xl" onClick={() => addPoints('A', selectedPlayerA, 3)}>
                      +3
                    </Button>
                  </div>

                  {/* Stats rápidas */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => updateStat('A', selectedPlayerA, 'assists', 1)}>
                      <Plus className="h-4 w-4 mr-1" /> AST
                    </Button>
                    <Button variant="outline" onClick={() => updateStat('A', selectedPlayerA, 'rebounds', 1)}>
                      <Plus className="h-4 w-4 mr-1" /> REB
                    </Button>
                    <Button variant="outline" onClick={() => updateStat('A', selectedPlayerA, 'steals', 1)}>
                      <Plus className="h-4 w-4 mr-1" /> STL
                    </Button>
                  </div>

                  {/* MVP Button */}
                  <Button
                    variant={statsA.find(s => s.player_id === selectedPlayerA)?.is_mvp ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => toggleMVP('A', selectedPlayerA)}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    {statsA.find(s => s.player_id === selectedPlayerA)?.is_mvp ? 'MVP del partido' : 'Marcar como MVP'}
                  </Button>
                </div>
              )}
            </Card>

            {/* Equipo B */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 text-center">{teamB?.name}</h3>

              {/* Selector de jugador */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {statsB.map(stat => (
                  <Button
                    key={stat.player_id}
                    variant={selectedPlayerB === stat.player_id ? 'default' : 'outline'}
                    onClick={() => setSelectedPlayerB(stat.player_id)}
                    className="h-auto py-3"
                  >
                    <div className="text-left w-full">
                      <div className="font-semibold text-sm">{stat.player_name}</div>
                      <div className="text-xs opacity-70">{stat.points} pts</div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Botones de puntos */}
              {selectedPlayerB && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="lg" className="h-20 text-2xl" onClick={() => addPoints('B', selectedPlayerB, 1)}>
                      +1
                    </Button>
                    <Button size="lg" className="h-20 text-2xl" onClick={() => addPoints('B', selectedPlayerB, 2)}>
                      +2
                    </Button>
                    <Button size="lg" className="h-20 text-2xl" onClick={() => addPoints('B', selectedPlayerB, 3)}>
                      +3
                    </Button>
                  </div>

                  {/* Stats rápidas */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => updateStat('B', selectedPlayerB, 'assists', 1)}>
                      <Plus className="h-4 w-4 mr-1" /> AST
                    </Button>
                    <Button variant="outline" onClick={() => updateStat('B', selectedPlayerB, 'rebounds', 1)}>
                      <Plus className="h-4 w-4 mr-1" /> REB
                    </Button>
                    <Button variant="outline" onClick={() => updateStat('B', selectedPlayerB, 'steals', 1)}>
                      <Plus className="h-4 w-4 mr-1" /> STL
                    </Button>
                  </div>

                  {/* MVP Button */}
                  <Button
                    variant={statsB.find(s => s.player_id === selectedPlayerB)?.is_mvp ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => toggleMVP('B', selectedPlayerB)}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    {statsB.find(s => s.player_id === selectedPlayerB)?.is_mvp ? 'MVP del partido' : 'Marcar como MVP'}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} size="lg">
              <Save className="h-4 w-4 mr-2" />
              Guardar y Finalizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
