'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Trophy } from 'lucide-react';
import type { MatchWithTeams } from '@/types/blacktop';

interface MatchCardProps {
  match: MatchWithTeams;
  onManage: (match: MatchWithTeams) => void;
  onViewStats?: (matchId: number) => void;
}

export function MatchCard({ match, onManage, onViewStats }: MatchCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge variant="destructive" className="text-xs">🔴 En vivo</Badge>;
      case 'finished':
        return <Badge variant="default" className="text-xs">Finalizado</Badge>;
      case 'halftime':
        return <Badge variant="outline" className="text-xs">Entretiempo</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Pendiente</Badge>;
    }
  };

  return (
    <div 
      className={`relative p-4 border rounded-lg transition-colors bg-gradient-to-r from-zinc-900/50 to-black/50 ${
        match.status === 'finished' && onViewStats 
          ? 'hover:border-accent-brand/50 cursor-pointer' 
          : 'hover:border-accent-brand/50'
      }`}
      onClick={() => {
        if (match.status === 'finished' && onViewStats) {
          onViewStats(match.id);
        }
      }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Team A */}
        <div className="flex-1 flex items-center justify-between">
          <div className="flex-1">
            <p className="font-semibold text-white">{match.team_a?.name || 'TBD'}</p>
            {/* Faltas Team A */}
            {match.status === 'finished' && match.fouls_a !== null && (
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: Math.min(match.fouls_a, 3) }).map((_, i) => (
                  <div key={i} className="w-6 h-1 bg-zinc-600 rounded-full" />
                ))}
                {match.fouls_a > 3 && Array.from({ length: match.fouls_a - 3 }).map((_, i) => (
                  <div key={`extra-${i}`} className="w-6 h-1 bg-red-500 rounded-full" />
                ))}
              </div>
            )}
          </div>
          {match.team_a_score !== null && (
            <span className="text-3xl font-bold tabular-nums ml-4">{match.team_a_score}</span>
          )}
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-1 px-4">
          <span className="text-xs text-muted-foreground font-bold">VS</span>
          {getStatusBadge(match.status)}
        </div>

        {/* Team B */}
        <div className="flex-1 flex items-center justify-between">
          {match.team_b_score !== null && (
            <span className="text-3xl font-bold tabular-nums mr-4">{match.team_b_score}</span>
          )}
          <div className="flex-1 text-right">
            <p className="font-semibold text-white">{match.team_b?.name || 'TBD'}</p>
            {/* Faltas Team B */}
            {match.status === 'finished' && match.fouls_b !== null && (
              <div className="flex gap-0.5 mt-1 justify-end">
                {Array.from({ length: Math.min(match.fouls_b, 3) }).map((_, i) => (
                  <div key={i} className="w-6 h-1 bg-zinc-600 rounded-full" />
                ))}
                {match.fouls_b > 3 && Array.from({ length: match.fouls_b - 3 }).map((_, i) => (
                  <div key={`extra-${i}`} className="w-6 h-1 bg-red-500 rounded-full" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botón Gestionar */}
        {match.status !== 'finished' && match.team_a_id && match.team_b_id && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onManage(match);
            }} 
            size="sm"
            variant="outline"
            className="border-accent-brand/50 hover:bg-accent-brand/20 hover:border-accent-brand"
          >
            <Play className="h-4 w-4 mr-2" />
            Gestionar
          </Button>
        )}
      </div>

      {/* MVP Badge */}
      {match.status === 'finished' && (match as any).mvp_name && (
        <div className="mt-2 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-yellow-500 font-semibold">
            MVP: {(match as any).mvp_name}
          </span>
        </div>
      )}
    </div>
  );
}
