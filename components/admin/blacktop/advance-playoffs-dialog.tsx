'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, Trophy, Zap } from 'lucide-react';

interface AdvancePlayoffsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  groupsComplete: boolean;
  totalMatches: number;
  finishedMatches: number;
  thirdPlaceEnabled: boolean;
}

export function AdvancePlayoffsDialog({
  open,
  onOpenChange,
  onConfirm,
  groupsComplete,
  totalMatches,
  finishedMatches,
  thirdPlaceEnabled,
}: AdvancePlayoffsDialogProps) {
  const progress = totalMatches > 0 ? (finishedMatches / totalMatches) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-zinc-950 to-black border-accent-brand/30 font-body">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-heading flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Avanzar a Playoffs
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base mt-1 text-muted-foreground">
            Los mejores equipos de cada zona se enfrentarán en la fase eliminatoria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Progreso de Fase de Grupos</span>
              <Badge variant={groupsComplete ? 'default' : 'outline'} className={groupsComplete ? 'bg-green-600' : ''}>
                {finishedMatches}/{totalMatches} partidos
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full ${groupsComplete ? 'bg-green-500' : 'bg-accent-brand'}`}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {groupsComplete
                ? '✅ Todos los partidos de grupos están finalizados'
                : `⏳ Faltan ${totalMatches - finishedMatches} partidos por finalizar`
              }
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-lg bg-purple-600/10 border border-purple-600/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <span className="font-semibold text-white text-sm">Se Generarán</span>
              </div>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 list-none">
                <li>• Semifinales (cruces)</li>
                <li>• Final</li>
                {thirdPlaceEnabled && <li>• Tercer puesto</li>}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-lg bg-accent-brand/10 border border-accent-brand/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-accent-brand" />
                <span className="font-semibold text-white text-sm">Clasificación</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Los mejores equipos de cada zona según puntos y diferencia de gol
              </p>
            </motion.div>
          </div>

          {/* Warning */}
          {!groupsComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-yellow-600/10 border border-yellow-600/30"
            >
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-500 mb-1">Advertencia</p>
                <p className="text-sm text-yellow-500/80">
                  Aún hay partidos de grupos sin finalizar. Asegúrate de que todos los partidos estén completos antes de avanzar.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 hover:bg-white/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={!groupsComplete}
            className="bg-accent-brand hover:bg-accent-brand/90 gap-2"
          >
            <Trophy className="h-4 w-4" />
            Avanzar a Playoffs
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
