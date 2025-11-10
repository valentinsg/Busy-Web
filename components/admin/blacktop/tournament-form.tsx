'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { Tournament, TournamentFormData, TournamentFormatType, PlayoffFormat } from '@/types/blacktop';
import { useToast } from '@/hooks/use-toast';

interface TournamentFormProps {
  tournament?: Tournament;
  mode: 'create' | 'edit';
}

export function TournamentForm({ tournament, mode }: TournamentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TournamentFormData>({
    name: tournament?.name || '',
    slug: tournament?.slug || '',
    description: tournament?.description || '',
    location: tournament?.location || '',
    date: tournament?.date || '',
    time: tournament?.time || '',
    max_teams: tournament?.max_teams || 8,
    players_per_team_min: tournament?.players_per_team_min || 3,
    players_per_team_max: tournament?.players_per_team_max || 4,
    registration_open: tournament?.registration_open ?? true,
    registration_start: tournament?.registration_start || '',
    registration_end: tournament?.registration_end || '',
    is_hidden: tournament?.is_hidden ?? false,
    primary_color: tournament?.primary_color || '#000000',
    accent_color: tournament?.accent_color || '#ef4444',
    prizes_title: tournament?.prizes_title || 'Premios',
    prizes_description: tournament?.prizes_description || '',
    rules_content: tournament?.rules_content || '',
    rules_url: tournament?.rules_url || '',
    format_config: {
      format_type: (tournament as any)?.format_type || 'groups_playoff',
      num_groups: (tournament as any)?.num_groups ?? 2,
      teams_advance_per_group: (tournament as any)?.teams_advance_per_group ?? 2,
      playoff_format: (tournament as any)?.playoff_format || 'single_elimination',
      third_place_match: (tournament as any)?.third_place_match ?? false,
      playoff_series_length: ((tournament as any)?.format_config?.playoff_series_length) ?? 1,
    },
  });

  // Auto-generar slug desde el nombre
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: mode === 'create' ? generateSlug(name) : prev.slug,
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = mode === 'create' 
        ? '/api/blacktop/tournaments'
        : `/api/blacktop/tournaments/${tournament?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Propagar columnas directas si existen en la tabla
          format_type: formData.format_config?.format_type as TournamentFormatType,
          num_groups: formData.format_config?.num_groups,
          teams_advance_per_group: formData.format_config?.teams_advance_per_group,
          playoff_format: formData.format_config?.playoff_format as PlayoffFormat,
          third_place_match: formData.format_config?.third_place_match,
          // Guardar valores adicionales en JSON
          format_config: formData.format_config,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar torneo');
      }
      toast({
        title: mode === 'create' ? 'Torneo creado' : 'Cambios guardados',
        description: mode === 'create' ? 'El torneo se creó correctamente.' : 'El torneo se actualizó correctamente.',
      });
      router.push('/admin/blacktop');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast({
        title: 'No se pudo guardar',
        description: err instanceof Error ? err.message : 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
          <CardDescription>Datos principales del torneo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del torneo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="BUSY BLACKTOP #1"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug (URL) *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="busy-blacktop-1"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL: /blacktop/{formData.slug}
            </p>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Primer torneo 3v3 de BUSY en Mar del Plata"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Cancha BUSY, Mar del Plata"
              />
            </div>

            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="time">Hora</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Formato del torneo */}
      <Card>
        <CardHeader>
          <CardTitle>Formato del torneo</CardTitle>
          <CardDescription>Definí el formato desde el inicio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Tipo de formato</Label>
              <select
                value={formData.format_config?.format_type || 'groups_playoff'}
                onChange={(e) => setFormData({
                  ...formData,
                  format_config: { ...(formData.format_config || {}), format_type: e.target.value as TournamentFormatType },
                })}
                className="mt-1 w-full rounded-md border bg-background p-2"
              >
                <option value="groups_playoff">Zonas + Playoffs</option>
                <option value="single_elimination">Eliminación directa</option>
                <option value="round_robin">Todos contra todos</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div>
              <Label>Formato de playoffs</Label>
              <select
                value={formData.format_config?.playoff_format || 'single_elimination'}
                onChange={(e) => setFormData({
                  ...formData,
                  format_config: { ...(formData.format_config || {}), playoff_format: e.target.value as PlayoffFormat },
                })}
                className="mt-1 w-full rounded-md border bg-background p-2"
              >
                <option value="single_elimination">Eliminación simple</option>
                <option value="double_elimination">Doble eliminación</option>
              </select>
            </div>
          </div>

          {/* Solo si hay zonas */}
          {formData.format_config?.format_type === 'groups_playoff' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Número de zonas</Label>
                <Input
                  type="number"
                  min={2}
                  max={8}
                  value={formData.format_config?.num_groups ?? 2}
                  onChange={(e) => setFormData({
                    ...formData,
                    format_config: { ...(formData.format_config || {}), num_groups: parseInt(e.target.value) || 2 },
                  })}
                />
              </div>
              <div>
                <Label>Equipos que avanzan por zona</Label>
                <Input
                  type="number"
                  min={1}
                  max={4}
                  value={formData.format_config?.teams_advance_per_group ?? 2}
                  onChange={(e) => setFormData({
                    ...formData,
                    format_config: { ...(formData.format_config || {}), teams_advance_per_group: parseInt(e.target.value) || 2 },
                  })}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Partidos por serie en Playoffs (Best of)</Label>
              <select
                value={formData.format_config?.playoff_series_length ?? 1}
                onChange={(e) => setFormData({
                  ...formData,
                  format_config: { ...(formData.format_config || {}), playoff_series_length: parseInt(e.target.value) },
                })}
                className="mt-1 w-full rounded-md border bg-background p-2"
              >
                <option value={1}>A partido único</option>
                <option value={3}>Mejor de 3</option>
                <option value={5}>Mejor de 5</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <Switch
                id="third_place"
                checked={!!formData.format_config?.third_place_match}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  format_config: { ...(formData.format_config || {}), third_place_match: checked },
                })}
              />
              <Label htmlFor="third_place">Partido por el 3º puesto</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de equipos */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de equipos</CardTitle>
          <CardDescription>Límites y reglas de inscripción</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="max_teams">Máximo de equipos</Label>
              <Input
                id="max_teams"
                type="number"
                min="2"
                value={formData.max_teams}
                onChange={(e) => setFormData({ ...formData, max_teams: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="players_min">Jugadores mínimo</Label>
              <Input
                id="players_min"
                type="number"
                min="1"
                value={formData.players_per_team_min}
                onChange={(e) => setFormData({ ...formData, players_per_team_min: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="players_max">Jugadores máximo</Label>
              <Input
                id="players_max"
                type="number"
                min="1"
                value={formData.players_per_team_max}
                onChange={(e) => setFormData({ ...formData, players_per_team_max: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="registration_open"
              checked={formData.registration_open}
              onCheckedChange={(checked) => setFormData({ ...formData, registration_open: checked })}
            />
            <Label htmlFor="registration_open">Inscripciones abiertas</Label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="registration_start">Inicio inscripciones</Label>
              <Input
                id="registration_start"
                type="datetime-local"
                value={formData.registration_start}
                onChange={(e) => setFormData({ ...formData, registration_start: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="registration_end">Fin inscripciones</Label>
              <Input
                id="registration_end"
                type="datetime-local"
                value={formData.registration_end}
                onChange={(e) => setFormData({ ...formData, registration_end: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_hidden"
              checked={formData.is_hidden}
              onCheckedChange={(checked) => setFormData({ ...formData, is_hidden: checked })}
            />
            <Label htmlFor="is_hidden">Torneo oculto (solo accesible por link/QR)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Premios */}
      <Card>
        <CardHeader>
          <CardTitle>Premios</CardTitle>
          <CardDescription>Información sobre los premios del torneo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prizes_title">Título de premios</Label>
            <Input
              id="prizes_title"
              value={formData.prizes_title}
              onChange={(e) => setFormData({ ...formData, prizes_title: e.target.value })}
              placeholder="Premios"
            />
          </div>

          <div>
            <Label htmlFor="prizes_description">Descripción de premios</Label>
            <Textarea
              id="prizes_description"
              value={formData.prizes_description}
              onChange={(e) => setFormData({ ...formData, prizes_description: e.target.value })}
              placeholder="🏆 Campeones: 3 remeras + cortes de pelo&#10;🥈 Subcampeones: Vermut&#10;⭐ MVP: Tatuaje"
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reglamento */}
      <Card>
        <CardHeader>
          <CardTitle>Reglamento</CardTitle>
          <CardDescription>Reglas y código de conducta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="rules_url">URL del reglamento (opcional)</Label>
            <Input
              id="rules_url"
              type="url"
              value={formData.rules_url}
              onChange={(e) => setFormData({ ...formData, rules_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="rules_content">Contenido del reglamento</Label>
            <Textarea
              id="rules_content"
              value={formData.rules_content}
              onChange={(e) => setFormData({ ...formData, rules_content: e.target.value })}
              placeholder="Reglas del torneo..."
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      {/* Colores */}
      <Card>
        <CardHeader>
          <CardTitle>Estética</CardTitle>
          <CardDescription>Colores del torneo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="primary_color">Color primario</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accent_color">Color de acento</Label>
              <div className="flex gap-2">
                <Input
                  id="accent_color"
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  placeholder="#ef4444"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Crear torneo' : 'Guardar cambios'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
