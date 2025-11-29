'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { MatchWithTeams, TeamWithPlayers } from '@/types/blacktop';
import { Calendar, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

interface TournamentFixtureEnhancedProps {
  matches: MatchWithTeams[];
  teams: TeamWithPlayers[];
  accentColor: string;
}

interface StandingsRow {
  team: TeamWithPlayers;
  wins: number;
  losses: number;
  pct: number;
  pf: number; // points for
  pa: number; // points against
  diff: number;
}

const ROUND_LABELS: Record<string, string> = {
  group_a: 'Grupo A',
  group_b: 'Grupo B',
  semifinal: 'Semifinales',
  third_place: 'Tercer puesto',
  final: 'Final',
};

export function TournamentFixtureEnhanced({ matches, teams, accentColor }: TournamentFixtureEnhancedProps) {
  const [view, setView] = useState<'schedule' | 'standings' | 'bracket'>('schedule');

  // Calcular standings por grupo
  const standings = useMemo(() => {
    // Inferir pertenencia a grupo desde:
    // - phase === 'groups' + group_id
    // - team.group_name en listado de equipos
    const inferredGroup = new Map<number, string>();

    matches.forEach(m => {
      if (m.phase === 'groups') {
        const groupKey = m.group_id || null;
        if (!groupKey) return;
        if (m.team_a_id) inferredGroup.set(m.team_a_id, groupKey);
        if (m.team_b_id) inferredGroup.set(m.team_b_id, groupKey);
      }
    });

    teams.forEach(t => {
      if (t.group_name) {
        inferredGroup.set(t.id, t.group_name);
      }
    });

    // Solo usar partidos de fase de grupos finalizados
    const groupMatches = matches.filter(
      m => m.phase === 'groups' && m.status === 'finished'
    );

    const teamStats = new Map<number, StandingsRow>();

    // Inicializar stats
    teams.forEach(team => {
      teamStats.set(team.id, {
        team,
        wins: 0,
        losses: 0,
        pct: 0,
        pf: 0,
        pa: 0,
        diff: 0,
      });
    });

    // Calcular stats
    groupMatches.forEach(match => {
      if (!match.team_a_id || !match.team_b_id || match.team_a_score === null || match.team_b_score === null) return;

      const teamAStats = teamStats.get(match.team_a_id);
      const teamBStats = teamStats.get(match.team_b_id);

      if (teamAStats && teamBStats) {
        teamAStats.pf += match.team_a_score ?? 0;
        teamAStats.pa += match.team_b_score ?? 0;
        teamBStats.pf += match.team_b_score ?? 0;
        teamBStats.pa += match.team_a_score ?? 0;

        if (match.winner_id === match.team_a_id) {
          teamAStats.wins++;
          teamBStats.losses++;
        } else if (match.winner_id === match.team_b_id) {
          teamBStats.wins++;
          teamAStats.losses++;
        }
      }
    });

    // Calcular porcentajes y diferencial
    teamStats.forEach(stats => {
      const totalGames = stats.wins + stats.losses;
      stats.pct = totalGames > 0 ? stats.wins / totalGames : 0;
      stats.diff = stats.pf - stats.pa;
    });

    // Agrupar dinámicamente por grupo
    const groupsMap = new Map<string, StandingsRow[]>();

    Array.from(teamStats.values()).forEach(row => {
      const rawKey = row.team.group_name || inferredGroup.get(row.team.id) || '';
      if (!rawKey) return;

      const key = rawKey.toString();
      if (!groupsMap.has(key)) groupsMap.set(key, []);
      groupsMap.get(key)!.push(row);
    });

    const groups = Array.from(groupsMap.entries()).map(([key, rows]) => {
      const normalizedKey = key.toUpperCase();
      const label = /^[A-Z]$/.test(normalizedKey)
        ? `Grupo ${normalizedKey}`
        : key;

      const sortedRows = [...rows].sort((a, b) => b.pct - a.pct || b.diff - a.diff);

      return {
        key: normalizedKey,
        label,
        rows: sortedRows,
      };
    }).sort((a, b) => a.key.localeCompare(b.key));

    // Tabla general (fallback si no hay grupos asignados)
    const overall = Array.from(teamStats.values()).sort(
      (a, b) => b.pct - a.pct || b.diff - a.diff
    );

    const hasGroups = groups.length > 0;
    return { groups, overall, hasGroups };
  }, [matches, teams]);

  // Agrupar partidos
  const groupedMatches = useMemo(() => {
    const teamById = new Map(teams.map(t => [t.id, t] as const));

    const inRound = (m: MatchWithTeams, key: string) => {
      if (m.round === key) return true;
      // Grupos: aceptar phase/groups y decidir por group_id o group_name
      if (key === 'group_a' && m.phase === 'groups') {
        const ga = m.team_a_id ? teamById.get(m.team_a_id)?.group_name : undefined;
        const gb = m.team_b_id ? teamById.get(m.team_b_id)?.group_name : undefined;
        return m.group_id === 'group_a' || m.group_id?.toLowerCase().includes('group_a') || ga === 'A' || gb === 'A';
      }
      if (key === 'group_b' && m.phase === 'groups') {
        const ga = m.team_a_id ? teamById.get(m.team_a_id)?.group_name : undefined;
        const gb = m.team_b_id ? teamById.get(m.team_b_id)?.group_name : undefined;
        return m.group_id === 'group_b' || m.group_id?.toLowerCase().includes('group_b') || ga === 'B' || gb === 'B';
      }
      // Playoffs: phase puede ser 'semifinals', 'final', 'third_place'
      if (key === 'semifinal') return m.phase === 'semifinals';
      if (key === 'final') return m.phase === 'final';
      if (key === 'third_place') return m.phase === 'third_place';
      return false;
    };

    return Object.entries(ROUND_LABELS)
      .map(([key, label]) => ({
        key,
        label,
        matches: matches.filter(m => inRound(m, key)),
      }))
      .filter(r => r.matches.length > 0);
  }, [matches, teams]);

  // Partidos de playoff
  const playoffMatches = useMemo(() => {
    return matches.filter(m =>
      ['semifinal', 'final', 'third_place'].includes(m.round as any) ||
      ['semifinals', 'final', 'third_place'].includes(m.phase as any)
    );
  }, [matches]);

  const renderTeamLogo = (team: TeamWithPlayers | undefined) => {
    if (!team) return null;

    if (team.logo_url) {
      return (
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10">
          <Image
            src={team.logo_url}
            alt={team.name}
            fill
            className="object-cover"
          />
        </div>
      );
    }

    // Template logo
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
        style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
      >
        {team.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-body">
      {/* View Selector */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg bg-white/10 p-1">
          <button
            onClick={() => setView('schedule')}
            className={`px-6 py-2 rounded-md transition-colors ${
              view === 'schedule' ? 'bg-white/20 font-bold' : 'hover:bg-white/5'
            }`}
          >
            Calendario
          </button>
          <button
            onClick={() => setView('standings')}
            className={`px-6 py-2 rounded-md transition-colors ${
              view === 'standings' ? 'bg-white/20 font-bold' : 'hover:bg-white/5'
            }`}
          >
            Posiciones
          </button>
          <button
            onClick={() => setView('bracket')}
            className={`px-6 py-2 rounded-md transition-colors ${
              view === 'bracket' ? 'bg-white/20 font-bold' : 'hover:bg-white/5'
            }`}
          >
            Playoffs
          </button>
        </div>
      </div>

      {/* Schedule View */}
      {view === 'schedule' && (
        <div className="space-y-6">
          {groupedMatches.length === 0 && (
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-12 text-center space-y-2">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-60" />
                <p className="text-xl font-semibold">Calendario próximamente</p>
                <p className="text-white/70">Todavía no hay partidos programados. Publicaremos el fixture cuando cerremos inscripciones y confirmemos equipos.</p>
              </CardContent>
            </Card>
          )}
          {groupedMatches.map((round) => (
            <Card key={round.key} className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: accentColor }}>
                  {round.label}
                </h3>
                <div className="space-y-3">
                  {round.matches.map((match) => (
                    <div
                      key={match.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Team A */}
                        <div className="flex items-center gap-3 flex-1">
                          {renderTeamLogo(match.team_a)}
                          <div className="flex-1">
                            <p className={`font-medium ${match.winner_id === match.team_a_id ? 'text-white' : 'text-white/70'}`}>
                              {match.team_a?.name || 'TBD'}
                            </p>
                          </div>
                          {match.team_a_score !== null && (
                            <span
                              className="text-2xl font-bold min-w-[3rem] text-right"
                              style={{ color: match.winner_id === match.team_a_id ? accentColor : 'inherit' }}
                            >
                              {match.team_a_score}
                            </span>
                          )}
                        </div>

                        {/* Separator */}
                        <div className="text-white/40 font-bold px-2">VS</div>

                        {/* Team B */}
                        <div className="flex items-center gap-3 flex-1 flex-row-reverse">
                          {renderTeamLogo(match.team_b)}
                          <div className="flex-1 text-right">
                            <p className={`font-medium ${match.winner_id === match.team_b_id ? 'text-white' : 'text-white/70'}`}>
                              {match.team_b?.name || 'TBD'}
                            </p>
                          </div>
                          {match.team_b_score !== null && (
                            <span
                              className="text-2xl font-bold min-w-[3rem] text-left"
                              style={{ color: match.winner_id === match.team_b_id ? accentColor : 'inherit' }}
                            >
                              {match.team_b_score}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Match Info */}
                      <div className="flex items-center justify-center gap-4 mt-3 text-sm text-white/60">
                        {match.scheduled_time && (
                          <span>
                            {new Date(match.scheduled_time).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                        {match.status === 'finished' && match.winner && (
                          <span className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: `${accentColor}30` }}>
                            Ganador: {match.winner.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Standings View */}
      {view === 'standings' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {standings.groups.map(group => (
              <Card key={group.key} className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: accentColor }}>
                    {group.label}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-2 px-2">#</th>
                          <th className="text-left py-2 px-2">Equipo</th>
                          <th className="text-center py-2 px-2">G</th>
                          <th className="text-center py-2 px-2">P</th>
                          <th className="text-center py-2 px-2">%</th>
                          <th className="text-center py-2 px-2">DIF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((row, idx) => (
                          <tr key={row.team.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="py-3 px-2">
                              <span className="font-bold" style={{ color: idx < 2 ? accentColor : 'inherit' }}>
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                {renderTeamLogo(row.team)}
                                <span className="font-medium">{row.team.name}</span>
                              </div>
                            </td>
                            <td className="text-center py-3 px-2 font-bold">{row.wins}</td>
                            <td className="text-center py-3 px-2">{row.losses}</td>
                            <td className="text-center py-3 px-2">{(row.pct * 100).toFixed(0)}%</td>
                            <td className="text-center py-3 px-2">
                              <span className={row.diff > 0 ? 'text-green-400' : row.diff < 0 ? 'text-red-400' : ''}>
                                {row.diff > 0 ? '+' : ''}{row.diff}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Fallback: Tabla General si no hay grupos */}
            {standings.hasGroups === false && standings.overall.length > 0 && (
            <Card className="bg-white/10 backdrop-blur border-white/20 md:col-span-2">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: accentColor }}>
                  Tabla General
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-2 px-2">#</th>
                        <th className="text-left py-2 px-2">Equipo</th>
                        <th className="text-center py-2 px-2">G</th>
                        <th className="text-center py-2 px-2">P</th>
                        <th className="text-center py-2 px-2">%</th>
                        <th className="text-center py-2 px-2">DIF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.overall.map((row, idx) => (
                        <tr key={row.team.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-3 px-2">
                            <span className="font-bold" style={{ color: idx < 4 ? accentColor : 'inherit' }}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {renderTeamLogo(row.team)}
                              <span className="font-medium">{row.team.name}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2 font-bold">{row.wins}</td>
                          <td className="text-center py-3 px-2">{row.losses}</td>
                          <td className="text-center py-3 px-2">{(row.pct * 100).toFixed(0)}%</td>
                          <td className="text-center py-3 px-2">
                            <span className={row.diff > 0 ? 'text-green-400' : row.diff < 0 ? 'text-red-400' : ''}>
                              {row.diff > 0 ? '+' : ''}{row.diff}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Empty state */}
            {standings.overall.length === 0 && (
            <Card className="bg-white/10 backdrop-blur border-white/20 md:col-span-2">
              <CardContent className="p-12 text-center">
                <div className="text-white/60">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No hay posiciones disponibles</p>
                  <p className="text-sm">Las posiciones se actualizarán cuando se completen los partidos</p>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      )}

      {/* Bracket View */}
      {view === 'bracket' && (
        <div>
          {playoffMatches.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-12 text-center">
                <div className="text-white/60">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Playoffs próximamente</p>
                  <p className="text-sm">Las llaves de playoff aparecerán cuando finalice la fase de grupos</p>
                </div>
              </CardContent>
            </Card>
          ) : (
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-6" style={{ color: accentColor }}>
              Llaves de Playoff
            </h3>

            <div className="space-y-8">
              {/* Semifinales */}
              {playoffMatches.filter(m => m.round === 'semifinal').length > 0 && (
                <div>
                  <h4 className="text-lg font-bold mb-4 text-white/80">Semifinales</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {playoffMatches.filter(m => m.round === 'semifinal').map((match) => (
                      <div
                        key={match.id}
                        className="p-4 rounded-lg bg-white/5 border-2"
                        style={{ borderColor: match.status === 'finished' ? `${accentColor}40` : 'rgba(255,255,255,0.1)' }}
                      >
                        {/* Team A */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1">
                            {renderTeamLogo(match.team_a)}
                            <span className={`font-medium ${match.winner_id === match.team_a_id ? 'font-bold' : ''}`}>
                              {match.team_a?.name || 'TBD'}
                            </span>
                          </div>
                          {match.team_a_score !== null && (
                            <span
                              className="text-2xl font-bold"
                              style={{ color: match.winner_id === match.team_a_id ? accentColor : 'inherit' }}
                            >
                              {match.team_a_score}
                            </span>
                          )}
                        </div>

                        {/* Team B */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {renderTeamLogo(match.team_b)}
                            <span className={`font-medium ${match.winner_id === match.team_b_id ? 'font-bold' : ''}`}>
                              {match.team_b?.name || 'TBD'}
                            </span>
                          </div>
                          {match.team_b_score !== null && (
                            <span
                              className="text-2xl font-bold"
                              style={{ color: match.winner_id === match.team_b_id ? accentColor : 'inherit' }}
                            >
                              {match.team_b_score}
                            </span>
                          )}
                        </div>

                        {match.winner && (
                          <div className="mt-3 pt-3 border-t border-white/10 text-center">
                            <span className="text-xs text-white/60">Pasa a la final</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final */}
              {playoffMatches.filter(m => m.round === 'final').length > 0 && (
                <div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Trophy className="h-6 w-6" style={{ color: accentColor }} />
                    <h4 className="text-2xl font-bold" style={{ color: accentColor }}>FINAL</h4>
                  </div>
                  <div className="max-w-md mx-auto">
                    {playoffMatches.filter(m => m.round === 'final').map((match) => (
                      <div
                        key={match.id}
                        className="p-6 rounded-lg bg-white/5 border-2"
                        style={{ borderColor: `${accentColor}60` }}
                      >
                        {/* Team A */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1">
                            {renderTeamLogo(match.team_a)}
                            <span className={`text-lg font-medium ${match.winner_id === match.team_a_id ? 'font-bold' : ''}`}>
                              {match.team_a?.name || 'TBD'}
                            </span>
                          </div>
                          {match.team_a_score !== null && (
                            <span
                              className="text-3xl font-bold"
                              style={{ color: match.winner_id === match.team_a_id ? accentColor : 'inherit' }}
                            >
                              {match.team_a_score}
                            </span>
                          )}
                        </div>

                        {/* Team B */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {renderTeamLogo(match.team_b)}
                            <span className={`text-lg font-medium ${match.winner_id === match.team_b_id ? 'font-bold' : ''}`}>
                              {match.team_b?.name || 'TBD'}
                            </span>
                          </div>
                          {match.team_b_score !== null && (
                            <span
                              className="text-3xl font-bold"
                              style={{ color: match.winner_id === match.team_b_id ? accentColor : 'inherit' }}
                            >
                              {match.team_b_score}
                            </span>
                          )}
                        </div>

                        {match.winner && (
                          <div className="mt-4 pt-4 border-t border-white/20 text-center">
                            <Trophy className="h-8 w-8 mx-auto mb-2" style={{ color: accentColor }} />
                            <p className="text-xl font-bold" style={{ color: accentColor }}>
                              🏆 CAMPEÓN: {match.winner.name}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tercer Puesto */}
              {playoffMatches.filter(m => m.round === 'third_place').length > 0 && (
                <div>
                  <h4 className="text-lg font-bold mb-4 text-white/80 text-center">Tercer Puesto</h4>
                  <div className="max-w-md mx-auto">
                    {playoffMatches.filter(m => m.round === 'third_place').map((match) => (
                      <div
                        key={match.id}
                        className="p-4 rounded-lg bg-white/5 border border-white/20"
                      >
                        {/* Team A */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1">
                            {renderTeamLogo(match.team_a)}
                            <span className={`font-medium ${match.winner_id === match.team_a_id ? 'font-bold' : ''}`}>
                              {match.team_a?.name || 'TBD'}
                            </span>
                          </div>
                          {match.team_a_score !== null && (
                            <span
                              className="text-2xl font-bold"
                              style={{ color: match.winner_id === match.team_a_id ? accentColor : 'inherit' }}
                            >
                              {match.team_a_score}
                            </span>
                          )}
                        </div>

                        {/* Team B */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {renderTeamLogo(match.team_b)}
                            <span className={`font-medium ${match.winner_id === match.team_b_id ? 'font-bold' : ''}`}>
                              {match.team_b?.name || 'TBD'}
                            </span>
                          </div>
                          {match.team_b_score !== null && (
                            <span
                              className="text-2xl font-bold"
                              style={{ color: match.winner_id === match.team_b_id ? accentColor : 'inherit' }}
                            >
                              {match.team_b_score}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
          )}
        </div>
      )}
    </div>
  );
}
