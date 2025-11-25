import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getTeamById } from '@/lib/repo/blacktop';
import { ArrowLeft, Instagram, Trophy, Target, Users, ChevronRight } from 'lucide-react';
import { getServiceClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { generateBreadcrumbSchema } from '@/lib/structured-data';
import Script from 'next/script';

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

export async function generateMetadata(
  { params }: TeamProfilePageProps
): Promise<Metadata> {
  const id = parseInt(params.id);
  if (Number.isNaN(id)) {
    return {
      title: 'Equipo no encontrado',
      robots: { index: false, follow: false },
      alternates: { canonical: '/blacktop' },
    };
  }

  const team = await getTeamById(id);
  if (!team || team.status !== 'approved') {
    return {
      title: 'Equipo no encontrado',
      robots: { index: false, follow: false },
      alternates: { canonical: '/blacktop' },
    };
  }

  const tournament = await getTournamentByTeam(id);

  const RAW_SITE_URL = process.env.SITE_URL || '';
  const SITE_URL = /^https?:\/\//.test(RAW_SITE_URL) && RAW_SITE_URL ? RAW_SITE_URL : 'https://busy.com.ar';
  const url = `${SITE_URL}/blacktop/equipos/${id}`;
  const image = team.logo_url || '/busy-og-image.png';

  const descriptionParts = [
    `Perfil del equipo ${team.name} en Busy Blacktop`,
    team.captain_name ? `— Capitán: ${team.captain_name}` : undefined,
    tournament?.name ? `— Torneo: ${tournament.name}` : undefined,
    'Estadísticas, plantel, historial y redes.',
  ].filter(Boolean);
  const description = descriptionParts.join(' ');

  const title = `${team.name} | Equipo Busy Blacktop`;

  return {
    ...generateSEO({
      title,
      description,
      image,
      url,
      type: 'website',
    }),
    alternates: { canonical: `/blacktop/equipos/${id}` },
  };
}

export default async function TeamProfilePage({ params }: TeamProfilePageProps) {
  const team = await getTeamById(parseInt(params.id));

  if (!team || team.status !== 'approved') {
    notFound();
  }

  const tournament = await getTournamentByTeam(parseInt(params.id));
  const teamStats = await getTeamStats(parseInt(params.id));
  const matches = await getTeamMatches(parseInt(params.id));

  const accentColor = tournament?.accent_color || '#ef4444';

  return (
    <div className="min-h-screen bg-black text-white font-body">
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-6xl">
        <StructuredData team={team} tournament={tournament} />
        {/* Botón volver */}
        <Link href={`/blacktop/${tournament?.slug || ''}`} className="inline-block mb-6">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al torneo
          </Button>
        </Link>

        {/* Header mejorado */}
        <div className="relative mb-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 overflow-hidden">
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: accentColor }} />

          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Logo del equipo */}
            <div className="relative">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center border-2" style={{ borderColor: `${accentColor}40` }}>
                {team.logo_url ? (
                  <Image
                    src={team.logo_url}
                    alt={team.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-4xl font-bold" style={{ color: accentColor }}>
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {team.group_name && (
                <div
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-black"
                  style={{ backgroundColor: accentColor }}
                >
                  {team.group_name.replace('Grupo ', '')}
                </div>
              )}
            </div>

            {/* Info del equipo */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: accentColor }}>{team.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{team.players?.length || 0} jugadores</span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>Capitán: {team.captain_name}</span>
                </div>
                <div className="w-px h-4 bg-white/20" />
                <a
                  href={`https://instagram.com/${team.captain_instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                  style={{ color: accentColor }}
                >
                  <Instagram className="h-4 w-4" />
                  @{team.captain_instagram.replace('@', '')}
                </a>
              </div>
              {tournament && (
                <p className="text-xs text-white/50">
                  {tournament.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: accentColor }}>{teamStats.matches_played}</div>
              <div className="text-xs text-white/50 uppercase tracking-wide">Partidos</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-500 mb-1">{teamStats.wins}</div>
              <div className="text-xs text-white/50 uppercase tracking-wide">Victorias</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-500 mb-1">{teamStats.losses}</div>
              <div className="text-xs text-white/50 uppercase tracking-wide">Derrotas</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{teamStats.total_points}</div>
              <div className="text-xs text-white/50 uppercase tracking-wide">Pts a favor</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white/70 mb-1">{teamStats.avg_points}</div>
              <div className="text-xs text-white/50 uppercase tracking-wide">Promedio</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl font-bold mb-1 ${(teamStats.differential ?? 0) > 0 ? 'text-green-500' : (teamStats.differential ?? 0) < 0 ? 'text-red-500' : 'text-white/70'}`}>
                {(teamStats.differential ?? 0) > 0 ? '+' : ''}{teamStats.differential ?? 0}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-wide">Diferencial</div>
            </div>
          </div>
        </div>

        {/* Jugadores */}
        <div className="relative mb-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: accentColor }} />

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
              <Users className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Plantel</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {team.players?.map((player) => (
              <Link
                key={player.id}
                href={`/blacktop/jugadores/${player.id}`}
                className="group block"
              >
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.08] transition-all">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate group-hover:text-white transition-colors">{player.full_name}</div>
                    <div className="text-xs text-white/50 truncate">
                      @{player.instagram_handle.replace('@', '')}
                    </div>
                  </div>
                  {player.is_captain && (
                    <div className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                      C
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Historial de partidos */}
        <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: accentColor }} />

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
              <Target className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Historial de partidos</h2>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No hay partidos registrados aún</p>
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
                    className={`p-4 sm:p-5 rounded-xl border transition-all ${
                      match.status === 'finished'
                        ? isWinner
                          ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                          : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/50 uppercase tracking-wide font-medium">
                          {match.round?.replace('_', ' ') || 'Partido'}
                        </span>
                        {match.scheduled_time && (
                          <>
                            <div className="w-1 h-1 rounded-full bg-white/30" />
                            <span className="text-xs text-white/50">
                              {new Date(match.scheduled_time).toLocaleDateString('es-AR', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </>
                        )}
                      </div>
                      {match.status === 'finished' && (
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isWinner ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {isWinner ? 'Victoria' : 'Derrota'}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{team.name}</p>
                      </div>
                      {match.status === 'finished' && (
                        <div className="flex items-center gap-4 px-6">
                          <span className={`text-2xl font-bold tabular-nums ${isWinner ? 'text-green-500' : 'text-white/50'}`}>
                            {teamScore}
                          </span>
                          <span className="text-white/30">-</span>
                          <span className={`text-2xl font-bold tabular-nums ${!isWinner ? 'text-red-500' : 'text-white/50'}`}>
                            {opponentScore}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 text-right">
                        <p className="font-bold truncate">{opponent?.name || 'TBD'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StructuredData({ team, tournament }: { team: any; tournament: any | null }) {
  const RAW_SITE_URL = process.env.SITE_URL || '';
  const SITE_URL = /^https?:\/\//.test(RAW_SITE_URL) && RAW_SITE_URL ? RAW_SITE_URL : 'https://busy.com.ar';

  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Blacktop', url: `${SITE_URL}/blacktop` },
    ...(tournament?.slug ? [{ name: tournament.name, url: `${SITE_URL}/blacktop/${tournament.slug}` }] : []),
    { name: team.name, url: `${SITE_URL}/blacktop/equipos/${team.id}` },
  ]);

  const sportsTeam = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: team.name,
    sport: 'Basketball',
    url: `${SITE_URL}/blacktop/equipos/${team.id}`,
    image: team.logo_url ? [team.logo_url] : [`${SITE_URL}/busy-og-image.png`],
    memberOf: tournament?.name ? {
      '@type': 'SportsOrganization',
      name: 'Busy Blacktop',
      url: `${SITE_URL}/blacktop`,
    } : undefined,
    coach: team.captain_name ? {
      '@type': 'Person',
      name: team.captain_name,
    } : undefined,
    member: Array.isArray(team.players) ? team.players.map((p: any) => ({
      '@type': 'Person',
      name: p.full_name,
      sameAs: p.instagram_handle ? `https://instagram.com/${String(p.instagram_handle).replace('@','')}` : undefined,
    })) : undefined,
  } as any;

  return (
    <>
      <Script id="team-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Script id="team-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsTeam) }} />
    </>
  );
}
