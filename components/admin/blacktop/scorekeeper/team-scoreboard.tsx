'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Player {
  id: number;
  full_name: string;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  turnovers: number;
}

interface TeamScoreboardProps {
  teamName: string;
  score: number;
  fouls: number;
  players: Player[];
  side: 'A' | 'B';
  onAddFoul: () => void;
  onRemoveFoul: () => void;
  onPlayerSelect: (player: Player) => void;
  isPaused: boolean;
}

export function TeamScoreboard({
  teamName,
  score,
  fouls,
  players,
  side,
  onAddFoul,
  onRemoveFoul,
  onPlayerSelect,
  isPaused,
}: TeamScoreboardProps) {
  const isBonus = fouls >= 3;
  const sideColor = side === 'A' ? 'from-red-500/10' : 'from-blue-500/10';

  return (
    <Card className={`bg-gradient-to-br ${sideColor} to-transparent border-white/10`}>
      <div className="p-6">
        {/* Team Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{teamName}</h2>
          
          {/* Score */}
          <motion.div
            className="text-8xl font-bold text-white my-4"
            key={score}
            initial={{ scale: 1.2, color: '#10b981' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.3 }}
          >
            {score}
          </motion.div>

          {/* Fouls */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button
              onClick={onRemoveFoul}
              disabled={fouls === 0}
              size="lg"
              variant="outline"
              className="h-12 w-12 p-0 border-red-500 text-red-500 hover:bg-red-500/20"
            >
              <Minus className="h-6 w-6" />
            </Button>

            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">Faltas</span>
              <Badge
                variant={isBonus ? 'destructive' : 'outline'}
                className="text-2xl px-6 py-2 min-w-[80px] justify-center"
              >
                {fouls}
              </Badge>
              {isBonus && (
                <motion.div
                  className="flex items-center gap-1 text-red-400 text-sm font-semibold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertTriangle className="h-4 w-4" />
                  BONUS
                </motion.div>
              )}
            </div>

            <Button
              onClick={onAddFoul}
              size="lg"
              variant="outline"
              className="h-12 w-12 p-0 border-accent-brand text-accent-brand hover:bg-accent-brand/20"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Players */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Jugadores</h3>
          {players.map((player) => (
            <motion.button
              key={player.id}
              onClick={() => onPlayerSelect(player)}
              className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{player.full_name}</p>
                  <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{player.points} PTS</span>
                    <span>{player.assists} AST</span>
                    <span>{player.rebounds} REB</span>
                    <span>{player.steals} STL</span>
                    <span>{player.turnovers} TOV</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-accent-brand">
                  {player.points}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </Card>
  );
}
