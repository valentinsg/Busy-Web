'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface Player {
  id: number;
  full_name: string;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  turnovers: number;
  team_name: string;
}

interface MVPSelectionModalProps {
  open: boolean;
  players: Player[];
  onSelect: (playerId: number) => void;
}

export function MVPSelectionModal({ open, players, onSelect }: MVPSelectionModalProps) {
  // Ordenar por puntos
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-2xl bg-[#0d0d0d] border border-white/10"
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-3xl text-center text-white flex items-center justify-center gap-3 font-body">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Seleccioná el MVP del Partido
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            Elegí al jugador más valioso antes de finalizar
          </p>
        </DialogHeader>

        <div className="mt-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {sortedPlayers.map((player, index) => (
            <motion.button
              key={player.id}
              onClick={() => onSelect(player.id)}
              className="w-full p-6 rounded-lg bg-white/5 hover:bg-accent-brand/20 border border-white/10 hover:border-accent-brand transition-all text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-white font-body">{player.full_name}</span>
                    {index === 0 && (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{player.team_name}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-white font-semibold">{player.points} PTS</span>
                    <span className="text-muted-foreground">{player.assists} AST</span>
                    <span className="text-muted-foreground">{player.rebounds} REB</span>
                    <span className="text-muted-foreground">{player.steals} STL</span>
                    <span className="text-muted-foreground">{player.turnovers} TOV</span>
                  </div>
                </div>
                <div className="text-5xl font-bold text-accent-brand ml-4">
                  {player.points}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="text-center text-sm text-yellow-500 mt-4">
          ⚠️ No podés cerrar sin elegir MVP
        </p>
      </DialogContent>
    </Dialog>
  );
}
