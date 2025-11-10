'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react';
import type { Tournament, TeamWithPlayers, MatchWithTeams, TournamentLeaderboard } from '@/types/blacktop';
import Link from 'next/link';

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
  const completedMatches = matches.filter(m => m.status === 'completed').length;
  const totalPlayers = teams.reduce((acc, team) => acc + (team.players?.length || 0), 0);
  
  // Top 3 jugadores por puntos
  const topScorers = [...leaderboard]
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 3);

  // Próximos partidos
  const upcomingMatches = matches
    .filter(m => m.status === 'scheduled' && m.scheduled_time)
    .sort((a, b) => new Date(a.scheduled_time!).getTime() - new Date(b.scheduled_time!).getTime())
    .slice(0, 3);

  // Últimos resultados
  const recentResults = matches
    .filter(m => m.status === 'completed' && m.winner_id)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8 font-body">
      {/* Premios */}
      {showPrizes && tournament.prizes_description && (
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: accentColor }}>
              <Trophy className="h-6 w-6" />
              Premios
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-white/90 whitespace-pre-line">{tournament.prizes_description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
                <Users className="h-6 w-6" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{teams.length}</p>
                <p className="text-sm text-white/60">Equipos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
                <Users className="h-6 w-6" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPlayers}</p>
                <p className="text-sm text-white/60">Jugadores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
                <Calendar className="h-6 w-6" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedMatches}/{matches.length}</p>
                <p className="text-sm text-white/60">Partidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
                <Trophy className="h-6 w-6" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{tournament.format_type === 'groups_playoff' ? 'Grupos + Playoff' : 'Eliminación'}</p>
                <p className="text-sm text-white/60">Formato</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Scorers */}
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5" style={{ color: accentColor }} />
              <h3 className="text-xl font-bold">Top Anotadores</h3>
            </div>
            <div className="space-y-3">
              {topScorers.length > 0 ? (
                topScorers.map((player, idx) => (
                  <Link 
                    key={player.player.id}
                    href={`/blacktop/jugadores/${player.player.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                        style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium">{player.player.full_name}</p>
                        <p className="text-sm text-white/60">{player.team.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: accentColor }}>
                        {player.total_points}
                      </p>
                      <p className="text-xs text-white/60">PTS</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-white/50 py-4">Sin estadísticas aún</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5" style={{ color: accentColor }} />
              <h3 className="text-xl font-bold">Últimos Resultados</h3>
            </div>
            <div className="space-y-3">
              {recentResults.length > 0 ? (
                recentResults.map((match) => (
                  <div key={match.id} className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/60">{match.round.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`font-medium ${match.winner_id === match.team_a_id ? 'text-white' : 'text-white/60'}`}>
                          {match.team_a?.name || 'TBD'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 px-4">
                        <span className="text-xl font-bold" style={{ color: match.winner_id === match.team_a_id ? accentColor : 'inherit' }}>
                          {match.team_a_score}
                        </span>
                        <span className="text-white/40">-</span>
                        <span className="text-xl font-bold" style={{ color: match.winner_id === match.team_b_id ? accentColor : 'inherit' }}>
                          {match.team_b_score}
                        </span>
                      </div>
                      <div className="flex-1 text-right">
                        <p className={`font-medium ${match.winner_id === match.team_b_id ? 'text-white' : 'text-white/60'}`}>
                          {match.team_b?.name || 'TBD'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-white/50 py-4">Sin resultados aún</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5" style={{ color: accentColor }} />
              <h3 className="text-xl font-bold">Próximos Partidos</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {upcomingMatches.map((match) => (
                <div key={match.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-center mb-3">
                    <p className="text-xs text-white/60 mb-1">{match.round.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-sm font-medium" style={{ color: accentColor }}>
                      {new Date(match.scheduled_time!).toLocaleDateString('es-AR', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-center font-medium">{match.team_a?.name || 'TBD'}</p>
                    <p className="text-center text-white/40 text-sm">VS</p>
                    <p className="text-center font-medium">{match.team_b?.name || 'TBD'}</p>
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
