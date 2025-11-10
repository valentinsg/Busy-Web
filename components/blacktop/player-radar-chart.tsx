'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface PlayerRadarChartProps {
  stats: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
  };
  accentColor: string;
  playerName: string;
}

export function PlayerRadarChart({ stats, accentColor, playerName }: PlayerRadarChartProps) {
  // Normalizar stats a escala 0-100 basado en promedios típicos
  const normalizePoints = (pts: number) => Math.min((pts / 20) * 100, 100);
  const normalizeRebounds = (reb: number) => Math.min((reb / 10) * 100, 100);
  const normalizeAssists = (ast: number) => Math.min((ast / 8) * 100, 100);
  const normalizeSteals = (stl: number) => Math.min((stl / 5) * 100, 100);
  const normalizeBlocks = (blk: number) => Math.min((blk / 3) * 100, 100);

  const data = [
    {
      category: 'Puntos',
      value: normalizePoints(stats.points),
      fullMark: 100,
    },
    {
      category: 'Rebotes',
      value: normalizeRebounds(stats.rebounds),
      fullMark: 100,
    },
    {
      category: 'Asistencias',
      value: normalizeAssists(stats.assists),
      fullMark: 100,
    },
    {
      category: 'Robos',
      value: normalizeSteals(stats.steals),
      fullMark: 100,
    },
    {
      category: 'Tapones',
      value: normalizeBlocks(stats.blocks),
      fullMark: 100,
    },
  ];

  return (
    <Card className="bg-white/10 backdrop-blur border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Perfil: {playerName}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
            />
            <Radar
              name={playerName}
              dataKey="value"
              stroke={accentColor}
              fill={accentColor}
              fillOpacity={0.5}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
        <p className="text-xs text-white/60 text-center mt-4">
          Gráfico normalizado basado en promedios por partido
        </p>
      </CardContent>
    </Card>
  );
}
