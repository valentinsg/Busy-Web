'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, TrendingUp, Target, Zap, Shield, AlertCircle } from 'lucide-react';
import type { TournamentLeaderboard, TeamLeaderboard, Team } from '@/types/blacktop';

interface TournamentStatsFilteredProps {
  tournamentId: number;
  teams: Team[];
}

type StatType = 'points' | 'assists' | 'rebounds' | 'steals' | 'blocks' | 'turnovers';

const statIcons: Record<StatType, any> = {
  points: Target,
  assists: Users,
  rebounds: Shield,
  steals: Zap,
  blocks: Shield,
  turnovers: AlertCircle,
};

const statLabels: Record<StatType, string> = {
  points: 'Puntos',
  assists: 'Asistencias',
  rebounds: 'Rebotes',
  steals: 'Robos',
  blocks: 'Tapones',
  turnovers: 'Pérdidas',
};

export function TournamentStatsFiltered({ tournamentId, teams }: TournamentStatsFilteredProps) {
  const [playerStats, setPlayerStats] = useState<TournamentLeaderboard[]>([]);
  const [teamStats, setTeamStats] = useState<TeamLeaderboard[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedStat, setSelectedStat] = useState<StatType>('points');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [tournamentId]);

  const fetchStats = async () => {
    try {
      // Fetch player stats
      const playersRes = await fetch(`/api/blacktop/tournaments/${tournamentId}/leaderboard`);
      if (playersRes.ok) {
        const data = await playersRes.json();
        setPlayerStats(data);
      }

      // Fetch team stats
      const teamsRes = await fetch(`/api/blacktop/tournaments/${tournamentId}/team-leaderboard`);
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeamStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar jugadores por equipo
  const filteredPlayers = selectedTeam === 'all'
    ? playerStats
    : playerStats.filter(p => p.team.id === parseInt(selectedTeam));

  // Ordenar por estadística seleccionada
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const statKey = `total_${selectedStat}` as keyof TournamentLeaderboard;
    return (b[statKey] as number) - (a[statKey] as number);
  });

  const sortedTeams = [...teamStats].sort((a, b) => {
    const statKey = `total_${selectedStat}` as keyof TeamLeaderboard;
    return (b[statKey] as number) - (a[statKey] as number);
  });

  const StatIcon = statIcons[selectedStat];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estadísticas del Torneo
          </CardTitle>
          <CardDescription>
            Filtra y ordena las estadísticas de jugadores y equipos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por equipo */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Filtrar por equipo</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los equipos</SelectItem>
                  {teams.filter(t => t.status === 'approved').map(team => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por estadística */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Ordenar por</Label>
              <Select value={selectedStat} onValueChange={(v) => setSelectedStat(v as StatType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Jugadores / Equipos */}
      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="players">
            <Users className="h-4 w-4 mr-2" />
            Jugadores
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Trophy className="h-4 w-4 mr-2" />
            Equipos
          </TabsTrigger>
        </TabsList>

        {/* Jugadores */}
        <TabsContent value="players">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatIcon className="h-5 w-5" />
                Mejores en {statLabels[selectedStat]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando...</div>
              ) : sortedPlayers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay estadísticas disponibles
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedPlayers.map((player, index) => {
                    const statValue = player[`total_${selectedStat}` as keyof TournamentLeaderboard] as number;
                    if (statValue === 0) return null;

                    return (
                      <div
                        key={player.player.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{player.player.full_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {player.team.name}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-lg px-4 py-1">
                          {statValue}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipos */}
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatIcon className="h-5 w-5" />
                Equipos - {statLabels[selectedStat]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando...</div>
              ) : sortedTeams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay estadísticas de equipos disponibles
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedTeams.map((teamStat, index) => {
                    const statValue = teamStat[`total_${selectedStat}` as keyof TeamLeaderboard] as number;
                    if (statValue === 0) return null;

                    return (
                      <div
                        key={teamStat.team.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{teamStat.team.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {teamStat.games_played} partidos jugados
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-lg px-4 py-1">
                          {statValue}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
