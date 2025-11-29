'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { Group, Match, MatchWithTeams, StandingsRow, Tournament } from '@/types/blacktop';
import {
    AlertCircle,
    BarChart3,
    Calendar,
    CheckCircle2,
    Trophy,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdvancePlayoffsDialog } from './advance-playoffs-dialog';
import { ConfirmDialog } from './confirm-dialog';
import { FixtureSkeleton } from './fixture-skeleton';
import { MatchCard } from './match-card';
import { MatchStatsViewModal } from './match-stats-view-modal';
import { LiveScorekeeperPro } from './scorekeeper/live-scorekeeper-pro';

interface TournamentFixtureV2Props {
  tournamentId: number;
  tournament: Tournament;
}

export function TournamentFixtureV2({ tournamentId, tournament }: TournamentFixtureV2Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMatches, setGroupMatches] = useState<{ [key: string]: MatchWithTeams[] }>({});
  const [playoffMatches, setPlayoffMatches] = useState<{
    quarterfinals: MatchWithTeams[];
    semifinals: MatchWithTeams[];
    third_place: MatchWithTeams | null;
    final: MatchWithTeams | null;
  }>({ quarterfinals: [], semifinals: [], third_place: null, final: null });
  const [standings, setStandings] = useState<{ [key: string]: StandingsRow[] }>({});
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scorekeeperOpen, setScorekeeperOpen] = useState(false);
  const [confirmGenerateOpen, setConfirmGenerateOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [confirmPlayoffsOpen, setConfirmPlayoffsOpen] = useState(false);

  useEffect(() => {
    fetchFixtures();
  }, [tournamentId]);

  const fetchFixtures = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blacktop/tournaments/${tournamentId}/fixtures`);
      if (res.ok) {
        const data = await res.json();

        setGroups(data.groups.map((g: any) => g.group));

        const matchesByGroup: { [key: string]: MatchWithTeams[] } = {};
        const standingsByGroup: { [key: string]: StandingsRow[] } = {};

        data.groups.forEach((g: any) => {
          matchesByGroup[g.group.id] = g.matches;
          standingsByGroup[g.group.id] = g.standings;
        });

        setGroupMatches(matchesByGroup);
        setStandings(standingsByGroup);
        setPlayoffMatches(data.playoffs);
      }
    } catch (error) {
      console.error('Error fetching fixtures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGroupsFixtures = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/blacktop/tournaments/${tournamentId}/generate-groups-fixtures`, {
        method: 'POST',
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: '✅ Fixtures generados',
          description: `${data.matchesCreated} partidos de grupos creados`
        });
        // Refrescar datos (el cache se invalida automáticamente en el servidor)
        await fetchFixtures();
        router.refresh();
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error generating fixtures:', error);
      toast({ title: 'Error', description: 'No se pudo generar el fixture', variant: 'destructive' });
    } finally {
      setActionLoading(false);
      setConfirmGenerateOpen(false);
    }
  };

  const handleAdvanceToPlayoffs = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/blacktop/tournaments/${tournamentId}/advance-to-playoffs`, {
        method: 'POST',
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: 'Avanzado a playoffs',
          description: `${data.playoffMatchesCreated} partidos de playoffs creados`
        });
        await fetchFixtures();
        router.refresh();
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error advancing to playoffs:', error);
      toast({ title: 'Error', description: 'No se pudo avanzar a playoffs', variant: 'destructive' });
    } finally {
      setActionLoading(false);
      setConfirmPlayoffsOpen(false);
    }
  };

  const handleSimulatePhase = async () => {
    if (!confirm('¿Simular todos los partidos pendientes de la fase actual?')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/blacktop/tournaments/${tournamentId}/simulate-phase`, {
        method: 'POST'
      });

      if (res.ok) {
        toast({ title: 'Fase simulada', description: 'Resultados generados automáticamente' });
        await fetchFixtures();
        router.refresh();
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error simulating phase:', error);
      toast({ title: 'Error', description: 'No se pudo simular la fase', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const openScorekeeper = (match: Match) => {
    setSelectedMatch(match);
    setScorekeeperOpen(true);
  };

  const openStatsModal = (matchId: number) => {
    setSelectedMatchId(matchId);
    setStatsModalOpen(true);
  };

  const allGroupsComplete = Object.values(groupMatches).every(matches =>
    matches.every(m => m.status === 'finished')
  );

  const totalGroupMatches = Object.values(groupMatches).reduce((sum, matches) => sum + matches.length, 0);
  const finishedGroupMatches = Object.values(groupMatches).reduce(
    (sum, matches) => sum + matches.filter(m => m.status === 'finished').length,
    0
  );

  if (loading) {
    return <FixtureSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Acciones principales */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Fixture</CardTitle>
          <CardDescription>
            Estado: <Badge>{tournament.tournament_status}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tournament.tournament_status === 'draft' && (
              <Button
                onClick={() => setConfirmGenerateOpen(true)}
                disabled={actionLoading}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Generar Fixture de Grupos
              </Button>
            )}

            {tournament.tournament_status === 'groups' && (
              <>
                <Button
                  onClick={() => setConfirmPlayoffsOpen(true)}
                  disabled={actionLoading || !allGroupsComplete}
                  variant={allGroupsComplete ? 'default' : 'outline'}
                >
                  {allGroupsComplete ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  )}
                  Avanzar a Playoffs
                </Button>
                {!allGroupsComplete && (
                  <span className="text-sm text-muted-foreground flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Completa todos los partidos de grupos primero
                  </span>
                )}
              </>
            )}

            <Button
              onClick={handleSimulatePhase}
              disabled={actionLoading}
              variant="secondary"
            >
              <Zap className="h-4 w-4 mr-2" />
              Simular Fase (Testing)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Grupos, Playoffs, Standings */}
      <Tabs defaultValue="groups" className="w-full">
        <TabsList>
          <TabsTrigger value="groups">Fase de Grupos</TabsTrigger>
          <TabsTrigger value="playoffs">Playoffs</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
        </TabsList>

        {/* Fase de Grupos */}
        <TabsContent value="groups" className="space-y-4">
          {groups.map(group => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle>{group.display_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupMatches[group.id]?.length > 0 ? (
                  groupMatches[group.id].map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onManage={openScorekeeper}
                      onViewStats={openStatsModal}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No hay partidos generados para este grupo
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Playoffs */}
        <TabsContent value="playoffs" className="space-y-4">
          {playoffMatches.quarterfinals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cuartos de Final</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {playoffMatches.quarterfinals.map(match => (
                  <MatchCard key={match.id} match={match} onManage={openScorekeeper} onViewStats={openStatsModal} />
                ))}
              </CardContent>
            </Card>
          )}

          {playoffMatches.semifinals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Semifinales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {playoffMatches.semifinals.map(match => (
                  <MatchCard key={match.id} match={match} onManage={openScorekeeper} onViewStats={openStatsModal} />
                ))}
              </CardContent>
            </Card>
          )}

          {playoffMatches.final && (
            <Card>
              <CardHeader>
                <CardTitle>Final</CardTitle>
              </CardHeader>
              <CardContent>
                <MatchCard match={playoffMatches.final} onManage={openScorekeeper} onViewStats={openStatsModal} />
              </CardContent>
            </Card>
          )}

          {playoffMatches.third_place && (
            <Card>
              <CardHeader>
                <CardTitle>Tercer Puesto</CardTitle>
              </CardHeader>
              <CardContent>
                <MatchCard match={playoffMatches.third_place} onManage={openScorekeeper} onViewStats={openStatsModal} />
              </CardContent>
            </Card>
          )}

          {playoffMatches.quarterfinals.length === 0 && playoffMatches.semifinals.length === 0 && !playoffMatches.final && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay partidos de playoffs generados</p>
                <p className="text-sm mt-2">Completa la fase de grupos y avanza a playoffs</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Standings */}
        <TabsContent value="standings" className="space-y-4">
          {groups.map(group => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {group.display_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {standings[group.id]?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground border-b">
                          <th className="pb-2 pl-2">#</th>
                          <th className="pb-2">Team</th>
                          <th className="pb-2 text-center">W</th>
                          <th className="pb-2 text-center">L</th>
                          <th className="pb-2 text-center">Pct</th>
                          <th className="pb-2 text-center">PF</th>
                          <th className="pb-2 text-center">PA</th>
                          <th className="pb-2 text-center">Diff</th>
                          <th className="pb-2 text-center">Streak</th>
                          <th className="pb-2 text-center">Fouls</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings[group.id].map((row, idx) => (
                          <tr key={row.team_id} className="border-b hover:bg-white/5 transition-colors">
                            <td className="py-3 pl-2 font-bold text-muted-foreground">{idx + 1}</td>
                            <td className="py-3 font-semibold text-white">{row.team_name}</td>
                            <td className="py-3 text-center font-semibold text-green-500">{row.won}</td>
                            <td className="py-3 text-center font-semibold text-red-400">{row.lost}</td>
                            <td className="py-3 text-center font-mono">{row.win_pct.toFixed(3)}</td>
                            <td className="py-3 text-center">{row.points_for}</td>
                            <td className="py-3 text-center">{row.points_against}</td>
                            <td className={`py-3 text-center font-medium ${row.point_diff > 0 ? 'text-green-500' : row.point_diff < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                              {row.point_diff > 0 ? '+' : ''}{row.point_diff}
                            </td>
                            <td className="py-3 text-center">
                              {row.streak > 0 ? (
                                <span className="text-green-500 font-semibold">W{row.streak}</span>
                              ) : row.streak < 0 ? (
                                <span className="text-red-400 font-semibold">L{Math.abs(row.streak)}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="py-3 text-center text-yellow-500">{row.total_fouls}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No hay partidos finalizados aún
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* LiveScorekeeper Modal */}
      {selectedMatch && (
        <LiveScorekeeperPro
          match={selectedMatch}
          tournament={tournament}
          open={scorekeeperOpen}
          onClose={() => {
            setScorekeeperOpen(false);
            setSelectedMatch(null);
          }}
          onSuccess={() => {
            fetchFixtures();
            router.refresh();
          }}
        />
      )}

      {/* Match Stats View Modal */}
      {selectedMatchId && (
        <MatchStatsViewModal
          matchId={selectedMatchId}
          open={statsModalOpen}
          onClose={() => {
            setStatsModalOpen(false);
            setSelectedMatchId(null);
          }}
        />
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={confirmGenerateOpen}
        onOpenChange={setConfirmGenerateOpen}
        title="¿Generar fixture de grupos?"
        description="Esto eliminará todos los partidos de grupos existentes y creará nuevos partidos según la configuración actual de equipos y zonas."
        onConfirm={handleGenerateGroupsFixtures}
        confirmText="Generar"
        variant="destructive"
      />

      <AdvancePlayoffsDialog
        open={confirmPlayoffsOpen}
        onOpenChange={setConfirmPlayoffsOpen}
        onConfirm={handleAdvanceToPlayoffs}
        groupsComplete={allGroupsComplete}
        totalMatches={totalGroupMatches}
        finishedMatches={finishedGroupMatches}
        thirdPlaceEnabled={tournament.third_place_match}
      />
    </div>
  );
}
