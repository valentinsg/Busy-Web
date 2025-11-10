import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTeamById } from '@/lib/repo/blacktop';
import { ArrowLeft, Instagram, Trophy, Target, Users, ChevronRight } from 'lucide-react';
import { getServiceClient } from '@/lib/supabase/server';

interface TeamProfilePageProps {
  params: {
    id: string;
  };
}

async function getTournamentByTeam(teamId: number) {
  const supabase = getServiceClient();
  const { data: team } = await supabase
    .from('teams')
    .select('tournament_id')
    .eq('id', teamId)
    .single();

  if (!team) return null;

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', team.tournament_id)
    .single();

  return tournament;
}

async function getTeamStats(teamId: number) {
  const supabase = getServiceClient();
  
  // Get all matches where team participated
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
    .eq('status', 'completed');

  if (!matches) return { matches_played: 0, wins: 0, losses: 0, total_points: 0, points_against: 0 };

  let wins = 0;
  let losses = 0;
  let total_points = 0;
  let points_against = 0;

  matches.forEach(match => {
    if (match.team_a_id === teamId) {
      total_points += match.team_a_score || 0;
      points_against += match.team_b_score || 0;
      if (match.winner_id === teamId) wins++;
      else if (match.winner_id) losses++;
    } else if (match.team_b_id === teamId) {
      total_points += match.team_b_score || 0;
      points_against += match.team_a_score || 0;
      if (match.winner_id === teamId) wins++;
      else if (match.winner_id) losses++;
    }
  });

  return {
    matches_played: matches.length,
    wins,
    losses,
    total_points,
    points_against,
    avg_points: matches.length > 0 ? Math.round(total_points / matches.length) : 0,
    differential: total_points - points_against
  };
}

async function getTeamMatches(teamId: number) {
  const supabase = getServiceClient();
  
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:teams!matches_team_a_id_fkey(id, name, logo_url),
      team_b:teams!matches_team_b_id_fkey(id, name, logo_url),
      winner:teams!matches_winner_id_fkey(id, name)
    `)
    .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
    .order('scheduled_time', { ascending: false });

  return matches || [];
}

export default async function TeamProfilePage({ params }: TeamProfilePageProps) {
  const team = await getTeamById(parseInt(params.id));

  if (!team || team.status !== 'approved') {
    notFound();
  }

  const tournament = await getTournamentByTeam(parseInt(params.id));
  const teamStats = await getTeamStats(parseInt(params.id));
  const matches = await getTeamMatches(parseInt(params.id));

  return (
    <div className="min-h-screen bg-black text-white font-body">
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
        {/* Botón volver y Breadcrumb */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Link href={`/blacktop/${tournament?.slug || ''}`}>
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <nav className="flex items-center gap-2 text-sm text-white/60">
            <Link href={`/blacktop/${tournament?.slug || ''}`} className="hover:text-white">
              {tournament?.name || 'Torneo'}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{team.name}</span>
          </nav>
        </div>

        {/* Header */}
        <div className="mb-8">

          <div className="flex items-start gap-6">
            {/* Logo del equipo */}
            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
              {team.logo_url ? (
                <Image
                  src={team.logo_url}
                  alt={team.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <Trophy className="h-16 w-16 text-white/50" />
              )}
            </div>

            {/* Info del equipo */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
              <div className="flex items-center gap-4 text-white/70">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{team.players?.length || 0} jugadores</span>
                </div>
                <a
                  href={`https://instagram.com/${team.captain_instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  @{team.captain_instagram}
                </a>
              </div>
              <Badge variant="outline" className="mt-3">
                Capitán: {team.captain_name}
              </Badge>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: tournament?.accent_color || '#ef4444' }}>{teamStats.matches_played}</div>
                <div className="text-sm text-white/70 mt-1">Partidos</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">{teamStats.wins}</div>
                <div className="text-sm text-white/70 mt-1">Victorias</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{teamStats.losses}</div>
                <div className="text-sm text-white/70 mt-1">Derrotas</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{teamStats.total_points}</div>
                <div className="text-sm text-white/70 mt-1">Puntos a favor</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white/70">{teamStats.avg_points}</div>
                <div className="text-sm text-white/70 mt-1">Promedio</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${(teamStats.differential ?? 0) > 0 ? 'text-green-500' : (teamStats.differential ?? 0) < 0 ? 'text-red-500' : 'text-white/70'}`}>
                  {(teamStats.differential ?? 0) > 0 ? '+' : ''}{teamStats.differential ?? 0}
                </div>
                <div className="text-sm text-white/70 mt-1">Diferencial</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jugadores */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Plantel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.players?.map((player) => (
                <Link
                  key={player.id}
                  href={`/blacktop/jugadores/${player.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                      {player.photo_url ? (
                        <Image
                          src={player.photo_url}
                          alt={player.full_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-white/50">
                          {player.full_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{player.full_name}</div>
                      <div className="text-sm text-white/70 truncate">
                        @{player.instagram_handle}
                      </div>
                      {player.is_captain && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Capitán
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Historial de partidos */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Historial de partidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                No hay partidos registrados aún
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match: any) => {
                  const isTeamA = match.team_a_id === team.id;
                  const isWinner = match.winner_id === team.id;
                  const opponent = isTeamA ? match.team_b : match.team_a;
                  const teamScore = isTeamA ? match.team_a_score : match.team_b_score;
                  const opponentScore = isTeamA ? match.team_b_score : match.team_a_score;

                  return (
                    <div
                      key={match.id}
                      className={`p-4 rounded-lg border ${
                        match.status === 'completed'
                          ? isWinner
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-sm text-white/60">
                            {match.round.replace('_', ' ').toUpperCase()}
                          </div>
                          {match.scheduled_time && (
                            <div className="text-sm text-white/60">
                              {new Date(match.scheduled_time).toLocaleDateString('es-AR', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </div>
                          )}
                        </div>
                        {match.status === 'completed' && (
                          <Badge variant={isWinner ? 'default' : 'destructive'}>
                            {isWinner ? 'Victoria' : 'Derrota'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{team.name}</span>
                        </div>
                        {match.status === 'completed' && (
                          <div className="flex items-center gap-3 text-2xl font-bold">
                            <span className={isWinner ? 'text-green-500' : 'text-white/70'}>
                              {teamScore}
                            </span>
                            <span className="text-white/40">-</span>
                            <span className={!isWinner ? 'text-red-500' : 'text-white/70'}>
                              {opponentScore}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{opponent?.name || 'TBD'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
