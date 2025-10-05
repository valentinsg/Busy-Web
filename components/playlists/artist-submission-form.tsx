'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Music2, Send, CheckCircle2, Instagram, Youtube } from 'lucide-react'

export function ArtistSubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    artist_name: '',
    email: '',
    phone: '',
    spotify_artist_url: '',
    track_url: '',
    genre: '',
    social_instagram: '',
    social_youtube: '',
    message: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function validateForm(): string | null {
    // Validar nombre artístico
    if (formData.artist_name.trim().length < 2) {
      return 'El nombre artístico debe tener al menos 2 caracteres'
    }
    if (formData.artist_name.trim().length > 100) {
      return 'El nombre artístico no puede superar 100 caracteres'
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Por favor ingresa un email válido'
    }

    // Validar teléfono si se proporciona
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/
      if (!phoneRegex.test(formData.phone.trim())) {
        return 'Por favor ingresa un número de teléfono válido'
      }
    }

    // Validar URL del track
    if (!formData.track_url.trim()) {
      return 'Debes proporcionar el link de tu track'
    }
    try {
      const trackUrl = new URL(formData.track_url)
      const validDomains = ['spotify.com', 'soundcloud.com', 'youtube.com', 'youtu.be', 'bandcamp.com', 'audiomack.com']
      const isValidDomain = validDomains.some(domain => trackUrl.hostname.includes(domain))
      if (!isValidDomain) {
        return 'El link del track debe ser de Spotify, SoundCloud, YouTube, Bandcamp o Audiomack'
      }
    } catch {
      return 'Por favor ingresa una URL válida para tu track'
    }

    // Validar URL de Spotify si se proporciona
    if (formData.spotify_artist_url && formData.spotify_artist_url.trim()) {
      try {
        const spotifyUrl = new URL(formData.spotify_artist_url)
        if (!spotifyUrl.hostname.includes('spotify.com')) {
          return 'La URL de Spotify debe ser de open.spotify.com'
        }
      } catch {
        return 'Por favor ingresa una URL válida de Spotify'
      }
    }

    // Validar Instagram si se proporciona
    if (formData.social_instagram && formData.social_instagram.trim()) {
      const igRegex = /^@?[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/
      const igUsername = formData.social_instagram.replace('@', '')
      if (!igRegex.test(igUsername)) {
        return 'Por favor ingresa un usuario válido de Instagram'
      }
    }

    // Validar mensaje
    if (formData.message.trim().length < 50) {
      return 'El mensaje debe tener al menos 50 caracteres'
    }
    if (formData.message.trim().length > 1000) {
      return 'El mensaje no puede superar 1000 caracteres'
    }

    // Validar que el mensaje tenga contenido real (no solo espacios o caracteres repetidos)
    const uniqueChars = new Set(formData.message.trim().toLowerCase().replace(/\s/g, ''))
    if (uniqueChars.size < 10) {
      return 'Por favor escribe un mensaje con contenido real'
    }

    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validar formulario
    const validationError = validateForm()
    if (validationError) {
      alert(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/artist-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.ok) {
        setIsSuccess(true)
        setFormData({
          artist_name: '',
          email: '',
          phone: '',
          spotify_artist_url: '',
          track_url: '',
          genre: '',
          social_instagram: '',
          social_youtube: '',
          message: '',
        })
        
        // Reset success message after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000)
      } else {
        alert(`Error: ${data.error || 'No se pudo enviar la propuesta'}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error al enviar la propuesta. Por favor, intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-2xl p-8 bg-gradient-to-br from-green-950/20 to-transparent border border-green-500/30 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="font-heading text-2xl font-bold mb-2">
          ¡Propuesta Enviada!
        </h3>
        <p className="text-muted-foreground">
          Gracias por tu interés. Revisaremos tu propuesta y nos pondremos en contacto pronto.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Artist Name */}
        <div className="space-y-2">
          <Label htmlFor="artist_name" className="text-sm font-semibold">
            Nombre Artístico *
          </Label>
          <Input
            id="artist_name"
            name="artist_name"
            value={formData.artist_name}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={100}
            placeholder="Tu nombre artístico o de banda"
            className="bg-white/5 border-white/10 focus:border-[#1DB954]"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold">
            Email *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
            placeholder="artista@email.com"
            className="bg-white/5 border-white/10 focus:border-[#1DB954]"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold">
            Teléfono
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            pattern="[\d\s\-\+\(\)]{8,20}"
            placeholder="+54 9 11 1234-5678"
            className="bg-white/5 border-white/10 focus:border-[#1DB954]"
          />
        </div>

        {/* Genre */}
        <div className="space-y-2">
          <Label htmlFor="genre" className="text-sm font-semibold">
            Género Musical
          </Label>
          <Input
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            maxLength={50}
            placeholder="Hip Hop, Trap, R&B, etc."
            className="bg-white/5 border-white/10 focus:border-[#1DB954]"
          />
        </div>

        {/* Spotify Artist URL */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="spotify_artist_url" className="text-sm font-semibold">
            Perfil de Artista en Spotify
          </Label>
          <Input
            id="spotify_artist_url"
            name="spotify_artist_url"
            type="url"
            value={formData.spotify_artist_url}
            onChange={handleChange}
            placeholder="https://open.spotify.com/artist/..."
            className="bg-white/5 border-white/10 focus:border-[#1DB954]"
            title="URL de tu perfil de artista en Spotify"
          />
        </div>

        {/* Track URL */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="track_url" className="text-sm font-semibold">
            Link de tu Track *
          </Label>
          <Input
            id="track_url"
            name="track_url"
            type="url"
            value={formData.track_url}
            onChange={handleChange}
            required
            placeholder="https://open.spotify.com/track/... o SoundCloud, YouTube, etc."
            className="bg-white/5 border-white/10 focus:border-[#1DB954]"
            title="URL de Spotify, SoundCloud, YouTube, Bandcamp o Audiomack"
          />
          <p className="text-xs text-muted-foreground">
            Comparte el link de la canción que te gustaría que consideremos
          </p>
        </div>

        {/* Instagram */}
        <div className="space-y-2">
          <Label htmlFor="social_instagram" className="text-sm font-semibold flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            Instagram
          </Label>
          <Input
            id="social_instagram"
            name="social_instagram"
            value={formData.social_instagram}
            onChange={handleChange}
            pattern="@?[\w](?!.*?\.{2})[\w.]{1,28}[\w]"
            placeholder="@tuusuario"
            className="bg-white/5 border-white/10 focus:border-[#1DB954]"
            title="Usuario de Instagram sin espacios"
          />
        </div>

        {/* YouTube */}
        <div className="space-y-2">
          <Label htmlFor="social_youtube" className="text-sm font-semibold flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            YouTube
          </Label>
          <Input
            id="social_youtube"
            name="social_youtube"
            value={formData.social_youtube}
            onChange={handleChange}
            placeholder="@tucanal o https://youtube.com/@tucanal"
            className="bg-white/5 border-white/10 focus:border-[#1DB954]"
          />
        </div>

        {/* Message */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="message" className="text-sm font-semibold">
            Cuéntanos sobre tu música *
          </Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            minLength={50}
            maxLength={1000}
            rows={5}
            placeholder="Háblanos sobre tu estilo, influencias, y por qué tu música encajaría en nuestras playlists..."
            className="bg-white/5 border-white/10 focus:border-[#1DB954] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Mínimo 50 caracteres
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-md hover:shadow-xl"
      >
        {isSubmitting ? (
          <>
            <Music2 className="h-5 w-5 mr-2 animate-pulse" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Enviar Propuesta
          </>
        )}
      </Button>
    </form>
  )
}
