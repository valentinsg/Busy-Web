'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TimerControlV2 as TimerControl } from './timer-control-v2';
import { TeamScoreboardV2 as TeamScoreboard } from './team-scoreboard-v2';
import { PlayerActionSheet } from './player-action-sheet';
import { MVPSelectionModal } from './mvp-selection-modal';
import { ActionToast } from './action-toast';
import type { Match, Tournament, TeamWithPlayers, Player } from '@/types/blacktop';

interface LiveScorekeeperProProps {
  match: Match;
  tournament: Tournament;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PlayerStats {
  player_id: number;
  player_name: string;
  team_name: string;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  is_mvp: boolean;
}

export function LiveScorekeeperPro({
  match: initialMatch,
  tournament,
  open,
  onClose,
  onSuccess,
}: LiveScorekeeperProProps) {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [teamA, setTeamA] = useState<TeamWithPlayers | null>(null);
  const [teamB, setTeamB] = useState<TeamWithPlayers | null>(null);
  const [scoreA, setScoreA] = useState(initialMatch.team_a_score || 0);
  const [scoreB, setScoreB] = useState(initialMatch.team_b_score || 0);
  const [foulsA, setFoulsA] = useState(initialMatch.fouls_a || 0);
  const [foulsB, setFoulsB] = useState(initialMatch.fouls_b || 0);
  const [statsA, setStatsA] = useState<PlayerStats[]>([]);
  const [statsB, setStatsB] = useState<PlayerStats[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<(PlayerStats & { side: 'A' | 'B' }) | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showMVPModal, setShowMVPModal] = useState(false);
  const [mvpName, setMvpName] = useState<string>('');
  const [isSavingMatch, setIsSavingMatch] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isGoldenPoint, setIsGoldenPoint] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { toast } = useToast();

  // Determinar si es partido de playoffs
  const isPlayoffMatch = match.phase !== 'groups';
  
  // Usar configuración de playoffs si existe y es partido de playoffs, sino usar configuración de grupos
  const periodDuration = isPlayoffMatch && tournament.playoff_period_duration_minutes 
    ? tournament.playoff_period_duration_minutes 
    : tournament.period_duration_minutes;
  
  const periodsCount = isPlayoffMatch && tournament.playoff_periods_count
    ? tournament.playoff_periods_count
    : tournament.periods_count;

  const canStart = periodDuration > 0 && periodsCount > 0;

  // Timer 100% local - NO polling
  // Solo inicia el intervalo cuando status es 'live', NO resetea el tiempo
  useEffect(() => {
    if (match.status !== 'live') return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [match.status]); // Solo depende de status, NO de current_period

  // Inicializar tiempo solo cuando cambia el período
  useEffect(() => {
    const totalSeconds = periodDuration * 60;
    setTimeRemaining(totalSeconds);
  }, [match.current_period, periodDuration]);

  useEffect(() => {
    if (!open) return;
    if (!(match.team_a_id && match.team_b_id)) return;
    const ac = new AbortController();
    // Reset to avoid showing stale team while fetching
    setTeamA(undefined as any);
    setTeamB(undefined as any);
    (async () => {
      try {
        const [teamARes, teamBRes] = await Promise.all([
          fetch(`/api/blacktop/teams/${match.team_a_id}`, { signal: ac.signal, cache: 'no-store' }),
          fetch(`/api/blacktop/teams/${match.team_b_id}`, { signal: ac.signal, cache: 'no-store' }),
        ]);
        if (!teamARes.ok || !teamBRes.ok) return;
        const [teamAData, teamBData] = await Promise.all([teamARes.json(), teamBRes.json()]);
        console.log('🏀 Teams loaded:', { teamA: teamAData, teamB: teamBData });
        setTeamA(teamAData);
        setTeamB(teamBData);
        
        // Inicializar stats de jugadores
        console.log('👥 Initializing player stats...');
        setStatsA(
          teamAData.players.map((p: Player) => ({
            player_id: p.id,
            player_name: p.full_name,
            team_name: teamAData.name,
            points: 0,
            assists: 0,
            rebounds: 0,
            steals: 0,
            blocks: 0,
            turnovers: 0,
            is_mvp: false,
          }))
        );

        setStatsB(
          teamBData.players.map((p: Player) => ({
            player_id: p.id,
            player_name: p.full_name,
            team_name: teamBData.name,
            points: 0,
            assists: 0,
            rebounds: 0,
            steals: 0,
            blocks: 0,
            turnovers: 0,
            is_mvp: false,
          }))
        );
      } catch (_) {}
    })();
    return () => ac.abort();
  }, [open, match.id, match.team_a_id, match.team_b_id]);

  // Rehydrate local state when opening and cleanup on close
  useEffect(() => {
    if (!open) {
      // cleanup
      setSelectedPlayer(null);
      setIsGoldenPoint(false);
      setMvpName('');
      return;
    }
    // Rehydrate from match
    setScoreA((match as any).team_a_score ?? 0);
    setScoreB((match as any).team_b_score ?? 0);
    setFoulsA((match as any).fouls_a ?? 0);
    setFoulsB((match as any).fouls_b ?? 0);
    // Timer based on status
    if (match.status === 'live') setTimeRemaining(tournament.period_duration_minutes * 60);
    else setTimeRemaining(0);
  }, [open]);


  const showActionToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleStart = () => {
    // 100% local
    if (match.status !== 'pending') return;
    setMatch((prev) => ({ ...prev, status: 'live', current_period: prev.current_period || 1 }));
    setTimeRemaining(tournament.period_duration_minutes * 60);
    showActionToast('¡Partido iniciado! 🏀');
  };

  const handlePause = () => {
    // 100% local
    if (match.status !== 'live') return;
    setMatch((prev) => ({ ...prev, status: 'halftime' }));
    showActionToast('Partido pausado ⏸️');
  };

  const handleResume = () => {
    // 100% local
    if (match.status !== 'halftime') return;
    if (timeRemaining <= 0) return; // don't resume if period ended
    setMatch((prev) => ({ ...prev, status: 'live' }));
    showActionToast('¡Partido reanudado! ▶️');
  };

  const handleAdjustTime = (deltaSeconds: number) => {
    setTimeRemaining((prev) => {
      const newTime = prev + deltaSeconds;
      return Math.max(0, newTime); // No permitir tiempo negativo
    });
  };

  const handleEndPeriod = async () => {
    // Verificar si es el último período y hay empate
    const isLastPeriod = match.current_period === periodsCount;
    const isTied = scoreA === scoreB;

    if (isLastPeriod && isTied && tournament.golden_point_enabled) {
      // Activar modo golden point
      setIsGoldenPoint(true);
      handleResume();
      showActionToast('⚡ EMPATE! Punto de Oro activado - Próximo punto gana');
    } else {
      // Avanzar al siguiente período (local)
      setMatch((prev) => ({ ...prev, current_period: prev.current_period + 1, status: 'halftime' }));
      setTimeRemaining(tournament.period_duration_minutes * 60);
      showActionToast(`Período ${match.current_period} finalizado. Iniciá el período ${match.current_period + 1} cuando estés listo.`);
    }
  };

  const handleFinish = async () => {
    // Verificar si hay empate
    const isTied = scoreA === scoreB;
    
    if (isTied && !isGoldenPoint && tournament.golden_point_enabled) {
      // No permitir finalizar si hay empate - activar Golden Point
      setIsGoldenPoint(true);
      handleResume();
      showActionToast('⚡ EMPATE! Punto de Oro activado - Próximo punto gana');
      toast({
        title: '⚡ Punto de Oro',
        description: 'El partido está empatado. El próximo punto decide el ganador.',
        duration: 5000,
      });
      return;
    }
    
    // Si no hay empate o ya estamos en golden point, permitir finalizar
    handlePause();
    setShowMVPModal(true);
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

  const handleAddPoints = (side: 'A' | 'B', playerId: number, points: number) => {
    if (match.status === 'finished') return; // no scoring when finished
    if (side === 'A') {
      setScoreA((prev) => prev + points);
      setStatsA((prev) =>
        prev.map((s) => (s.player_id === playerId ? { ...s, points: s.points + points } : s))
      );
    } else {
      setScoreB((prev) => prev + points);
      setStatsB((prev) =>
        prev.map((s) => (s.player_id === playerId ? { ...s, points: s.points + points } : s))
      );
    }

    const playerName = side === 'A'
      ? statsA.find(s => s.player_id === playerId)?.player_name
      : statsB.find(s => s.player_id === playerId)?.player_name;

    showActionToast(`+${points} puntos para ${playerName}`);

    // Si estamos en golden point, terminar automáticamente
    if (isGoldenPoint) {
      const winnerTeam = side === 'A' ? teamA?.name : teamB?.name;
      showActionToast(`🏆 ¡${winnerTeam} gana por Punto de Oro!`);
      setTimeout(async () => {
        await updateScore();
        handleFinish();
      }, 2000);
    }
  };

  const handleAddStat = (
    side: 'A' | 'B',
    playerId: number,
    stat: 'assists' | 'rebounds' | 'steals' | 'blocks' | 'turnovers',
    delta: number
  ) => {
    if (match.status === 'finished') return; // block stats when finished
    
    // Actualización instantánea del estado local
    if (side === 'A') {
      setStatsA((prev) =>
        prev.map((s) =>
          s.player_id === playerId ? { ...s, [stat]: Math.max(0, s[stat] + delta) } : s
        )
      );
    } else {
      setStatsB((prev) =>
        prev.map((s) =>
          s.player_id === playerId ? { ...s, [stat]: Math.max(0, s[stat] + delta) } : s
        )
      );
    }
    
    // Toast feedback
    const statLabels = {
      assists: 'asistencia',
      rebounds: 'rebote',
      steals: 'robo',
      blocks: 'bloqueo',
      turnovers: 'pérdida'
    };
    const playerName = side === 'A'
      ? statsA.find(s => s.player_id === playerId)?.player_name
      : statsB.find(s => s.player_id === playerId)?.player_name;
    
    if (delta > 0) {
      showActionToast(`+1 ${statLabels[stat]} para ${playerName}`);
    }
  };

  const handleSimulate = () => {
    // Generar stats random para cada jugador
    const randomPoints = () => Math.floor(Math.random() * 15);
    const randomStat = () => Math.floor(Math.random() * 5);

    const newStatsA = statsA.map(s => ({
      ...s,
      points: randomPoints(),
      assists: randomStat(),
      rebounds: randomStat(),
      steals: randomStat(),
      turnovers: randomStat(),
    }));

    const newStatsB = statsB.map(s => ({
      ...s,
      points: randomPoints(),
      assists: randomStat(),
      rebounds: randomStat(),
      steals: randomStat(),
      turnovers: randomStat(),
    }));

    setStatsA(newStatsA);
    setStatsB(newStatsB);

    // Calcular scores totales
    const totalA = newStatsA.reduce((sum, s) => sum + s.points, 0);
    const totalB = newStatsB.reduce((sum, s) => sum + s.points, 0);

    setScoreA(totalA);
    setScoreB(totalB);

    // Faltas random
    setFoulsA(Math.floor(Math.random() * 4));
    setFoulsB(Math.floor(Math.random() * 4));

    // Timer a 0
    setTimeRemaining(0);

    showActionToast('🎲 Partido simulado con datos random');
  };

  const playersA = statsA.map((s) => ({
    id: s.player_id,
    full_name: s.player_name,
    points: s.points,
    assists: s.assists,
    rebounds: s.rebounds,
    steals: s.steals,
    blocks: s.blocks ?? 0,
    turnovers: s.turnovers,
  }));

  const playersB = statsB.map((s) => ({
    id: s.player_id,
    full_name: s.player_name,
    points: s.points,
    assists: s.assists,
    rebounds: s.rebounds,
    steals: s.steals,
    blocks: s.blocks ?? 0,
    turnovers: s.turnovers,
  }));

  const allPlayersForMVP = [
    ...statsA.map((s) => ({ ...s, id: s.player_id, full_name: s.player_name })),
    ...statsB.map((s) => ({ ...s, id: s.player_id, full_name: s.player_name })),
  ];

  const handleSelectMVP = async (playerId: number) => {
    const found = [...statsA, ...statsB].find((s) => s.player_id === playerId);
    setMvpName(found?.player_name || 'MVP');
    setIsSavingMatch(true); // Mostrar loader
    setShowMVPModal(false);
    
    // Guardar todo en la base de datos
    try {
      // 1. Actualizar score y faltas
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

      // 2. Finalizar partido
      await fetch(`/api/admin/blacktop/matches/${match.id}/finish`, {
        method: 'POST',
      });

      // 3. Guardar estadísticas de jugadores
      const allStats = [...statsA, ...statsB].map(s => ({
        ...s,
        is_mvp: s.player_id === playerId
      }));

      await fetch(`/api/admin/blacktop/matches/${match.id}/player-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: allStats }),
      });

      showActionToast('🏁 Partido finalizado y guardado');
      
      // Set finished locally and freeze controls
      setMatch((prev) => ({ ...prev, status: 'finished' }));
      
      // Cerrar modal y refrescar
      setTimeout(() => {
        onClose(); // Cerrar el scorekeeper
        onSuccess(); // Refrescar la vista
      }, 1000);
    } catch (error) {
      console.error('Error saving match data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el partido. Intenta de nuevo.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        // Prevenir cierre si el partido está finalizado pero no se ha elegido MVP
        if (!isOpen && match.status === 'finished' && !mvpName) {
          toast({
            title: 'Selecciona el MVP',
            description: 'Debes elegir el MVP antes de cerrar',
            variant: 'destructive'
          });
          return;
        }
        onClose();
      }}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-[#0d0d0d] border-none">
          {/* Loading Overlay */}
          {isSavingMatch && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-brand mb-4"></div>
              <p className="text-white text-xl font-heading">Guardando partido...</p>
              <p className="text-muted-foreground text-sm mt-2">Por favor espera</p>
            </div>
          )}
          
          <div className="h-full overflow-y-auto">
            {match.status === 'finished' && (
              <div className="w-full bg-green-600/20 border-b border-green-600 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-heading">
                    Partido finalizado {mvpName ? `– MVP: ${mvpName}` : ''}
                  </span>
                  {!mvpName && (
                    <Button
                      onClick={() => setShowMVPModal(true)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Elegir MVP y Salir
                    </Button>
                  )}
                </div>
              </div>
            )}
            {/* Timer Control */}
            <TimerControl
              timeRemaining={timeRemaining}
              currentPeriod={match.current_period}
              totalPeriods={periodsCount}
              status={match.status}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onEndPeriod={handleEndPeriod}
              onFinish={handleFinish}
              canStart={canStart}
              isGoldenPoint={isGoldenPoint}
              scoreA={scoreA}
              scoreB={scoreB}
              onAdjustTime={handleAdjustTime}
              onSimulate={handleSimulate}
              onReset={process.env.NODE_ENV === 'development' ? () => {
                // Reset local state (Dev only)
                setScoreA(0); setScoreB(0);
                setFoulsA(0); setFoulsB(0);
                setStatsA(statsA.map(s => ({ ...s, points: 0, assists: 0, rebounds: 0, steals: 0, blocks: s.blocks ?? 0, turnovers: 0 })));
                setStatsB(statsB.map(s => ({ ...s, points: 0, assists: 0, rebounds: 0, steals: 0, blocks: s.blocks ?? 0, turnovers: 0 })));
                setIsGoldenPoint(false);
                setMvpName('');
                setShowMVPModal(false);
                setMatch((prev) => ({ ...prev, status: 'pending', current_period: 1 }));
                setTimeRemaining(tournament.period_duration_minutes * 60);
                showActionToast('🔄 Partido reseteado (Dev)');
              } : undefined}
            />

            {/* Scoreboards */}
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TeamScoreboard
                  teamName={teamA?.name || 'Equipo A'}
                  score={scoreA}
                  fouls={foulsA}
                  players={playersA}
                  side="A"
                  onAddFoul={() => setFoulsA((f) => f + 1)}
                  onRemoveFoul={() => setFoulsA((f) => Math.max(0, f - 1))}
                  onPlayerSelect={(player) => setSelectedPlayer({ ...player, side: 'A' } as any)}
                  isPaused={match.status === 'halftime'}
                />

                <TeamScoreboard
                  teamName={teamB?.name || 'Equipo B'}
                  score={scoreB}
                  fouls={foulsB}
                  players={playersB}
                  side="B"
                  onAddFoul={() => setFoulsB((f) => f + 1)}
                  onRemoveFoul={() => setFoulsB((f) => Math.max(0, f - 1))}
                  onPlayerSelect={(player) => setSelectedPlayer({ ...player, side: 'B' } as any)}
                  isPaused={match.status === 'halftime'}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Player Action Sheet */}
      {(() => {
        if (!selectedPlayer) return null;
        
        const pid = (selectedPlayer as any).player_id ?? (selectedPlayer as any).id;
        const side = (selectedPlayer as any).side as 'A' | 'B';
        
        // Buscar stats actualizadas en tiempo real
        const currentStats = side === 'A' 
          ? statsA.find(s => s.player_id === pid)
          : statsB.find(s => s.player_id === pid);
        
        const sheetPlayer = currentStats
          ? {
              id: currentStats.player_id,
              full_name: currentStats.player_name,
              points: currentStats.points,
              assists: currentStats.assists,
              rebounds: currentStats.rebounds,
              steals: currentStats.steals,
              blocks: currentStats.blocks,
              turnovers: currentStats.turnovers,
            }
          : null;
        
        return (
          <PlayerActionSheet
            player={sheetPlayer}
            open={Boolean(selectedPlayer)}
            onClose={() => setSelectedPlayer(null)}
            onAddPoints={(points) => {
              handleAddPoints(side, pid, points);
            }}
            onAddStat={(stat, delta) => {
              handleAddStat(side, pid, stat, delta);
            }}
          />
        );
      })()}

      {/* MVP Selection Modal */}
      <MVPSelectionModal
        open={showMVPModal}
        players={allPlayersForMVP}
        onSelect={handleSelectMVP}
      />

      {/* Action Toast */}
      <ActionToast message={toastMessage} show={showToast} />
    </>
  );
}
