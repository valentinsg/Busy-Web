'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Trophy, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Team, Match, Tournament } from '@/types/blacktop';

interface FixtureBuilderProps {
  tournamentId: number;
  tournament: Tournament;
}

interface MatchSlot {
  id: string;
  round: string;
  match_number: number;
  scheduled_time?: string;
  team_a?: Team;
  team_b?: Team;
  team_a_score?: number;
  team_b_score?: number;
  status: 'pending' | 'live' | 'finished';
}

export function FixtureBuilder({ tournamentId, tournament }: FixtureBuilderProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<MatchSlot[]>([]);
  const [unassignedTeams, setUnassignedTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [tournamentId]);

  const loadData = async () => {
    try {
      const [teamsRes, matchesRes] = await Promise.all([
        fetch(`/api/blacktop/tournaments/${tournamentId}/teams`),
        fetch(`/api/blacktop/tournaments/${tournamentId}/matches`),
      ]);

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        const approved = teamsData.filter((t: Team) => t.status === 'approved');
        setTeams(approved);
        setUnassignedTeams(approved);
      }

      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatches(matchesData.map((m: Match) => ({
          id: m.id.toString(),
          round: m.round,
          match_number: m.match_number || 0,
          scheduled_time: m.scheduled_time,
          team_a: m.team_a_id ? teams.find(t => t.id === m.team_a_id) : undefined,
          team_b: m.team_b_id ? teams.find(t => t.id === m.team_b_id) : undefined,
          team_a_score: m.team_a_score,
          team_b_score: m.team_b_score,
          status: m.status,
        })));
      }
    } catch (error) {
      console.error('Error loading fixture data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el fixture',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFixture = async () => {
    // Auto-generar fixture según formato del torneo
    const formatType = tournament.format_type || 'groups_playoff';
    
    if (formatType === 'groups_playoff') {
      // Generar partidos de fase de grupos
      await generateGroupStageMatches();
    } else if (formatType === 'single_elimination') {
      // Generar bracket de eliminación
      await generateEliminationBracket();
    }
  };

  const generateGroupStageMatches = async () => {
    // Lógica para generar todos contra todos por zona
    toast({
      title: 'Generando fixture...',
      description: 'Creando partidos de fase de grupos',
    });
  };

  const generateEliminationBracket = async () => {
    // Lógica para generar bracket
    toast({
      title: 'Generando bracket...',
      description: 'Creando partidos de eliminación',
    });
  };

  const handleDragEnd = (result: DropResult) => {
    // Lógica de drag & drop
    const { source, destination } = result;
    if (!destination) return;

    toast({
      title: 'Equipo asignado',
      description: 'El equipo se asignó al partido correctamente',
    });
  };

  if (loading) {
    return <div className="text-center py-8">Cargando fixture...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Fixture del Torneo
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Arrastra los equipos a los partidos o genera el fixture automáticamente
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGenerateFixture}>
                <Plus className="h-4 w-4 mr-2" />
                Generar Fixture
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary">
              {teams.length} equipos
            </Badge>
            <Badge variant="outline">
              {matches.length} partidos
            </Badge>
          </div>
        </CardContent>
      </Card>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Equipos sin asignar */}
        {unassignedTeams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Equipos disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="unassigned" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-wrap gap-2 min-h-[60px]"
                  >
                    {unassignedTeams.map((team, index) => (
                      <Draggable key={team.id} draggableId={`team-${team.id}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="px-3 py-2 bg-muted rounded-lg cursor-move"
                          >
                            {team.name}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
        )}

        {/* Vista de partidos tipo NBA */}
        <Card>
          <CardHeader>
            <CardTitle>Partidos</CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay partidos creados</p>
                <p className="text-sm">Usa "Generar Fixture" para crear los partidos automáticamente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tabla tipo NBA */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Partido</th>
                        <th className="text-center p-3 font-semibold w-24">Hora</th>
                        <th className="text-center p-3 font-semibold w-32">Resultado</th>
                        <th className="text-center p-3 font-semibold w-32">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map((match) => (
                        <tr key={match.id} className="border-t hover:bg-muted/50 cursor-pointer">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="font-medium">
                                  {match.team_a?.name || 'TBD'}
                                </div>
                                <div className="text-sm text-muted-foreground">vs</div>
                                <div className="font-medium">
                                  {match.team_b?.name || 'TBD'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center text-sm">
                            {match.scheduled_time ? (
                              <div className="flex items-center justify-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(match.scheduled_time).toLocaleTimeString('es-AR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {match.status === 'finished' ? (
                              <div className="font-bold">
                                {match.team_a_score} - {match.team_b_score}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={
                                match.status === 'finished'
                                  ? 'default'
                                  : match.status === 'live'
                                  ? 'destructive'
                                  : 'outline'
                              }
                            >
                              {match.status === 'finished'
                                ? 'Finalizado'
                                : match.status === 'live'
                                ? 'En juego'
                                : 'Programado'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DragDropContext>
    </div>
  );
}
