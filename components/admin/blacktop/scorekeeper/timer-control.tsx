'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerControlProps {
  timeRemaining: number;
  currentPeriod: number;
  totalPeriods: number;
  status: 'pending' | 'live' | 'halftime' | 'finished' | 'cancelled';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEndPeriod: () => void;
  onFinish: () => void;
  canStart: boolean;
  isGoldenPoint?: boolean;
  scoreA: number;
  scoreB: number;
  onSimulate?: () => void;
}

export function TimerControl({
  timeRemaining,
  currentPeriod,
  totalPeriods,
  status,
  onStart,
  onPause,
  onResume,
  onEndPeriod,
  onFinish,
  canStart,
  isGoldenPoint = false,
  scoreA,
  scoreB,
  onSimulate,
}: TimerControlProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'live':
        return 'bg-red-500/20 border-red-500';
      case 'halftime':
        return 'bg-yellow-500/20 border-yellow-500';
      case 'finished':
        return 'bg-green-500/20 border-green-500';
      default:
        return 'bg-muted border-border';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'live':
        return '🔴 EN VIVO';
      case 'halftime':
        return '⏸️ PAUSADO';
      case 'finished':
        return '✅ FINALIZADO';
      default:
        return '⏳ PENDIENTE';
    }
  };

  const isLastPeriod = currentPeriod === totalPeriods;
  const canEndPeriod = status === 'live' && timeRemaining === 0 && !isLastPeriod && !isGoldenPoint;
  const isTied = scoreA === scoreB;
  const canFinish = status === 'live' && timeRemaining === 0 && isLastPeriod && (!isTied || isGoldenPoint);

  return (
    <motion.div
      className="sticky top-0 z-50 bg-[#0d0d0d] border-b border-white/10 backdrop-blur-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4 py-6">
        {/* Timer Display */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <motion.div
            className="flex items-center gap-3"
            animate={status === 'live' ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Clock className="h-8 w-8 text-accent-brand" />
            <span className="text-7xl font-mono font-bold tracking-tight text-white">
              {formatTime(timeRemaining)}
            </span>
          </motion.div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            {!isGoldenPoint ? (
              <Badge variant="outline" className="text-lg px-4 py-2 border-accent-brand/50">
                Período {currentPeriod}/{totalPeriods}
              </Badge>
            ) : (
              <Badge className="text-lg px-4 py-2 border-2 bg-yellow-500/20 border-yellow-500 animate-pulse">
                ⚡ PUNTO DE ORO
              </Badge>
            )}
            <Badge className={`text-lg px-4 py-2 border-2 ${getStatusColor()}`}>
              {getStatusText()}
            </Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3">
          <AnimatePresence mode="wait">
            {status === 'pending' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  onClick={onStart}
                  disabled={!canStart}
                  size="lg"
                  className="h-16 px-8 text-lg bg-accent-brand hover:bg-accent-brand/90"
                >
                  <Play className="h-6 w-6 mr-2" />
                  Iniciar Partido
                </Button>
              </motion.div>
            )}

            {status === 'live' && (
              <motion.div
                key="pause"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  onClick={onPause}
                  size="lg"
                  variant="outline"
                  className="h-16 px-8 text-lg border-yellow-500 hover:bg-yellow-500/20"
                >
                  <Pause className="h-6 w-6 mr-2" />
                  Pausar
                </Button>
              </motion.div>
            )}

            {status === 'halftime' && (
              <motion.div
                key="resume"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  onClick={onResume}
                  size="lg"
                  className="h-16 px-8 text-lg bg-accent-brand hover:bg-accent-brand/90"
                >
                  <Play className="h-6 w-6 mr-2" />
                  Reanudar
                </Button>
              </motion.div>
            )}

            {canEndPeriod && (
              <motion.div
                key="end-period"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  onClick={onEndPeriod}
                  size="lg"
                  className="h-16 px-8 text-lg bg-blue-600 hover:bg-blue-700"
                >
                  <Square className="h-6 w-6 mr-2" />
                  Iniciar Período {currentPeriod + 1}
                </Button>
              </motion.div>
            )}

            {canFinish && (
              <motion.div
                key="finish"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  onClick={onFinish}
                  size="lg"
                  className="h-16 px-8 text-lg bg-green-600 hover:bg-green-700"
                >
                  <Square className="h-6 w-6 mr-2" />
                  Finalizar Partido
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!canStart && status === 'pending' && (
          <motion.p
            className="text-center text-red-400 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ⚠️ Configurá la duración y cantidad de períodos en el torneo antes de iniciar
          </motion.p>
        )}

        {/* Botón de Simulación (Solo Dev) */}
        {onSimulate && process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-center">
            <Button
              onClick={onSimulate}
              size="sm"
              variant="outline"
              className="border-purple-500 text-purple-500 hover:bg-purple-500/20"
            >
              🎲 Simular Partido (Dev)
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
