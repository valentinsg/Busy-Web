'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, AlertTriangle } from 'lucide-react';

interface Player {
  id: number;
  full_name: string;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
}

interface TeamScoreboardV2Props {
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

export function TeamScoreboardV2({
  teamName,
  score,
  fouls,
  players,
  side,
  onAddFoul,
  onRemoveFoul,
  onPlayerSelect,
  isPaused,
}: TeamScoreboardV2Props) {
  const isBonus = fouls >= 3;

  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-bold text-white">{teamName}</h2>
        <div className="text-6xl font-heading font-bold text-white tabular-nums">
          {score}
        </div>
      </div>

      {/* Faltas */}
      <div className="flex items-center justify-center gap-3 mb-4 pb-4 border-b border-white/10">
        <Button
          onClick={onRemoveFoul}
          disabled={fouls === 0}
          size="lg"
          variant="ghost"
          className="h-14 w-14 p-0 text-red-500 hover:bg-red-500/20"
        >
          <Minus className="h-6 w-6" />
        </Button>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground font-body">FALTAS</span>
          <Badge
            variant={isBonus ? 'destructive' : 'outline'}
            className="text-xl px-4 py-1 min-w-[60px] justify-center font-heading"
          >
            {fouls}
          </Badge>
          {isBonus && (
            <div className="flex items-center gap-1 text-red-400 text-xs font-body">
              <AlertTriangle className="h-3 w-3" />
              BONUS
            </div>
          )}
        </div>

        <Button
          onClick={onAddFoul}
          size="lg"
          variant="ghost"
          className="h-14 w-14 p-0 text-accent-brand hover:bg-accent-brand/20"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Players */}
      <div className="space-y-1">
        {players.map((player) => (
          <button
            key={player.id}
            onClick={() => onPlayerSelect(player)}
            className="w-full text-left p-2 rounded hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-white">{player.full_name}</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-body tabular-nums">
                <span className="font-bold text-white">{player.points} PTS</span>
                <span>{player.assists} AST</span>
                <span>{player.rebounds} REB</span>
                <span>{player.steals} STL</span>
                <span>{player.blocks} BLK</span>
                <span>{player.turnovers} TOV</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
