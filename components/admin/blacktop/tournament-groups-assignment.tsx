'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Users, Shuffle, Save, AlertCircle, Calendar } from 'lucide-react';
import type { Team, Tournament } from '@/types/blacktop';

interface TournamentGroupsAssignmentProps {
  tournament: Tournament;
  teams: Team[];
  onSave: (assignments: { teamId: number; groupName: string; position: number }[]) => Promise<void>;
  onGenerateMatches?: () => Promise<void>;
}

export function TournamentGroupsAssignment({ tournament, teams, onSave, onGenerateMatches }: TournamentGroupsAssignmentProps) {
  const [groups, setGroups] = useState<{ [key: string]: Team[] }>({});
  const [unassigned, setUnassigned] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const approvedTeams = teams.filter(t => t.status === 'approved');
  const groupNames = Array.from({ length: tournament.num_groups || 2 }).map((_, i) => 
    String.fromCharCode(65 + i)
  );
  const groupLabels = groupNames.map(name => `Zona ${name}`);

  useEffect(() => {
    // Inicializar grupos
    const initialGroups: { [key: string]: Team[] } = {};
    groupNames.forEach(name => {
      initialGroups[name] = approvedTeams.filter(t => t.group_name === name || t.group_name === `Zona ${name}`);
    });

    const assignedTeamIds = new Set(
      Object.values(initialGroups).flat().map(t => t.id)
    );
    const unassignedTeams = approvedTeams.filter(t => !assignedTeamIds.has(t.id));

    setGroups(initialGroups);
    setUnassigned(unassignedTeams);
  }, [teams]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    // Obtener listas
    const sourceList = sourceId === 'unassigned' ? [...unassigned] : [...groups[sourceId]];
    const destList = destId === 'unassigned' ? [...unassigned] : [...groups[destId]];

    // Mover elemento
    const [movedTeam] = sourceList.splice(source.index, 1);

    if (sourceId === destId) {
      sourceList.splice(destination.index, 0, movedTeam);
      if (sourceId === 'unassigned') {
        setUnassigned(sourceList);
      } else {
        setGroups({ ...groups, [sourceId]: sourceList });
      }
    } else {
      destList.splice(destination.index, 0, movedTeam);
      if (sourceId === 'unassigned') {
        setUnassigned(sourceList);
      } else {
        setGroups({ ...groups, [sourceId]: sourceList });
      }
      if (destId === 'unassigned') {
        setUnassigned(destList);
      } else {
        setGroups({ ...groups, [destId]: destList });
      }
    }
  };

  const handleRandomize = () => {
    const shuffled = [...approvedTeams].sort(() => Math.random() - 0.5);
    const teamsPerGroup = Math.ceil(shuffled.length / groupNames.length);
    
    const newGroups: { [key: string]: Team[] } = {};
    groupNames.forEach((name, i) => {
      newGroups[name] = shuffled.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup);
    });

    setGroups(newGroups);
    setUnassigned([]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const assignments: { teamId: number; groupName: string; position: number }[] = [];
      
      Object.entries(groups).forEach(([groupName, teamsList]) => {
        teamsList.forEach((team, index) => {
          assignments.push({
            teamId: team.id,
            groupName,
            position: index + 1,
          });
        });
      });

      await onSave(assignments);
    } finally {
      setLoading(false);
    }
  };

  const totalAssigned = Object.values(groups).reduce((sum, g) => sum + g.length, 0);
  const isComplete = unassigned.length === 0 && totalAssigned === approvedTeams.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Asignar Equipos a Zonas
            </CardTitle>
            <CardDescription>
              Arrastra los equipos a las zonas correspondientes
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRandomize}>
              <Shuffle className="h-4 w-4 mr-2" />
              Aleatorio
            </Button>
            <Button onClick={handleSave} disabled={loading || !isComplete}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Zonas'}
            </Button>
            {onGenerateMatches && isComplete && (
              <Button onClick={onGenerateMatches} variant="default">
                <Calendar className="h-4 w-4 mr-2" />
                Generar Partidos
              </Button>
            )}
          </div>
        </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary">
              {approvedTeams.length} equipos aprobados
            </Badge>
            <Badge variant={isComplete ? 'default' : 'destructive'}>
              {totalAssigned} asignados
            </Badge>
            {unassigned.length > 0 && (
              <Badge variant="outline">
                {unassigned.length} sin asignar
              </Badge>
            )}
          </div>
          {!isComplete && (
            <div className="flex items-center gap-2 mt-3 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Asigna todos los equipos antes de guardar</span>
            </div>
          )}
          <DragDropContext onDragEnd={handleDragEnd}>
            {/* Equipos sin asignar */}
            {unassigned.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Sin Asignar</h3>
                <Droppable droppableId="unassigned" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-wrap gap-2 min-h-[60px] p-3 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver ? 'border-red-500 bg-red-500/10' : 'border-gray-700'
                      }`}
                    >
                      {unassigned.map((team, index) => (
                        <Draggable key={team.id} draggableId={`team-${team.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`px-3 py-2 bg-background border rounded-lg cursor-move transition-all ${
                                snapshot.isDragging ? 'shadow-lg scale-105' : ''
                              }`}
                            >
                              <div className="font-medium text-sm">{team.name}</div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}

            {/* Zonas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {groupNames.map((groupName, idx) => (
            <Card key={groupName}>
              <CardHeader>
                <CardTitle className="text-lg">Zona {groupName}</CardTitle>
                <CardDescription>
                  {groups[groupName]?.length || 0} equipos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={groupName}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[200px] p-3 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver ? 'border-red-500 bg-red-500/10' : 'border-gray-700'
                      }`}
                    >
                      {groups[groupName]?.map((team, index) => (
                        <Draggable key={team.id} draggableId={`team-${team.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-background border rounded-lg cursor-move transition-all ${
                                snapshot.isDragging ? 'shadow-lg scale-105' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{team.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    @{team.captain_instagram}
                                  </div>
                                </div>
                                <Badge variant="outline">{index + 1}</Badge>
                              </div>
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
            ))}
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
