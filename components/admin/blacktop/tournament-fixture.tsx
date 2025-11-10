'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import type { MatchWithTeams, TeamWithPlayers, MatchRound } from '@/types/blacktop';
import { useRouter } from 'next/navigation';

interface TournamentFixtureProps {
  tournamentId: number;
}

const ROUNDS: { value: MatchRound; label: string }[] = [
  { value: 'group_a', label: 'Grupo A' },
  { value: 'group_b', label: 'Grupo B' },
  { value: 'semifinal', label: 'Semifinal' },
  { value: 'third_place', label: 'Tercer puesto' },
  { value: 'final', label: 'Final' },
];

export function TournamentFixture({ tournamentId }: TournamentFixtureProps) {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [teams, setTeams] = useState<TeamWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    team_a_id: '',
    team_b_id: '',
    round: 'group_a' as MatchRound,
    match_number: '',
    scheduled_time: '',
    team_a_score: '',
    team_b_score: '',
  });

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  const fetchData = async () => {
    try {
      const [matchesRes, teamsRes] = await Promise.all([
        fetch(`/api/blacktop/tournaments/${tournamentId}/matches`),
        fetch(`/api/blacktop/tournaments/${tournamentId}/teams?status=approved`),
      ]);

      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatches(matchesData);
      }

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        tournament_id: tournamentId,
        team_a_id: formData.team_a_id ? parseInt(formData.team_a_id) : undefined,
        team_b_id: formData.team_b_id ? parseInt(formData.team_b_id) : undefined,
        round: formData.round,
        match_number: formData.match_number ? parseInt(formData.match_number) : undefined,
        scheduled_time: formData.scheduled_time || undefined,
        team_a_score: formData.team_a_score ? parseInt(formData.team_a_score) : undefined,
        team_b_score: formData.team_b_score ? parseInt(formData.team_b_score) : undefined,
      };

      const response = await fetch('/api/blacktop/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          team_a_id: '',
          team_b_id: '',
          round: 'group_a',
          match_number: '',
          scheduled_time: '',
          team_a_score: '',
          team_b_score: '',
        });
        await fetchData();
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  const handleDelete = async (matchId: number) => {
    if (!confirm('¿Eliminar este partido?')) return;

    try {
      const response = await fetch(`/api/blacktop/matches/${matchId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting match:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const matchesByRound = ROUNDS.map(round => ({
    ...round,
    matches: matches.filter(m => m.round === round.value),
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fixture</CardTitle>
              <CardDescription>
                Gestiona los partidos del torneo
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo partido
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="team_a">Equipo A</Label>
                  <Select
                    value={formData.team_a_id}
                    onValueChange={(value) => setFormData({ ...formData, team_a_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="team_b">Equipo B</Label>
                  <Select
                    value={formData.team_b_id}
                    onValueChange={(value) => setFormData({ ...formData, team_b_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="round">Ronda</Label>
                  <Select
                    value={formData.round}
                    onValueChange={(value) => setFormData({ ...formData, round: value as MatchRound })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROUNDS.map((round) => (
                        <SelectItem key={round.value} value={round.value}>
                          {round.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="match_number">N° de partido</Label>
                  <Input
                    id="match_number"
                    type="number"
                    value={formData.match_number}
                    onChange={(e) => setFormData({ ...formData, match_number: e.target.value })}
                    placeholder="1"
                  />
                </div>

                <div>
                  <Label htmlFor="scheduled_time">Hora</Label>
                  <Input
                    id="scheduled_time"
                    type="datetime-local"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="team_a_score">Puntos Equipo A</Label>
                  <Input
                    id="team_a_score"
                    type="number"
                    value={formData.team_a_score}
                    onChange={(e) => setFormData({ ...formData, team_a_score: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="team_b_score">Puntos Equipo B</Label>
                  <Input
                    id="team_b_score"
                    type="number"
                    value={formData.team_b_score}
                    onChange={(e) => setFormData({ ...formData, team_b_score: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Crear partido</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Partidos por ronda */}
      {matchesByRound.map((round) => (
        round.matches.length > 0 && (
          <Card key={round.value}>
            <CardHeader>
              <CardTitle className="text-lg">{round.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {round.matches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium">
                          {match.team_a?.name || 'TBD'}
                        </p>
                        {match.team_a_score !== null && match.team_a_score !== undefined && (
                          <p className="text-2xl font-bold">{match.team_a_score}</p>
                        )}
                      </div>
                      <div className="text-muted-foreground">vs</div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {match.team_b?.name || 'TBD'}
                        </p>
                        {match.team_b_score !== null && match.team_b_score !== undefined && (
                          <p className="text-2xl font-bold">{match.team_b_score}</p>
                        )}
                      </div>
                    </div>
                    {match.scheduled_time && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {new Date(match.scheduled_time).toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(match.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      ))}

      {matches.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay partidos creados
          </CardContent>
        </Card>
      )}
    </div>
  );
}
