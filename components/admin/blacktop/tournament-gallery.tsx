'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import type { TournamentMedia } from '@/types/blacktop';
import { useRouter } from 'next/navigation';

interface TournamentGalleryProps {
  tournamentId: number;
}

export function TournamentGallery({ tournamentId }: TournamentGalleryProps) {
  const router = useRouter();
  const [media, setMedia] = useState<TournamentMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    caption: '',
  });

  useEffect(() => {
    fetchMedia();
  }, [tournamentId]);

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/blacktop/tournaments/${tournamentId}/media`);
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/blacktop/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_id: tournamentId,
          url: formData.url,
          caption: formData.caption || undefined,
          type: 'image',
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ url: '', caption: '' });
        await fetchMedia();
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating media:', error);
    }
  };

  const handleDelete = async (mediaId: number) => {
    if (!confirm('¿Eliminar esta imagen?')) return;

    try {
      const response = await fetch(`/api/blacktop/media?id=${mediaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMedia();
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Galería</CardTitle>
              <CardDescription>
                Fotos y videos del torneo
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar imagen
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="url">URL de la imagen</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Sube la imagen a Supabase Storage o usa una URL externa
                </p>
              </div>

              <div>
                <Label htmlFor="caption">Descripción (opcional)</Label>
                <Input
                  id="caption"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Descripción de la imagen"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Agregar</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {media.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay imágenes en la galería</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square relative bg-muted">
                <img
                  src={item.url}
                  alt={item.caption || 'Imagen del torneo'}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                {item.caption && (
                  <p className="text-sm text-muted-foreground mb-2">{item.caption}</p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
