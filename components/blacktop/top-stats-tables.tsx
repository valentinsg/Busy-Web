'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Users, Shield, Hand } from 'lucide-react';
import Link from 'next/link';
import type { TournamentLeaderboard } from '@/types/blacktop';

interface TopStatsTablesProps {
  leaderboard: TournamentLeaderboard[];
  accentColor: string;
}

export function TopStatsTables({ leaderboard, accentColor }: TopStatsTablesProps) {
  // Top 5 por categoría
  const topScorers = [...leaderboard]
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 5);

  const topRebounders = [...leaderboard]
    .sort((a, b) => b.total_rebounds - a.total_rebounds)
    .slice(0, 5);

  const topAssists = [...leaderboard]
    .sort((a, b) => b.total_assists - a.total_assists)
    .slice(0, 5);

  const topSteals = [...leaderboard]
    .sort((a, b) => b.total_steals - a.total_steals)
    .slice(0, 5);

  const topBlocks = [...leaderboard]
    .sort((a, b) => b.total_blocks - a.total_blocks)
    .slice(0, 5);

  const StatTable = ({ 
    title, 
    icon: Icon, 
    data, 
    statKey, 
    statLabel 
  }: { 
    title: string; 
    icon: any; 
    data: TournamentLeaderboard[]; 
    statKey: 'total_points' | 'total_rebounds' | 'total_assists' | 'total_steals' | 'total_blocks';
    statLabel: string;
  }) => (
    <Card className="bg-white/10 backdrop-blur border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Icon className="h-5 w-5" style={{ color: accentColor }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-white/50 text-center py-4">No hay datos disponibles</p>
        ) : (
          <div className="space-y-2">
            {data.map((player, idx) => (
              <Link
                key={player.player.id}
                href={`/blacktop/jugadores/${player.player.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ 
                      backgroundColor: `${accentColor}${idx === 0 ? 'FF' : idx === 1 ? 'CC' : idx === 2 ? '99' : '66'}`,
                      color: 'white'
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-white">{player.player.full_name}</p>
                    <p className="text-xs text-white/60">{player.team.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: accentColor }}>
                    {player[statKey]}
                  </p>
                  <p className="text-xs text-white/60">{statLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatTable
        title="Top 5 Anotadores"
        icon={Trophy}
        data={topScorers}
        statKey="total_points"
        statLabel="PTS"
      />
      <StatTable
        title="Top 5 Reboteadores"
        icon={Target}
        data={topRebounders}
        statKey="total_rebounds"
        statLabel="REB"
      />
      <StatTable
        title="Top 5 Asistidores"
        icon={Users}
        data={topAssists}
        statKey="total_assists"
        statLabel="AST"
      />
      <StatTable
        title="Top 5 Robos"
        icon={Hand}
        data={topSteals}
        statKey="total_steals"
        statLabel="ROB"
      />
      <StatTable
        title="Top 5 Tapones"
        icon={Shield}
        data={topBlocks}
        statKey="total_blocks"
        statLabel="TAP"
      />
    </div>
  );
}
