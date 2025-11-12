'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Trophy, Save, Play, Pause, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Match, Player, TeamWithPlayers, Tournament } from '@/types/blacktop';

interface LiveScorekeeperProps {
  match: Match;
  tournament: Tournament;
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

type NumericStatKey = Exclude<keyof PlayerLiveStats, 'player_id' | 'player_name' | 'is_mvp'>;

export function LiveScorekeeperV2({ match: initialMatch, tournament, open, onClose, onSuccess }: LiveScorekeeperProps) {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [teamA, setTeamA] = useState<TeamWithPlayers | null>(null);
  const [teamB, setTeamB] = useState<TeamWithPlayers | null>(null);
  const [scoreA, setScoreA] = useState(initialMatch.team_a_score || 0);
  const [scoreB, setScoreB] = useState(initialMatch.team_b_score || 0);
  const [foulsA, setFoulsA] = useState(initialMatch.fouls_a || 0);
  const [foulsB, setFoulsB] = useState(initialMatch.fouls_b || 0);
  const [statsA, setStatsA] = useState<PlayerLiveStats[]>([]);
  const [statsB, setStatsB] = useState<PlayerLiveStats[]>([]);
  const [selectedPlayerA, setSelectedPlayerA] = useState<number | null>(null);
  const [selectedPlayerB, setSelectedPlayerB] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { toast } = useToast();

  // Polling del match cada 2s para actualizar timer
  useEffect(() => {
    if (!open || match.status !== 'live') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/blacktop/matches/${match.id}`);
        if (res.ok) {
          const updatedMatch = await res.json();
          setMatch(updatedMatch);
          calculateTimeRemaining(updatedMatch);
        }
      } catch (error) {
        console.error('Error polling match:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [open, match.id, match.status]);

  const calculateTimeRemaining = useCallback((m: Match) => {
    const totalSeconds = tournament.period_duration_minutes * 60;
    let elapsed = m.elapsed_seconds;

    if (m.status === 'live' && m.started_at && !m.paused_at) {
      const now = Date.now();
      const startedMs = new Date(m.started_at).getTime();
      const elapsedMs = now - startedMs;
      elapsed = m.elapsed_seconds + Math.floor(elapsedMs / 1000);
    }

    const remaining = Math.max(0, totalSeconds - elapsed);
    setTimeRemaining(remaining);
  }, [tournament.period_duration_minutes]);

  useEffect(() => {
    calculateTimeRemaining(match);
  }, [match, calculateTimeRemaining]);

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

  const handleStart = async () => {
    try {
      const res = await fetch(`/api/admin/blacktop/matches/${match.id}/start`, { method: 'POST' });
      if (res.ok) {
        const updatedMatch = await res.json();
        setMatch(updatedMatch);
        toast({ title: 'Partido iniciado' });
      }
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const handlePause = async () => {
    try {
      const res = await fetch(`/api/admin/blacktop/matches/${match.id}/pause`, { method: 'POST' });
      if (res.ok) {
        const updatedMatch = await res.json();
        setMatch(updatedMatch);
        toast({ title: 'Partido pausado' });
      }
    } catch (error) {
      console.error('Error pausing match:', error);
    }
  };

  const handleResume = async () => {
    try {
      const res = await fetch(`/api/admin/blacktop/matches/${match.id}/resume`, { method: 'POST' });
      if (res.ok) {
        const updatedMatch = await res.json();
        setMatch(updatedMatch);
        toast({ title: 'Partido reanudado' });
      }
    } catch (error) {
      console.error('Error resuming match:', error);
    }
  };

  const updateScore = async () => {
    try {
      await fetch(`/api/admin/blacktop/matches/${match.id}/score`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_a_score: scoreA,
          team_b_score: scoreB,
          fouls_a: foulsA,
          fouls_b: foulsB,
        }),
      });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const addPoints = (team: 'A' | 'B', playerId: number, points: number) => {
    if (team === 'A') {
      setScoreA(prev => prev + points);
    } else {
      setScoreB(prev => prev + points);
    }
    updateStat(team, playerId, 'points', points);
    updateScore();
  };

  const updateStat = (team: 'A' | 'B', playerId: number, stat: NumericStatKey, delta: number) => {
    if (team === 'A') {
      setStatsA(prev => prev.map(s =>
        s.player_id === playerId ? { ...s, [stat]: Math.max(0, s[stat] + delta) } : s
      ));
    } else {
      setStatsB(prev => prev.map(s =>
        s.player_id === playerId ? { ...s, [stat]: Math.max(0, s[stat] + delta) } : s
      ));
    }
  };

  const toggleMVP = (team: 'A' | 'B', playerId: number) => {
    const clearedA = statsA.map(s => ({ ...s, is_mvp: false }));
    const clearedB = statsB.map(s => ({ ...s, is_mvp: false }));
    
    if (team === 'A') {
      setStatsA(clearedA.map(s => s.player_id === playerId ? { ...s, is_mvp: true } : s));
      setStatsB(clearedB);
    } else {
      setStatsA(clearedA);
      setStatsB(clearedB.map(s => s.player_id === playerId ? { ...s, is_mvp: true } : s));
    }
  };

  const handleFinish = async () => {
    try {
      await updateScore();

      const res = await fetch(`/api/admin/blacktop/matches/${match.id}/finish`, { method: 'POST' });
      if (!res.ok) throw new Error('Error al finalizar partido');

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

      toast({ title: 'Partido finalizado', description: 'Resultado guardado correctamente' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error finishing match:', error);
      toast({ title: 'Error', description: 'No se pudo finalizar el partido', variant: 'destructive' });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          {/* Timer y controles */}
          <Card className="p-4 bg-gradient-to-r from-red-500/10 to-blue-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-2xl font-mono font-bold">{formatTime(timeRemaining)}</span>
                <span className="text-sm text-muted-foreground">
                  Período {match.current_period}/{tournament.periods_count}
                </span>
              </div>
              <Badge variant={match.status === 'live' ? 'destructive' : 'outline'} className="text-lg px-4 py-2">
                {match.status === 'live' ? '🔴 EN VIVO' : match.status === 'halftime' ? 'PAUSADO' : 'PENDIENTE'}
              </Badge>
            </div>

            <div className="flex gap-2">
              {match.status === 'pending' && (
                <Button onClick={handleStart} size="lg" className="flex-1">
                  <Play className="h-5 w-5 mr-2" /> Iniciar
                </Button>
              )}
              {match.status === 'live' && (
                <Button onClick={handlePause} variant="outline" size="lg" className="flex-1">
                  <Pause className="h-5 w-5 mr-2" /> Pausar
                </Button>
              )}
              {match.status === 'halftime' && (
                <Button onClick={handleResume} size="lg" className="flex-1">
                  <Play className="h-5 w-5 mr-2" /> Reanudar
                </Button>
              )}
            </div>
          </Card>

          {/* Marcador */}
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">{teamA?.name}</div>
                <div className="text-6xl font-bold">{scoreA}</div>
                <div className="text-sm text-muted-foreground mt-2">Faltas: {foulsA}</div>
                <Button size="sm" variant="outline" onClick={() => setFoulsA(f => f + 1)} className="mt-2">
                  <Plus className="h-3 w-3 mr-1" /> Falta
                </Button>
              </div>
              <div className="text-center text-4xl font-bold text-muted-foreground">VS</div>
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">{teamB?.name}</div>
                <div className="text-6xl font-bold">{scoreB}</div>
                <div className="text-sm text-muted-foreground mt-2">Faltas: {foulsB}</div>
                <Button size="sm" variant="outline" onClick={() => setFoulsB(f => f + 1)} className="mt-2">
                  <Plus className="h-3 w-3 mr-1" /> Falta
                </Button>
              </div>
            </div>
          </Card>

          {/* Controles por equipo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipo A */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 text-center">{teamA?.name}</h3>
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

              {selectedPlayerA && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="lg" className="h-20 text-2xl" onClick={() => addPoints('A', selectedPlayerA, 1)}>+1</Button>
                    <Button size="lg" className="h-20 text-2xl" onClick={() => addPoints('A', selectedPlayerA, 2)}>+2</Button>
                    <Button size="lg" className="h-20 text-2xl" onClick={() => addPoints('A', selectedPlayerA, 3)}>+3</Button>
                  </div>
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
                  <Button
                    variant={statsA.find(s => s.player_id === selectedPlayerA)?.is_mvp ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => toggleMVP('A', selectedPlayerA)}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    {statsA.find(s => s.player_id === selectedPlayerA)?.is_mvp ? 'MVP' : 'Marcar MVP'}
                  </Button>
                </div>
              )}
            </Card>

            {/* Equipo B */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 text-center">{teamB?.name}</h3>
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

              {selectedPlayerB && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="lg" className="h-20 text-2xl" onClick={() => addPoints('B', selectedPlayerB, 1)}>+1</Button>
                    <Button size="lg" className="h-20 text-2xl" onClick={() => addPoints('B', selectedPlayerB, 2)}>+2</Button>
                    <Button size="lg" className="h-20 text-2xl" onClick={() => addPoints('B', selectedPlayerB, 3)}>+3</Button>
                  </div>
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
                  <Button
                    variant={statsB.find(s => s.player_id === selectedPlayerB)?.is_mvp ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => toggleMVP('B', selectedPlayerB)}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    {statsB.find(s => s.player_id === selectedPlayerB)?.is_mvp ? 'MVP' : 'Marcar MVP'}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Botones finales */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleFinish} size="lg">
              <Save className="h-4 w-4 mr-2" />
              Finalizar y Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
