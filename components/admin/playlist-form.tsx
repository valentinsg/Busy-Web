'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { Playlist } from '@/types/playlists'
import { supabase } from '@/lib/supabase/client'
import Image from 'next/image'

interface PlaylistFormProps {
  playlist?: Playlist
  mode: 'create' | 'edit'
}

export function PlaylistForm({ playlist, mode }: PlaylistFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB')
      return
    }

    setIsUploading(true)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${formData.slug || Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `playlists/${fileName}`

      console.log('Uploading to:', filePath)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('Supabase storage error:', error)
        throw new Error(`Error de Supabase: ${error.message}`)
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      console.log('Public URL:', publicUrl)

      // Update form data with the new image URL
      setFormData((prev) => ({ ...prev, cover_image: publicUrl }))
      alert('Imagen subida exitosamente!')
    } catch (error) {
      console.error('Error uploading image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al subir la imagen: ${errorMessage}\n\nAsegúrate de que el bucket 'media' existe en Supabase Storage y tiene permisos públicos.`)
    } finally {
      setIsUploading(false)
      // Reset the input
      e.target.value = ''
    }
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

      console.log('Saving playlist:', formData)

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      console.log('Response:', data)

      if (data.ok) {
        alert('Playlist guardada exitosamente!')
        router.push('/admin/playlists')
        router.refresh()
      } else {
        const errorMsg = data.error || 'Error desconocido'
        console.error('Error from API:', errorMsg)
        alert(`Error al guardar la playlist: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Error saving playlist:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al guardar la playlist: ${errorMsg}`)
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

        <div className="grid gap-2">
          <Label htmlFor="cover_image">Imagen de portada (URL o ruta pública)</Label>
          
          <div className="flex items-center gap-2">
            <Input
              id="cover_image"
              name="cover_image"
              type="url"
              value={formData.cover_image}
              onChange={handleChange}
              placeholder="/playlists/portada.jpg"
              disabled={isUploading}
            />
            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
            <label
              htmlFor="cover-upload"
              className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isUploading
                  ? 'opacity-50 cursor-not-allowed bg-muted'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {isUploading ? 'Subiendo...' : 'Subir'}
            </label>
          </div>

          {/* Preview de la imagen */}
          {formData.cover_image && (
            <div className="text-xs text-muted-foreground">Vista previa:</div>
          )}
          {formData.cover_image && (
            <Image
              src={formData.cover_image}
              alt="Portada de la playlist"
              width={448}
              height={112}
              className="h-28 w-auto rounded border"
            />
          )}
        </div>

        <div>
          <Label htmlFor="genre">Género</Label>
          <Input
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
