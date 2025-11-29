'use client';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { AlertCircle, Shield, Target, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MatchStatsViewModalProps {
  matchId: number;
  open: boolean;
  onClose: () => void;
}

interface PlayerStat {
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

interface MatchData {
  match: {
    id: number;
    team_a_score: number;
    team_b_score: number;
    fouls_a: number;
    fouls_b: number;
  };
  teamA: {
    id: number;
    name: string;
  };
  teamB: {
    id: number;
    name: string;
  };
  statsA: PlayerStat[];
  statsB: PlayerStat[];
}

export function MatchStatsViewModal({ matchId, open, onClose }: MatchStatsViewModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MatchData | null>(null);

  useEffect(() => {
    if (open && matchId) {
      loadMatchStats();
    }
  }, [open, matchId]);

  const loadMatchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blacktop/matches/${matchId}/stats`);
      if (res.ok) {
        const matchData = await res.json();
        setData(matchData);
      }
    } catch (error) {
      console.error('Error loading match stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMVP = () => {
    if (!data) return null;
    const allPlayers = [...data.statsA, ...data.statsB];
    return allPlayers.find(p => p.is_mvp);
  };

  const getTopScorer = () => {
    if (!data) return null;
    const allPlayers = [...data.statsA, ...data.statsB];
    return allPlayers.reduce((max, p) => p.points > max.points ? p : max, allPlayers[0]);
  };

  const mvp = getMVP();
  const topScorer = getTopScorer();

  const hasTeamsAndScores =
    !!data &&
    !!data.teamA &&
    !!data.teamB &&
    typeof data.match.team_a_score === 'number' &&
    typeof data.match.team_b_score === 'number';

  const winner = hasTeamsAndScores
    ? data!.match.team_a_score > data!.match.team_b_score
      ? data!.teamA
      : data!.teamB
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-zinc-950 to-black border-white/10">
        {loading ? (
          <div className="space-y-6 p-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : data && hasTeamsAndScores ? (
          <div className="space-y-6">
            {/* Header con resultado */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-brand/20 to-purple-600/20 p-8 border border-accent-brand/30">
              <div className="absolute inset-0 bg-grid-white/5"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <Badge className="bg-green-600/20 text-green-400 border-green-600">
                    Finalizado
                  </Badge>
                  {winner && (
                    <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600">
                      <Trophy className="h-3 w-3 mr-1" />
                      Ganador: {winner.name}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-8 items-center">
                  {/* Team A */}
                  <div className="text-center">
                    <h3 className="text-2xl font-heading text-white mb-2">{data.teamA.name}</h3>
                    <div className="text-6xl font-bold text-white tabular-nums">
                      {data.match.team_a_score}
                    </div>
                    <div className="flex gap-1 mt-3 justify-center">
                      {Array.from({ length: Math.min(data.match.fouls_a, 3) }).map((_, i) => (
                        <div key={i} className="w-8 h-1.5 bg-zinc-600 rounded-full" />
                      ))}
                      {data.match.fouls_a > 3 && Array.from({ length: data.match.fouls_a - 3 }).map((_, i) => (
                        <div key={`extra-${i}`} className="w-8 h-1.5 bg-red-500 rounded-full" />
                      ))}
                    </div>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-muted-foreground">VS</div>
                  </div>

                  {/* Team B */}
                  <div className="text-center">
                    <h3 className="text-2xl font-heading text-white mb-2">{data.teamB.name}</h3>
                    <div className="text-6xl font-bold text-white tabular-nums">
                      {data.match.team_b_score}
                    </div>
                    <div className="flex gap-1 mt-3 justify-center">
                      {Array.from({ length: Math.min(data.match.fouls_b, 3) }).map((_, i) => (
                        <div key={i} className="w-8 h-1.5 bg-zinc-600 rounded-full" />
                      ))}
                      {data.match.fouls_b > 3 && Array.from({ length: data.match.fouls_b - 3 }).map((_, i) => (
                        <div key={`extra-${i}`} className="w-8 h-1.5 bg-red-500 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-4">
              {mvp && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-600/30"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-500">MVP del Partido</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">{mvp.player_name}</h4>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{mvp.points} PTS</span>
                    <span>{mvp.assists} AST</span>
                    <span>{mvp.rebounds} REB</span>
                  </div>
                </motion.div>
              )}

              {topScorer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-red-600/20 to-pink-600/20 border border-red-600/30"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="h-6 w-6 text-red-500" />
                    <span className="text-sm font-semibold text-red-500">Máximo Anotador</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">{topScorer.player_name}</h4>
                  <div className="text-4xl font-bold text-red-500 tabular-nums">{topScorer.points} PTS</div>
                </motion.div>
              )}
            </div>

            {/* Stats por equipo */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Team A Stats */}
              <div className="space-y-3">
                <h3 className="text-xl font-heading text-white flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-accent-brand" />
                  {data.teamA.name}
                </h3>
                {data.statsA.map((player, index) => (
                  <motion.div
                    key={player.player_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{player.player_name}</span>
                      {player.is_mvp && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="grid grid-cols-6 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-accent-brand font-bold text-lg">{player.points}</div>
                        <div className="text-muted-foreground">PTS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{player.assists}</div>
                        <div className="text-muted-foreground">AST</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{player.rebounds}</div>
                        <div className="text-muted-foreground">REB</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{player.steals}</div>
                        <div className="text-muted-foreground">ROB</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{player.blocks}</div>
                        <div className="text-muted-foreground">BLQ</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-400 font-semibold">{player.turnovers}</div>
                        <div className="text-muted-foreground">PER</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Team B Stats */}
              <div className="space-y-3">
                <h3 className="text-xl font-heading text-white flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-purple-500" />
                  {data.teamB.name}
                </h3>
                {data.statsB.map((player, index) => (
                  <motion.div
                    key={player.player_id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{player.player_name}</span>
                      {player.is_mvp && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="grid grid-cols-6 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-purple-500 font-bold text-lg">{player.points}</div>
                        <div className="text-muted-foreground">PTS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{player.assists}</div>
                        <div className="text-muted-foreground">AST</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{player.rebounds}</div>
                        <div className="text-muted-foreground">REB</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{player.steals}</div>
                        <div className="text-muted-foreground">ROB</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{player.blocks}</div>
                        <div className="text-muted-foreground">BLQ</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-400 font-semibold">{player.turnovers}</div>
                        <div className="text-muted-foreground">PER</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Este partido todavía no tiene equipos ni estadísticas definidas.
              <br />
              Generá y completá el partido para ver el detalle.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
