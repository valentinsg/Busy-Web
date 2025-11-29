import { PlayerRadarChart } from '@/components/blacktop/player-radar-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServiceClient } from '@/lib/supabase/server';
import type { Player, Team } from '@/types/blacktop';
import { ArrowLeft, Award, ChevronRight, Instagram, Target, TrendingUp, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PlayerProfilePageProps {
  params: {
    id: string;
  };
}

async function getPlayerWithTeam(playerId: number) {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('players')
    .select(`
      *,
      team:teams(*,tournament:tournaments(*))
    `)
    .eq('id', playerId)
    .single();

  if (error) return null;
  return data as Player & { team: Team & { tournament: any } };
}

async function getPlayerStats(playerId: number) {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('player_match_stats')
    .select('*')
    .eq('player_id', playerId);

  if (!data) return null;
  return {
    matches_played: data.length,
    total_points: data.reduce((sum, s) => sum + (s.points || 0), 0),
    total_assists: data.reduce((sum, s) => sum + (s.assists || 0), 0),
    total_rebounds: data.reduce((sum, s) => sum + (s.rebounds || 0), 0),
    total_steals: data.reduce((sum, s) => sum + (s.steals || 0), 0),
    total_blocks: data.reduce((sum, s) => sum + (s.blocks || 0), 0),
    mvp_count: data.filter(s => s.is_mvp).length,
  };
}

async function getPlayerMatches(playerId: number) {
  const supabase = getServiceClient();
  const { data: player } = await supabase
    .from('players')
    .select('team_id')
    .eq('id', playerId)
    .single();

  if (!player) return [];

  const { data } = await supabase
    .from('matches')
    .select(`
      *,
      team_a:team_a_id(id, name),
      team_b:team_b_id(id, name),
      winner:winner_id(id, name)
    `)
    .or(`team_a_id.eq.${player.team_id},team_b_id.eq.${player.team_id}`)
    .order('scheduled_time', { ascending: false });

  return data || [];
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const player = await getPlayerWithTeam(parseInt(params.id));

  if (!player || player.team.status !== 'approved') {
    notFound();
  }

  const playerStats = await getPlayerStats(parseInt(params.id)) || {
    matches_played: 0,
    total_points: 0,
    total_assists: 0,
    total_rebounds: 0,
    total_steals: 0,
    total_blocks: 0,
    mvp_count: 0,
  };

  const matches = await getPlayerMatches(parseInt(params.id));

  return (
    <div className="min-h-screen bg-black text-white font-body">
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
        {/* Botón volver y Breadcrumb */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/blacktop/equipos/${player.team.id}`}>
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <nav className="flex items-center gap-2 text-sm text-white/60">
            <Link href={`/blacktop/${player.team.tournament?.slug || ''}`} className="hover:text-white">
              {player.team.tournament?.name || 'Torneo'}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/blacktop/equipos/${player.team.id}`} className="hover:text-white">
              {player.team.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{player.full_name}</span>
          </nav>
        </div>

        {/* Header */}
        <div className="mb-8">

          <div className="flex items-start gap-6">
            {/* Foto del jugador */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
              {player.photo_url ? (
                <Image
                  src={player.photo_url}
                  alt={player.full_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-white/50">
                  {player.full_name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info del jugador */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{player.full_name}</h1>
              <div className="flex items-center gap-4 text-white/70 mb-3">
                <a
                  href={`https://instagram.com/${player.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  @{player.instagram_handle}
                </a>
              </div>
              <Link href={`/blacktop/equipos/${player.team.id}`}>
                <Badge variant="outline" className="hover:bg-white/10 transition-colors">
                  <Trophy className="h-3 w-3 mr-1" />
                  {player.team.name}
                </Badge>
              </Link>
              {player.is_captain && (
                <Badge variant="default" className="ml-2">
                  Capitán
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas de rendimiento */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-3xl font-bold text-white">{playerStats.total_points}</div>
                <div className="text-sm text-white/70 mt-1">Puntos totales</div>
                <div className="text-xs text-white/50 mt-1">
                  {(playerStats.matches_played > 0 ? (playerStats.total_points / playerStats.matches_played).toFixed(1) : '0.0')} por partido
                </div>
              </div>

              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-3xl font-bold text-white">{playerStats.total_assists}</div>
                <div className="text-sm text-white/70 mt-1">Asistencias totales</div>
                <div className="text-xs text-white/50 mt-1">
                  {(playerStats.matches_played > 0 ? (playerStats.total_assists / playerStats.matches_played).toFixed(1) : '0.0')} por partido
                </div>
              </div>

              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-3xl font-bold text-white">{playerStats.total_rebounds}</div>
                <div className="text-sm text-white/70 mt-1">Rebotes totales</div>
                <div className="text-xs text-white/50 mt-1">
                  {(playerStats.matches_played > 0 ? (playerStats.total_rebounds / playerStats.matches_played).toFixed(1) : '0.0')} por partido
                </div>
              </div>

              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-3xl font-bold text-white">{playerStats.total_steals}</div>
                <div className="text-sm text-white/70 mt-1">Robos totales</div>
                <div className="text-xs text-white/50 mt-1">
                  {(playerStats.matches_played > 0 ? (playerStats.total_steals / playerStats.matches_played).toFixed(1) : '0.0')} por partido
                </div>
              </div>

              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-3xl font-bold text-white">{playerStats.total_blocks}</div>
                <div className="text-sm text-white/70 mt-1">Tapones totales</div>
                <div className="text-xs text-white/50 mt-1">
                  {(playerStats.matches_played > 0 ? (playerStats.total_blocks / playerStats.matches_played).toFixed(1) : '0.0')} por partido
                </div>
              </div>

              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-3xl font-bold text-white">{playerStats.matches_played}</div>
                <div className="text-sm text-white/70 mt-1">Partidos jugados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premios e insignias */}
        {(playerStats.mvp_count > 0 || player.team.tournament) && (
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Premios e insignias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {playerStats.mvp_count > 0 && (
                  <Badge variant="outline" className="border-yellow-500/40 text-yellow-400 bg-black/40">
                    <Trophy className="h-3 w-3 mr-1" />
                    {playerStats.mvp_count} MVPs ganados
                  </Badge>
                )}

                {player.team.tournament && (
                  <Badge variant="outline" className="border-white/20 bg-black/40 text-white/80">
                    Busy Blacktop: {player.team.tournament.name}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráfico Radar - Perfil PES 2006 Style */}
        <PlayerRadarChart
          stats={{
            points: playerStats.total_points / Math.max(1, playerStats.matches_played),
            rebounds: playerStats.total_rebounds / Math.max(1, playerStats.matches_played),
            assists: playerStats.total_assists / Math.max(1, playerStats.matches_played),
            steals: playerStats.total_steals / Math.max(1, playerStats.matches_played),
            blocks: playerStats.total_blocks / Math.max(1, playerStats.matches_played),
          }}
          accentColor="#ef4444"
          playerName={player.full_name}
        />

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
                {matches.map((match: any) => (
                  <div key={match.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-right">
                        <div className="font-semibold">{match.team_a?.name || 'TBD'}</div>
                        {match.team_a_score !== null && (
                          <div className="text-2xl font-bold">{match.team_a_score}</div>
                        )}
                      </div>
                      <div className="text-white/50">VS</div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{match.team_b?.name || 'TBD'}</div>
                        {match.team_b_score !== null && (
                          <div className="text-2xl font-bold">{match.team_b_score}</div>
                        )}
                      </div>
                    </div>
                    {match.scheduled_time && (
                      <div className="text-center mt-2 text-xs text-white/60">
                        {new Date(match.scheduled_time).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    )}
                    {match.winner_id && (
                      <div className="text-center mt-2">
                        <Badge variant="outline" className="text-xs">
                          Ganador: {match.winner?.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
