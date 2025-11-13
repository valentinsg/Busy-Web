'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react';
import type { Tournament, TeamWithPlayers, MatchWithTeams, TournamentLeaderboard } from '@/types/blacktop';
import Link from 'next/link';
import { TournamentEmptyState } from './tournament-empty-state';

interface TournamentDashboardProps {
  tournament: Tournament;
  teams: TeamWithPlayers[];
  matches: MatchWithTeams[];
  leaderboard: TournamentLeaderboard[];
  accentColor: string;
  showPrizes?: boolean;
}

export function TournamentDashboard({ 
  tournament, 
  teams, 
  matches, 
  leaderboard,
  accentColor,
  showPrizes = false
}: TournamentDashboardProps) {
  // Calcular estadísticas
  const completedMatches = matches.filter(m => m.status === 'finished').length;
  const totalPlayers = teams.reduce((acc, team) => acc + (team.players?.length || 0), 0);
  
  // Top 3 jugadores por puntos
  const topScorers = [...leaderboard]
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 3);

  // Top 2 equipos por zona (standings)
  const teamsByGroup = teams.reduce((acc, team) => {
    if (team.group_name) {
      if (!acc[team.group_name]) acc[team.group_name] = [];
      acc[team.group_name].push(team);
    }
    return acc;
  }, {} as Record<string, typeof teams>);

  // Ordenar equipos por posición en cada grupo y tomar top 2
  const topTeamsByGroup = Object.entries(teamsByGroup).map(([groupName, groupTeams]) => ({
    groupName,
    teams: groupTeams
      .sort((a, b) => (a.group_position || 999) - (b.group_position || 999))
      .slice(0, 2)
  }));

  // Próximos partidos
  const upcomingMatches = matches
    .filter(m => m.status === 'pending' && m.scheduled_time)
    .sort((a, b) => new Date(a.scheduled_time!).getTime() - new Date(b.scheduled_time!).getTime())
    .slice(0, 3);

  // Últimos resultados
  const recentResults = matches
    .filter(m => m.status === 'finished' && m.winner_id)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  // Si no hay equipos ni jugadores, mostrar estado vacío
  if (teams.length === 0 && totalPlayers === 0) {
    return <TournamentEmptyState tournament={tournament} />;
  }

  return (
    <div className="space-y-6 font-body">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all group">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg transition-all group-hover:scale-110" style={{ backgroundColor: `${accentColor}15` }}>
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{teams.length}</p>
              </div>
              <p className="text-xs sm:text-sm text-white/50 font-medium">Equipos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all group">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg transition-all group-hover:scale-110" style={{ backgroundColor: `${accentColor}15` }}>
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{totalPlayers}</p>
              </div>
              <p className="text-xs sm:text-sm text-white/50 font-medium">Jugadores</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all group">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg transition-all group-hover:scale-110" style={{ backgroundColor: `${accentColor}15` }}>
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{completedMatches}<span className="text-lg text-white/40">/{matches.length}</span></p>
              </div>
              <p className="text-xs sm:text-sm text-white/50 font-medium">Partidos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all group">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg transition-all group-hover:scale-110" style={{ backgroundColor: `${accentColor}15` }}>
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
                </div>
                <p className="text-base sm:text-lg font-bold truncate">{tournament.format_type === 'groups_playoff' ? 'Grupos + Playoff' : 'Eliminación'}</p>
              </div>
              <p className="text-xs sm:text-sm text-white/50 font-medium">Formato</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Scorers */}
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}15` }}>
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Top Anotadores</h3>
                <p className="text-xs text-white/50">Líderes en puntos</p>
              </div>
            </div>
            <div className="space-y-2">
              {topScorers.length > 0 ? (
                topScorers.map((player, idx) => (
                  <Link 
                    key={player.player.id}
                    href={`/blacktop/jugadores/${player.player.id}`}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all group-hover:scale-110"
                        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{player.player.full_name}</p>
                        <p className="text-xs sm:text-sm text-white/50">{player.team.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold" style={{ color: accentColor }}>
                        {player.total_points}
                      </p>
                      <p className="text-[10px] sm:text-xs text-white/50 font-medium">PTS</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-white/40 py-8 text-sm">Sin estadísticas aún</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}15` }}>
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Últimos Resultados</h3>
                <p className="text-xs text-white/50">Partidos finalizados</p>
              </div>
            </div>
            <div className="space-y-2">
              {recentResults.length > 0 ? (
                recentResults.map((match) => (
                  <div key={match.id} className="p-3 sm:p-4 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-white/50 font-medium uppercase tracking-wide">{match.round?.replace('_', ' ') || 'Partido'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm sm:text-base truncate ${match.winner_id === match.team_a_id ? 'text-white' : 'text-white/50'}`}>
                          {match.team_a?.name || 'TBD'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4">
                        <span className="text-lg sm:text-xl font-bold tabular-nums" style={{ color: match.winner_id === match.team_a_id ? accentColor : 'rgba(255,255,255,0.5)' }}>
                          {match.team_a_score}
                        </span>
                        <span className="text-white/30 text-sm">-</span>
                        <span className="text-lg sm:text-xl font-bold tabular-nums" style={{ color: match.winner_id === match.team_b_id ? accentColor : 'rgba(255,255,255,0.5)' }}>
                          {match.team_b_score}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className={`font-semibold text-sm sm:text-base truncate ${match.winner_id === match.team_b_id ? 'text-white' : 'text-white/50'}`}>
                          {match.team_b?.name || 'TBD'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-white/40 py-8 text-sm">Sin resultados aún</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Standings - Top 2 por zona */}
        {topTeamsByGroup.length > 0 && (
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}15` }}>
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">Clasificados</h3>
                  <p className="text-xs text-white/50">Top 2 por zona</p>
                </div>
              </div>
              <div className="space-y-4">
                {topTeamsByGroup.map(({ groupName, teams: groupTeams }) => (
                  <div key={groupName}>
                    <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-2">{groupName}</p>
                    <div className="space-y-2">
                      {groupTeams.map((team, idx) => (
                        <div key={team.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                          >
                            {idx + 1}
                          </div>
                          <p className="text-sm font-semibold flex-1 truncate">{team.name}</p>
                          {team.group_position && (
                            <span className="text-xs text-white/50">{team.group_position}°</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}15` }}>
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Próximos Partidos</h3>
                <p className="text-xs text-white/50">Calendario de encuentros</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {upcomingMatches.map((match) => (
                <div key={match.id} className="p-4 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                  <div className="text-center mb-3">
                    <p className="text-[10px] sm:text-xs text-white/50 mb-1.5 uppercase tracking-wide font-medium">{match.round?.replace('_', ' ') || 'Partido'}</p>
                    <p className="text-xs sm:text-sm font-semibold" style={{ color: accentColor }}>
                      {new Date(match.scheduled_time!).toLocaleDateString('es-AR', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-center font-semibold text-sm">{match.team_a?.name || 'TBD'}</p>
                    <p className="text-center text-white/30 text-xs font-bold">VS</p>
                    <p className="text-center font-semibold text-sm">{match.team_b?.name || 'TBD'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
