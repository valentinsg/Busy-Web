'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { Playlist } from '@/types/blog'

interface PlaylistFormProps {
  playlist?: Playlist
  mode: 'create' | 'edit'
}

export function PlaylistForm({ playlist, mode }: PlaylistFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    slug: playlist?.slug || '',
    title: playlist?.title || '',
    description: playlist?.description || '',
    spotify_url: playlist?.spotify_url || '',
    cover_image: playlist?.cover_image || '',
    genre: playlist?.genre || '',
    is_published: playlist?.is_published ?? true,
    order_index: playlist?.order_index ?? 0,
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSwitchChange(checked: boolean) {
    setFormData((prev) => ({ ...prev, is_published: checked }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url =
        mode === 'create'
          ? '/api/playlists'
          : `/api/playlists/${playlist?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.ok) {
        router.push('/admin/playlists')
        router.refresh()
      } else {
        alert('Error al guardar la playlist')
      }
    } catch (error) {
      console.error('Error saving playlist:', error)
      alert('Error al guardar la playlist')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Ej: Hip Hop Old School"
          />
        </div>

        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder="Ej: hip-hop-old-school"
            pattern="[a-z0-9-]+"
            title="Solo minúsculas, números y guiones"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Solo minúsculas, números y guiones. Se usa en la URL.
          </p>
        </div>

        <div>
          <Label htmlFor="description">Descripción *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe la playlist..."
          />
        </div>

        <div>
          <Label htmlFor="spotify_url">URL de Spotify *</Label>
          <Input
            id="spotify_url"
            name="spotify_url"
            type="url"
            value={formData.spotify_url}
            onChange={handleChange}
            required
            placeholder="https://open.spotify.com/playlist/..."
          />
        </div>

        <div>
          <Label htmlFor="cover_image">Imagen de portada (URL)</Label>
          <Input
            id="cover_image"
            name="cover_image"
            type="url"
            value={formData.cover_image}
            onChange={handleChange}
            placeholder="https://..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Opcional. Si no se proporciona, se mostrará un ícono por defecto.
          </p>
        </div>

        <div>
          <Label htmlFor="genre">Género</Label>
          <Input
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            placeholder="Ej: Hip Hop, Trap, etc."
          />
        </div>

        <div>
          <Label htmlFor="order_index">Orden</Label>
          <Input
            id="order_index"
            name="order_index"
            type="number"
            value={formData.order_index}
            onChange={handleChange}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Número menor aparece primero. Por defecto es 0.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_published"
            checked={formData.is_published}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="is_published">Publicada</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Guardando...'
            : mode === 'create'
            ? 'Crear playlist'
            : 'Guardar cambios'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/playlists')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
