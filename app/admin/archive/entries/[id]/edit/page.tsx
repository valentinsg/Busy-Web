'use client';

import { AdminGuard } from '@/components/admin/admin-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ExternalLink, Save } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Convert R2 URLs to proxy URLs */
function getProxyUrl(url: string | null): string {
  if (!url) return '';
  const r2Match = url.match(/https:\/\/[^/]+\.r2\.dev\/(.+)/);
  if (r2Match) return `/api/archive/image/${r2Match[1]}`;
  return url;
}

interface ArchiveEntry {
  id: string;
  title: string | null;
  microcopy: string | null;
  mood: string[];
  tags: string[];
  place: string | null;
  person: string | null;
  is_public: boolean;
  thumb_url: string;
  medium_url: string;
  full_url: string;
  colors: string[];
  likes: number;
  views: number;
  created_at: string;
}

export default function EditArchiveEntryPage() {
  return (
    <AdminGuard>
      <EditArchiveEntry />
    </AdminGuard>
  );
}

function EditArchiveEntry() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const entryId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [entry, setEntry] = useState<ArchiveEntry | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [microcopy, setMicrocopy] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState('');
  const [place, setPlace] = useState('');
  const [person, setPerson] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (!entryId) return;

    const fetchEntry = async () => {
      try {
        const res = await fetch(`/api/archive/${entryId}`);
        if (!res.ok) {
          throw new Error('No se pudo cargar la entrada');
        }
        const data = await res.json();
        setEntry(data);

        // Populate form
        setTitle(data.title || '');
        setMicrocopy(data.microcopy || '');
        setMood(data.mood?.join(', ') || '');
        setTags(data.tags?.join(', ') || '');
        setPlace(data.place || '');
        setPerson(data.person || '');
        setIsPublic(data.is_public ?? true);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.message || 'No se pudo cargar la entrada',
          variant: 'destructive',
        });
        router.push('/admin/archive/entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [entryId, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await fetch(`/api/archive/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          microcopy,
          mood,
          tags,
          place,
          person,
          is_public: isPublic,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'No se pudo guardar');
      }

      toast({
        title: 'Guardado',
        description: 'Los cambios fueron guardados correctamente.',
      });

      router.push('/admin/archive/entries');
    } catch (error: any) {
      toast({
        title: 'Error al guardar',
        description: error?.message || 'No se pudieron guardar los cambios',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner text="Cargando entrada..." />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Entrada no encontrada</p>
        <Link href="/admin/archive/entries">
          <Button variant="outline" className="mt-4">
            Volver
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 font-body">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/archive/entries">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-heading font-semibold tracking-tight sm:text-2xl">
              Editar entrada
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              ID: {entry.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <Link href={`/archive/${entry.id}`} target="_blank">
          <Button variant="outline" size="sm" className="gap-1 font-body">
            <ExternalLink className="h-3.5 w-3.5" /> Ver público
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Form */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-heading">Metadatos</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nombre de la imagen"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="microcopy">Microcopy (descripción)</Label>
                <Textarea
                  id="microcopy"
                  value={microcopy}
                  onChange={(e) => setMicrocopy(e.target.value)}
                  placeholder="Una línea que capture el momento Busy."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mood">Mood (separado por comas)</Label>
                  <Input
                    id="mood"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="noche, ciudad, amigos"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separado por comas)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="drop, backstage, torneo"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="place">Lugar</Label>
                  <Input
                    id="place"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="Mar del Plata, Buenos Aires..."
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="person">Persona / Equipo</Label>
                  <Input
                    id="person"
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    placeholder="Valentín, Busy Blacktop..."
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="is_public" className="font-medium">
                    Entrada pública
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Si está desactivada, no aparece en el archivo público.
                  </p>
                </div>
                <Switch
                  id="is_public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 gap-2 font-body sm:flex-none"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Link href="/admin/archive/entries" className="sm:ml-auto">
                  <Button type="button" variant="outline" className="w-full font-body">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-heading">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={getProxyUrl(entry.medium_url || entry.thumb_url)}
                  alt={title || 'Busy Archive'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Color palette */}
              {entry.colors?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Paleta de colores
                  </p>
                  <div className="flex gap-1.5">
                    {entry.colors.slice(0, 5).map((color, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-full border border-white/10"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-lg font-semibold">{entry.likes}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-lg font-semibold">{entry.views}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
