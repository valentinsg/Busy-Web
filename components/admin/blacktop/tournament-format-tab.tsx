'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { Team, Tournament } from '@/types/blacktop';
import { useEffect, useState } from 'react';
import { TournamentFormatConfig } from './tournament-format-config';
import { TournamentGroupsAssignment } from './tournament-groups-assignment';

interface TournamentFormatTabProps {
  tournamentId: number;
}

export function TournamentFormatTab({ tournamentId }: TournamentFormatTabProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [tournamentId]);

  const loadData = async () => {
    try {
      const [tournamentRes, teamsRes] = await Promise.all([
        fetch(`/api/blacktop/tournaments/${tournamentId}`),
        fetch(`/api/blacktop/tournaments/${tournamentId}/teams`),
      ]);

      if (tournamentRes.ok) {
        const tournamentData = await tournamentRes.json();
        setTournament(tournamentData);
      }

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del torneo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFormat = async (config: Partial<Tournament>) => {
    try {
      const response = await fetch(`/api/blacktop/tournaments/${tournamentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Error al guardar formato');

      const updated = await response.json();
      setTournament(updated);

      toast({
        title: 'Formato guardado',
        description: 'La configuración del torneo se actualizó correctamente.',
      });
    } catch (error) {
      console.error('Error saving format:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el formato del torneo',
        variant: 'destructive',
      });
    }
  };

  const handleSaveGroups = async (assignments: { teamId: number; groupName: string; position: number }[]) => {
    try {
      const response = await fetch(`/api/admin/blacktop/tournaments/${tournamentId}/assign-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al asignar grupos');
      }

      toast({
        title: 'Zonas guardadas',
        description: 'Los equipos se asignaron correctamente a las zonas.',
      });

      // Reload teams
      await loadData();
    } catch (error) {
      console.error('Error saving groups:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la asignación de zonas',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateMatches = async () => {
    if (!confirm('¿Generar fixture de grupos? Esto eliminará los partidos de grupos existentes.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blacktop/tournaments/${tournamentId}/generate-groups-fixtures`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al generar fixture');
      }

      const result = await response.json();

      toast({
        title: 'Fixture generado',
        description: `Se crearon ${result.matchesCreated} partidos de grupos correctamente.`,
      });

      await loadData();
    } catch (error: any) {
      console.error('Error generating matches:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron generar los partidos',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (!tournament) {
    return <div className="text-center py-8 text-muted-foreground">No se encontró el torneo</div>;
  }

  const showGroupsTab = tournament.format_type === 'groups_playoff';

  return (
    <Tabs defaultValue="config" className="space-y-6">
      <TabsList>
        <TabsTrigger value="config">Configuración</TabsTrigger>
        {showGroupsTab && (
          <TabsTrigger value="groups">Asignar Zonas</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="config">
        <TournamentFormatConfig tournament={tournament} onSave={handleSaveFormat} />
      </TabsContent>

      {showGroupsTab && (
        <TabsContent value="groups">
          <TournamentGroupsAssignment
            tournament={tournament}
            teams={teams}
            onSave={handleSaveGroups}
            onGenerateMatches={handleGenerateMatches}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
