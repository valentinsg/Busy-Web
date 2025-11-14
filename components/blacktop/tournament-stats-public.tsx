'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Team, TournamentLeaderboard } from '@/types/blacktop';
import { Filter } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { TopStatsTables } from './top-stats-tables';

interface TournamentStatsPublicProps {
  leaderboard: TournamentLeaderboard[];
  teams: Team[];
  accentColor: string;
}

type SortKey =
  | 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'tpg'
  | 'pts' | 'reb' | 'ast' | 'stl' | 'blk' | 'to'
  | 'gp' | 'name' | 'team';

export function TournamentStatsPublic({ leaderboard, teams, accentColor }: TournamentStatsPublicProps) {
  // Filtrar leaderboard a solo jugadores cuyos equipos existen en 'teams' (aprobados)
  const teamIds = new Set(teams.map(t => t.id));
  const validLeaderboard = leaderboard.filter(p => teamIds.has(p.team.id));
  const [selectedTeam, setSelectedTeam] = useState<number | 'all'>('all');
  const [mode, setMode] = useState<'totals' | 'pergame'>('pergame');
  const [sortKey, setSortKey] = useState<SortKey>('ppg');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [displayCount, setDisplayCount] = useState(10);
  const [minGames, setMinGames] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const rows = useMemo(() => {
    let base = validLeaderboard;
    let list = (selectedTeam === 'all' ? base : base.filter(p => p.team.id === selectedTeam))
      .map((p) => {
        const gp = p.games_played || 0;
        const safe = (v: number) => Number.isFinite(v) ? v : 0;
        const round = (v: number) => Math.round(v * 10) / 10;
        return {
          id: p.player.id,
          name: p.player.full_name,
          team: p.team.name,
          gp,
          pts: p.total_points,
          reb: p.total_rebounds,
          ast: p.total_assists,
          stl: p.total_steals,
          blk: p.total_blocks,
          to: p.total_turnovers,
          ppg: round(safe(p.total_points / Math.max(1, gp))),
          rpg: round(safe(p.total_rebounds / Math.max(1, gp))),
          apg: round(safe(p.total_assists / Math.max(1, gp))),
          spg: round(safe(p.total_steals / Math.max(1, gp))),
          bpg: round(safe(p.total_blocks / Math.max(1, gp))),
          tpg: round(safe(p.total_turnovers / Math.max(1, gp))),
        };
      });

    // Filtro por partidos mínimos
    if (minGames > 0) {
      list = list.filter(p => p.gp >= minGames);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.team.toLowerCase().includes(query)
      );
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    return list.sort((a: any, b: any) => {
      if (sortKey === 'name' || sortKey === 'team') {
        return a[sortKey].localeCompare(b[sortKey]) * dir;
      }
      return ((a[sortKey] ?? 0) - (b[sortKey] ?? 0)) * dir;
    });
  }, [validLeaderboard, selectedTeam, sortKey, sortDir, minGames, searchQuery]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  // Si no hay equipos aprobados o no hay datos válidos, mostrar vacío directo
  if (teams.length === 0 || validLeaderboard.length === 0) {
    return (
      <div className="space-y-8 font-body">
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-white/60">
              No hay estadísticas disponibles aún. Se activarán cuando haya equipos y partidos aprobados.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-body">
      {/* Card de Filtros */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">
                Buscar jugador
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre o equipo..."
                className="w-full rounded-md border bg-white/10 border-white/20 p-2 text-white placeholder:text-white/40"
              />
            </div>

            {/* Filtro por equipo */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">
                Filtrar por equipo
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full rounded-md border bg-white/10 border-white/20 p-2 text-white"
              >
                <option value="all" className="bg-black">Todos los equipos</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id} className="bg-black">{t.name}</option>
                ))}
              </select>
            </div>

            {/* Partidos mínimos */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">
                Partidos mínimos: {minGames}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={minGames}
                onChange={(e) => setMinGames(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Modo y contador */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant={mode === 'pergame' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setMode('pergame');
                  setSortKey('ppg');
                }}
                style={mode === 'pergame' ? { backgroundColor: accentColor } : {}}
              >
                Por Partido
              </Button>
              <Button
                variant={mode === 'totals' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setMode('totals');
                  setSortKey('pts');
                }}
                style={mode === 'totals' ? { backgroundColor: accentColor } : {}}
              >
                Totales
              </Button>
            </div>
            <p className="text-sm text-white/60">
              Mostrando {rows.length} jugador{rows.length !== 1 ? 'es' : ''}
              {minGames > 0 && ` con al menos ${minGames} partido${minGames !== 1 ? 's' : ''}`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card de Tabla de Jugadores */}
      <Card className="bg-white/10 backdrop-blur border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Jugadores</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              No hay estadísticas disponibles
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm min-w-[720px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-white/10 text-white/80">
                      {[
                        {k:'name', label:'JUGADOR', tooltip:'Nombre del jugador'},
                        {k:'team', label:'EQUIPO', tooltip:'Equipo'},
                        {k:'gp', label:'PJ', tooltip:'Partidos jugados'},
                        ...(mode==='pergame'
                          ? [
                              {k:'ppg', label:'PPP', tooltip:'Puntos por partido'},
                              {k:'rpg', label:'RBP', tooltip:'Rebotes por partido'},
                              {k:'apg', label:'ASP', tooltip:'Asistencias por partido'},
                              {k:'spg', label:'ROP', tooltip:'Robos por partido'},
                              {k:'bpg', label:'TAP', tooltip:'Tapones por partido'},
                              {k:'tpg', label:'PDP', tooltip:'Pérdidas por partido'},
                            ]
                          : [
                              {k:'pts', label:'PTS', tooltip:'Puntos totales'},
                              {k:'reb', label:'REB', tooltip:'Rebotes totales'},
                              {k:'ast', label:'AST', tooltip:'Asistencias totales'},
                              {k:'stl', label:'ROB', tooltip:'Robos totales'},
                              {k:'blk', label:'TAP', tooltip:'Tapones totales'},
                              {k:'to', label:'PER', tooltip:'Pérdidas totales'},
                            ])
                      ].map((col:any) => (
                        <th
                          key={col.k}
                          onClick={() => toggleSort(col.k)}
                          className="px-2 py-3 text-left cursor-pointer hover:bg-white/5 transition-colors"
                          title={col.tooltip}
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            {sortKey === col.k && (
                              <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, displayCount).map((row, idx) => (
                      <tr
                        key={row.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-2 py-3">
                          <Link
                            href={`/blacktop/jugadores/${row.id}`}
                            className="text-white hover:underline font-medium"
                            style={{ color: accentColor }}
                          >
                            {row.name}
                          </Link>
                        </td>
                        <td className="px-2 py-3 text-white/70">{row.team}</td>
                        <td className="px-2 py-3 text-white/70">{row.gp}</td>
                        {mode === 'pergame' ? (
                          <>
                            <td className="px-2 py-3 font-semibold" style={{color: accentColor}}>{row.ppg}</td>
                            <td className="px-2 py-3 text-white/70">{row.rpg}</td>
                            <td className="px-2 py-3 text-white/70">{row.apg}</td>
                            <td className="px-2 py-3 text-white/70">{row.spg}</td>
                            <td className="px-2 py-3 text-white/70">{row.bpg}</td>
                            <td className="px-2 py-3 text-white/70">{row.tpg}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-2 py-3 font-semibold" style={{color: accentColor}}>{row.pts}</td>
                            <td className="px-2 py-3 text-white/70">{row.reb}</td>
                            <td className="px-2 py-3 text-white/70">{row.ast}</td>
                            <td className="px-2 py-3 text-white/70">{row.stl}</td>
                            <td className="px-2 py-3 text-white/70">{row.blk}</td>
                            <td className="px-2 py-3 text-white/70">{row.to}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Botón cargar más */}
              {rows.length > displayCount && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setDisplayCount(prev => prev + 10)}
                    className="w-full sm:w-auto"
                  >
                    Cargar más jugadores ({rows.length - displayCount} restantes)
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Tablas Top 5 al final */}
      {validLeaderboard.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-6 text-white">Top 5 por Categoría</h3>
          <TopStatsTables leaderboard={validLeaderboard} accentColor={accentColor} />
        </div>
      )}
    </div>
  );
}
