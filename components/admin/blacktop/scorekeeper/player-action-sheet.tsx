'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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

interface PlayerActionSheetProps {
  player: Player | null;
  open: boolean;
  onClose: () => void;
  onAddPoints: (points: number) => void;
  onAddStat: (stat: 'assists' | 'rebounds' | 'steals' | 'blocks' | 'turnovers', delta: number) => void;
}

const STAT_LABELS = {
  assists: 'Asistencias',
  rebounds: 'Rebotes',
  steals: 'Robos',
  blocks: 'Bloqueos',
  turnovers: 'Pérdidas',
};

export function PlayerActionSheet({
  player,
  open,
  onClose,
  onAddPoints,
  onAddStat,
}: PlayerActionSheetProps) {
  if (!player) return null;

  const handleAction = (action: () => void) => {
    action();
    // Vibración háptica si está disponible
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="h-auto max-h-[65vh] bg-gradient-to-b from-zinc-900 to-black border-t-2 border-accent-brand/30 rounded-t-3xl"
      >
        {/* Header compacto */}
        <div className="pb-4 border-b border-white/10">
          <SheetTitle className="text-xl font-heading text-white">{player.full_name}</SheetTitle>
          <div className="flex gap-3 mt-2 text-xs text-muted-foreground font-body">
            <span className="font-bold text-accent-brand">{player.points} PTS</span>
            <span>{player.assists} AST</span>
            <span>{player.rebounds} REB</span>
            <span>{player.steals} ROB</span>
            <span>{player.blocks} BLQ</span>
            <span>{player.turnovers} PER</span>
          </div>
        </div>

        <div className="mt-4 space-y-4 pb-6">
          {/* Puntos - Más grande y táctil */}
          <div>
            <h3 className="text-sm font-semibold text-white/70 mb-3 font-heading">ANOTAR PUNTOS</h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[1, 2, 3].map((points) => (
                <motion.div key={points} whileTap={{ scale: 0.92 }}>
                  <Button
                    onClick={() => handleAction(() => onAddPoints(points))}
                    size="lg"
                    className="h-20 w-full text-4xl font-bold bg-gradient-to-br from-accent-brand to-accent-brand/80 hover:from-accent-brand/90 hover:to-accent-brand/70 shadow-lg shadow-accent-brand/20 border-2 border-accent-brand/30"
                  >
                    +{points}
                  </Button>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((points) => (
                <motion.div key={`minus-${points}`} whileTap={{ scale: 0.92 }}>
                  <Button
                    onClick={() => handleAction(() => onAddPoints(-points))}
                    size="sm"
                    variant="outline"
                    className="h-12 w-full text-lg font-bold border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500"
                  >
                    -{points}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Estadísticas - Grid compacto */}
          <div>
            <h3 className="text-sm font-semibold text-white/70 mb-3 font-heading">ESTADÍSTICAS</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STAT_LABELS) as Array<keyof typeof STAT_LABELS>).map((stat) => (
                <StatButton
                  key={stat}
                  label={STAT_LABELS[stat]}
                  value={player[stat]}
                  onAdd={() => handleAction(() => onAddStat(stat, 1))}
                  onRemove={() => handleAction(() => onAddStat(stat, -1))}
                />
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatButton({
  label,
  value,
  onAdd,
  onRemove,
}: {
  label: string;
  value: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative rounded-xl bg-white/5 border border-white/10 overflow-hidden group">
      {/* Área clickeable izquierda (restar) */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onRemove}
        disabled={value === 0}
        className="absolute left-0 top-0 bottom-0 w-1/3 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-red-400/30 group-hover:text-red-400/60 text-lg font-bold transition-colors">
          −
        </span>
      </motion.button>

      {/* Área clickeable derecha (sumar) */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onAdd}
        className="absolute right-0 top-0 bottom-0 w-1/3 hover:bg-accent-brand/10 transition-colors"
      >
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-accent-brand/30 group-hover:text-accent-brand/60 text-lg font-bold transition-colors">
          +
        </span>
      </motion.button>

      {/* Contenido central */}
      <div className="relative flex items-center justify-between p-3 pointer-events-none">
        <span className="text-xs text-white/70 font-semibold font-heading min-w-[70px]">{label}</span>
        <span className="text-xl font-bold text-white min-w-[30px] text-center tabular-nums">{value}</span>
      </div>
    </div>
  );
}
