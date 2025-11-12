'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock } from 'lucide-react';
import type { Match, Team } from '@/types/blacktop';

interface PlayoffBracketProps {
  tournamentId: number;
}

interface BracketMatch extends Match {
  team_a?: Team;
  team_b?: Team;
}

export function PlayoffBracket({ tournamentId }: PlayoffBracketProps) {
  const [semifinals, setSemifinals] = useState<BracketMatch[]>([]);
  const [final, setFinal] = useState<BracketMatch | null>(null);
  const [thirdPlace, setThirdPlace] = useState<BracketMatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBracket();
  }, [tournamentId]);

  const loadBracket = async () => {
    try {
      const res = await fetch(`/api/blacktop/tournaments/${tournamentId}/matches`);
      if (res.ok) {
        const matches: BracketMatch[] = await res.json();
        setSemifinals(matches.filter(m => m.round === 'semifinal'));
        setFinal(matches.find(m => m.round === 'final') || null);
        setThirdPlace(matches.find(m => m.round === 'third_place') || null);
      }
    } catch (error) {
      console.error('Error loading bracket:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando bracket...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Bracket de Playoffs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Semifinales */}
            <div className="space-y-4">
              <h3 className="font-semibold text-center mb-4">Semifinales</h3>
              {semifinals.map((match, index) => (
                <MatchCard key={match.id} match={match} label={`SF ${index + 1}`} />
              ))}
            </div>

            {/* Final */}
            <div className="flex flex-col justify-center">
              <h3 className="font-semibold text-center mb-4">Final</h3>
              {final && <MatchCard match={final} label="FINAL" highlight />}
            </div>

            {/* 3er puesto */}
            {thirdPlace && (
              <div className="flex flex-col justify-center">
                <h3 className="font-semibold text-center mb-4">3º Puesto</h3>
                <MatchCard match={thirdPlace} label="3º PUESTO" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MatchCard({ match, label, highlight }: { match: BracketMatch; label: string; highlight?: boolean }) {
  const winner = match.winner_id;
  const isCompleted = match.status === 'finished';

  return (
    <div className={`border-2 rounded-lg p-4 ${highlight ? 'border-yellow-500 bg-yellow-500/10' : 'border-border'}`}>
      <div className="text-xs font-semibold text-muted-foreground mb-2 text-center">{label}</div>
      
      {/* Team A */}
      <div className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
        isCompleted && winner === match.team_a_id ? 'bg-green-500/20 border-2 border-green-500' : 'bg-muted'
      }`}>
        <div className="flex-1">
          <div className="font-semibold">{match.team_a?.name || 'TBD'}</div>
        </div>
        {isCompleted && (
          <div className="text-2xl font-bold ml-2">{match.team_a_score}</div>
        )}
      </div>

      {/* VS */}
      <div className="text-center text-xs text-muted-foreground my-1">vs</div>

      {/* Team B */}
      <div className={`flex items-center justify-between p-3 rounded-lg ${
        isCompleted && winner === match.team_b_id ? 'bg-green-500/20 border-2 border-green-500' : 'bg-muted'
      }`}>
        <div className="flex-1">
          <div className="font-semibold">{match.team_b?.name || 'TBD'}</div>
        </div>
        {isCompleted && (
          <div className="text-2xl font-bold ml-2">{match.team_b_score}</div>
        )}
      </div>

      {/* Hora */}
      {match.scheduled_time && (
        <div className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(match.scheduled_time).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}

      {/* Estado */}
      <div className="mt-2 text-center">
        <Badge variant={isCompleted ? 'default' : 'outline'} className="text-xs">
          {isCompleted ? 'Finalizado' : match.status === 'live' ? 'En juego' : 'Programado'}
        </Badge>
      </div>
    </div>
  );
}
