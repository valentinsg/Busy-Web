'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface TimerControlV2Props {
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
  onReset?: () => void;
  onAdjustTime?: (seconds: number) => void;
}

export function TimerControlV2({
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
  onReset,
  onAdjustTime,
}: TimerControlV2Props) {
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('0');
  const [manualSeconds, setManualSeconds] = useState('0');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAdjustTime = (delta: number) => {
    if (onAdjustTime) {
      onAdjustTime(delta);
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const handleSetManualTime = () => {
    const totalSeconds = parseInt(manualMinutes) * 60 + parseInt(manualSeconds);
    if (onAdjustTime && !isNaN(totalSeconds)) {
      onAdjustTime(totalSeconds - timeRemaining);
      setShowTimeDialog(false);
    }
  };

  const isLastPeriod = currentPeriod === totalPeriods;
  const canEndPeriod = status === 'live' && timeRemaining === 0 && !isLastPeriod && !isGoldenPoint;
  const isTied = scoreA === scoreB;
  const canFinish = status === 'live' && timeRemaining === 0 && isLastPeriod && (!isTied || isGoldenPoint);

  return (
    <div className={`border-b border-white/10 py-4 ${isGoldenPoint ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30' : 'bg-black'}`}>
      <div className="container mx-auto px-4">
        {/* Timer y Controles en una sola línea */}
        <div className="flex items-center justify-between">
          {/* Timer con controles */}
          <div className="flex items-center gap-3">
            {/* Controles de tiempo */}
            {onAdjustTime && status !== 'pending' && status !== 'finished' && (
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => handleAdjustTime(-5)}
                  size="sm"
                  variant="ghost"
                  className="h-10 w-10 p-0 hover:bg-white/10"
                  title="Retroceder 5 segundos"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => setShowTimeDialog(true)}
                  size="sm"
                  variant="ghost"
                  className="h-10 w-10 p-0 hover:bg-white/10"
                  title="Ajustar tiempo manualmente"
                >
                  <Clock className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleAdjustTime(5)}
                  size="sm"
                  variant="ghost"
                  className="h-10 w-10 p-0 hover:bg-white/10"
                  title="Avanzar 5 segundos"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            <span className="font-heading text-5xl font-bold text-white tabular-nums">
              {formatTime(timeRemaining)}
            </span>
            
            {!isGoldenPoint ? (
              <Badge variant="outline" className="text-sm font-body">
                Q{currentPeriod}/{totalPeriods}
              </Badge>
            ) : (
              <Badge className="text-sm font-body bg-yellow-500/20 border-yellow-500 text-yellow-500">
                ⚡ PUNTO DE ORO
              </Badge>
            )}
          </div>

          {/* Controles */}
          <div className="flex items-center gap-2">
            {status === 'pending' && (
              <Button
                onClick={onStart}
                disabled={!canStart}
                size="lg"
                className="h-12 px-6 font-body"
              >
                <Play className="h-5 w-5 mr-2" />
                Iniciar
              </Button>
            )}

            {status === 'live' && (
              <Button
                onClick={onPause}
                size="lg"
                variant="outline"
                className="h-12 w-12 p-0"
              >
                <Pause className="h-5 w-5" />
              </Button>
            )}

            {status === 'halftime' && (
              <Button
                onClick={onResume}
                size="lg"
                variant="outline"
                className="h-12 w-12 p-0"
              >
                <Play className="h-5 w-5" />
              </Button>
            )}

            {canEndPeriod && (
              <Button
                onClick={onEndPeriod}
                size="lg"
                className="h-12 px-6 font-body"
              >
                Siguiente Período
              </Button>
            )}

            {canFinish && (
              <Button
                onClick={onFinish}
                size="lg"
                className="h-12 px-6 font-body bg-green-600 hover:bg-green-700"
              >
                <Square className="h-5 w-5 mr-2" />
                Finalizar
              </Button>
            )}

            {/* Botón Finalizar Partido (siempre visible durante el partido) */}
            {(status === 'live' || status === 'halftime') && !canFinish && (
              <Button
                onClick={onFinish}
                size="lg"
                variant="outline"
                className="h-12 px-6 font-body border-green-500/50 text-green-400 hover:bg-green-500/20 hover:border-green-500"
              >
                <Square className="h-5 w-5 mr-2" />
                Finalizar Partido
              </Button>
            )}

            {/* Simulación/Reset (Dev) */}
            {process.env.NODE_ENV === 'development' && (
              <>
                {onSimulate && status === 'pending' && (
                  <Button
                    onClick={onSimulate}
                    size="sm"
                    variant="ghost"
                    className="text-purple-500"
                  >
                    🎲
                  </Button>
                )}
                {onReset && (
                  <Button
                    onClick={onReset}
                    size="sm"
                    variant="ghost"
                    className="text-amber-400"
                  >
                    ⟲
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {!canStart && status === 'pending' && (
          <p className="text-sm text-red-400 mt-2 font-body">
            ⚠️ Configurá la duración y cantidad de períodos en el torneo
          </p>
        )}
      </div>

      {/* Diálogo de ajuste manual de tiempo */}
      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Ajustar Tiempo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Minutos</label>
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  className="bg-black border-white/10 text-white text-2xl text-center"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Segundos</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={manualSeconds}
                  onChange={(e) => setManualSeconds(e.target.value)}
                  className="bg-black border-white/10 text-white text-2xl text-center"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowTimeDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSetManualTime}
                className="flex-1 bg-accent-brand hover:bg-accent-brand/90"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
