'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { PlayoffFormat, Tournament, TournamentFormData, TournamentFormatType } from '@/types/blacktop';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface TournamentFormProps {
  tournament?: Tournament;
  mode: 'create' | 'edit';
}

export function TournamentForm({ tournament, mode }: TournamentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(tournament?.banner_url || null);
  const [flyerFiles, setFlyerFiles] = useState<File[]>([]);
  const [flyerPreviews, setFlyerPreviews] = useState<string[]>(tournament?.flyer_images || []);

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

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Solo se permiten imágenes',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'La imagen debe pesar menos de 5MB',
        variant: 'destructive',
      });
      return;
    }

    setBannerFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validar cada archivo
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Solo se permiten imágenes',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Cada imagen debe pesar menos de 5MB',
          variant: 'destructive',
        });
        return;
      }
    }

    // Agregar nuevos archivos
    setFlyerFiles(prev => [...prev, ...files]);

    // Crear previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFlyerPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFlyer = (index: number) => {
    setFlyerFiles(prev => prev.filter((_, i) => i !== index));
    setFlyerPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Si hay banner, subirlo primero
      let bannerUrl = formData.banner_url || tournament?.banner_url;

      if (bannerFile) {
        const bannerFormData = new FormData();
        bannerFormData.append('file', bannerFile);
        bannerFormData.append('bucket', 'blacktop-banners');

        // Obtener token de sesión
        const { supabase } = await import('@/lib/supabase/client');
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error('No estás autenticado');
        }

        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: bannerFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Error al subir el banner');
        }

        const uploadData = await uploadResponse.json();
        bannerUrl = uploadData.url;
      }

      // Subir flyers si hay nuevos
      let flyerUrls = tournament?.flyer_images || [];

      if (flyerFiles.length > 0) {
        const { supabase } = await import('@/lib/supabase/client');
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error('No estás autenticado');
        }

        // Subir cada flyer
        const uploadPromises = flyerFiles.map(async (file) => {
          const flyerFormData = new FormData();
          flyerFormData.append('file', file);
          flyerFormData.append('bucket', 'blacktop-banners');

          const uploadResponse = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: flyerFormData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Error al subir flyer');
          }

          const uploadData = await uploadResponse.json();
          return uploadData.url;
        });

        const newFlyerUrls = await Promise.all(uploadPromises);
        flyerUrls = [...flyerUrls, ...newFlyerUrls];
      } else {
        // Mantener solo los previews que no son archivos nuevos
        flyerUrls = flyerPreviews.filter(preview => preview.startsWith('http'));
      }

      const url = mode === 'create'
        ? '/api/blacktop/tournaments'
        : `/api/blacktop/tournaments/${tournament?.id}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          banner_url: bannerUrl,
          flyer_images: flyerUrls,
          // Propagar columnas directas si existen en la tabla
          format_type: formData.format_config?.format_type as TournamentFormatType,
          num_groups: formData.format_config?.num_groups,
          teams_advance_per_group: formData.format_config?.teams_advance_per_group,
          playoff_format: formData.format_config?.playoff_format as PlayoffFormat,
          third_place_match: formData.format_config?.third_place_match,
          playoff_period_duration_minutes: (formData as any).playoff_period_duration_minutes,
          playoff_periods_count: (formData as any).playoff_periods_count,
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

      {/* Configuración de tiempo */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de tiempo</CardTitle>
          <CardDescription>Duración de períodos y reglas de desempate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="period_duration">Duración del período (minutos)</Label>
              <Input
                id="period_duration"
                type="number"
                min="1"
                value={(formData as any).period_duration_minutes || 8}
                onChange={(e) => setFormData({ ...formData, period_duration_minutes: parseInt(e.target.value) } as any)}
                placeholder="8"
              />
              <p className="text-sm text-muted-foreground mt-1">Ej: 8 para partidos de 2x8</p>
            </div>

            <div>
              <Label htmlFor="periods_count">Cantidad de períodos</Label>
              <Input
                id="periods_count"
                type="number"
                min="1"
                value={(formData as any).periods_count || 2}
                onChange={(e) => setFormData({ ...formData, periods_count: parseInt(e.target.value) } as any)}
                placeholder="2"
              />
              <p className="text-sm text-muted-foreground mt-1">Ej: 2 para dos tiempos</p>
            </div>
          </div>

          {/* Configuración específica para Playoffs */}
          <div className="mt-4 border-t border-border pt-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Playoffs (opcional)
            </p>
            <p className="text-xs text-muted-foreground">
              Si dejás estos campos vacíos, los playoffs usan la misma duración y cantidad de períodos que la fase de grupos.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="playoff_period_duration">Duración del período en Playoffs (minutos)</Label>
                <Input
                  id="playoff_period_duration"
                  type="number"
                  min="1"
                  value={(formData as any).playoff_period_duration_minutes ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                    setFormData({ ...formData, playoff_period_duration_minutes: value } as any);
                  }}
                  placeholder={(formData as any).period_duration_minutes || 8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ej: 10 para que los partidos de playoffs sean más largos.
                </p>
              </div>

              <div>
                <Label htmlFor="playoff_periods_count">Cantidad de períodos en Playoffs</Label>
                <Input
                  id="playoff_periods_count"
                  type="number"
                  min="1"
                  value={(formData as any).playoff_periods_count ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                    setFormData({ ...formData, playoff_periods_count: value } as any);
                  }}
                  placeholder={(formData as any).periods_count || 2}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Si lo dejás vacío, se usa la misma cantidad que en grupos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="golden_point"
              checked={(formData as any).golden_point_enabled || false}
              onCheckedChange={(checked) => setFormData({ ...formData, golden_point_enabled: checked } as any)}
            />
            <div>
              <Label htmlFor="golden_point">Punto de Oro (Golden Point)</Label>
              <p className="text-sm text-muted-foreground">
                Si está habilitado, en caso de empate al finalizar el tiempo se juega muerte súbita: el próximo punto gana
              </p>
            </div>
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
          <CardDescription>Colores y banner del torneo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Banner */}
          <div>
            <Label>Banner del torneo</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Imagen que se mostrará en el header del torneo (recomendado: 1920x600px)
            </p>

            {bannerPreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                <Image
                  src={bannerPreview}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveBanner}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent-brand/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click para subir</span> o arrastra aquí
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG o WEBP (máx. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleBannerChange}
                  disabled={loading}
                />
              </label>
            )}
          </div>

          {/* Flyers para carousel */}
          <div>
            <Label>Flyers del torneo (Carousel)</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Imágenes que se mostrarán en el formulario de inscripción (recomendado: 1080x1350px - formato Instagram)
            </p>

            {/* Grid de previews */}
            {flyerPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {flyerPreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-[4/5] rounded-lg overflow-hidden border border-border group">
                    <Image
                      src={preview}
                      alt={`Flyer ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFlyer(index)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-xs font-medium">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botón para agregar más */}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent-brand/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="mb-1 text-sm text-muted-foreground">
                  <span className="font-semibold">Click para agregar flyers</span>
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG o WEBP (máx. 5MB cada uno)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFlyerChange}
                disabled={loading}
              />
            </label>
          </div>

          {/* Colores */}
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
