'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X, Calendar, Clock } from 'lucide-react';
import type { MatchWithTeams } from '@/types/blacktop';
import Link from 'next/link';

interface UpcomingMatchesNotificationProps {
  matches: MatchWithTeams[];
  accentColor: string;
}

export function UpcomingMatchesNotification({ matches, accentColor }: UpcomingMatchesNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Filtrar partidos próximos (dentro de las próximas 24 horas)
  const upcomingMatches = matches.filter(match => {
    if (!match.scheduled_time || match.status !== 'scheduled') return false;
    const matchTime = new Date(match.scheduled_time).getTime();
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return matchTime > now && matchTime - now < twentyFourHours;
  });

  useEffect(() => {
    // Verificar si ya fue dismissed en esta sesión
    const dismissed = sessionStorage.getItem('blacktop-matches-dismissed');
    if (!dismissed && upcomingMatches.length > 0) {
      // Mostrar después de 2 segundos
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [upcomingMatches.length]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('blacktop-matches-dismissed', 'true');
  };

  if (upcomingMatches.length === 0 || isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50 max-w-md"
        >
          <Card className="bg-black/95 backdrop-blur border-2" style={{ borderColor: accentColor }}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-lg shrink-0"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <Bell className="h-5 w-5" style={{ color: accentColor }} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-white">
                      ¡Próximos Partidos!
                    </h4>
                    <button
                      onClick={handleDismiss}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {upcomingMatches.slice(0, 2).map((match) => (
                      <div
                        key={match.id}
                        className="p-2 rounded bg-white/5 text-sm"
                      >
                        <div className="flex items-center gap-2 text-white/80 mb-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(match.scheduled_time!).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>
                            {new Date(match.scheduled_time!).toLocaleTimeString('es-AR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="font-medium text-white">
                          {match.team_a?.name || 'TBD'} vs {match.team_b?.name || 'TBD'}
                        </div>
                        <div className="text-xs text-white/60 mt-1">
                          {match.round.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {upcomingMatches.length > 2 && (
                    <p className="text-xs text-white/60 mt-2">
                      +{upcomingMatches.length - 2} partidos más
                    </p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 text-white"
                      style={{ backgroundColor: accentColor }}
                      asChild
                    >
                      <Link href="#fixture">Ver Fixture</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white/70 hover:text-white"
                      onClick={handleDismiss}
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
