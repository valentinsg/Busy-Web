'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TournamentLeaderboard } from '@/types/blacktop';
import { Bar, BarChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface PlayerStatsChartProps {
  leaderboard: TournamentLeaderboard[];
  accentColor: string;
}

export function PlayerStatsChart({ leaderboard, accentColor }: PlayerStatsChartProps) {
  // Top 5 jugadores por puntos
  const topScorers = [...leaderboard]
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 5)
    .map(p => ({
      name: p.player.full_name.split(' ')[0], // Solo primer nombre
      PTS: p.total_points,
      REB: p.total_rebounds,
      AST: p.total_assists,
    }));

  // Datos para radar chart del top scorer
  const topPlayer = leaderboard.sort((a, b) => b.total_points - a.total_points)[0];
  const radarData = topPlayer ? [
    { stat: 'Puntos', value: topPlayer.total_points, fullMark: Math.max(...leaderboard.map(p => p.total_points)) },
    { stat: 'Rebotes', value: topPlayer.total_rebounds, fullMark: Math.max(...leaderboard.map(p => p.total_rebounds)) },
    { stat: 'Asistencias', value: topPlayer.total_assists, fullMark: Math.max(...leaderboard.map(p => p.total_assists)) },
    { stat: 'Robos', value: topPlayer.total_steals, fullMark: Math.max(...leaderboard.map(p => p.total_steals)) },
    { stat: 'Tapones', value: topPlayer.total_blocks, fullMark: Math.max(...leaderboard.map(p => p.total_blocks)) },
  ] : [];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: unknown }) => {
    const items = Array.isArray(payload) ? payload : [];

    if (active && items.length > 0) {
      const first = items[0] as { payload?: { name?: string } };
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3">
          <p className="font-bold text-white mb-1">{first.payload?.name}</p>
          {items.map((entry, index: number) => {
            const e = entry as { name?: string; value?: number; color?: string };
            return (
              <p key={index} className="text-sm" style={{ color: e.color }}>
                {e.name}: {e.value}
            </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Bar Chart - Top 5 Scorers */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Top 5 Anotadores</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topScorers}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.6)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.6)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: 'white', fontSize: '12px' }}
              />
              <Bar dataKey="PTS" fill={accentColor} radius={[8, 8, 0, 0]} />
              <Bar dataKey="REB" fill={`${accentColor}80`} radius={[8, 8, 0, 0]} />
              <Bar dataKey="AST" fill={`${accentColor}60`} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar Chart - Top Player */}
      {topPlayer && (
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Perfil: {topPlayer.player.full_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis
                  dataKey="stat"
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <PolarRadiusAxis
                  stroke="rgba(255,255,255,0.3)"
                  style={{ fontSize: '10px' }}
                />
                <Radar
                  name={topPlayer.player.full_name}
                  dataKey="value"
                  stroke={accentColor}
                  fill={accentColor}
                  fillOpacity={0.6}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
