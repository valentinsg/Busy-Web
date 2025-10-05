import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      artist_name,
      email,
      phone,
      spotify_artist_url,
      track_url,
      genre,
      social_instagram,
      social_youtube,
      message,
    } = body

    // Validate required fields
    if (!artist_name || !email || !track_url || !message) {
      return NextResponse.json(
        { ok: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validate artist name
    const trimmedName = artist_name.trim()
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json(
        { ok: false, error: 'El nombre artístico debe tener entre 2 y 100 caracteres' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validate phone if provided
    if (phone && phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/
      if (!phoneRegex.test(phone.trim())) {
        return NextResponse.json(
          { ok: false, error: 'Número de teléfono inválido' },
          { status: 400 }
        )
      }
    }

    // Validate track URL
    try {
      const trackUrl = new URL(track_url)
      const validDomains = ['spotify.com', 'soundcloud.com', 'youtube.com', 'youtu.be', 'bandcamp.com', 'audiomack.com']
      const isValidDomain = validDomains.some(domain => trackUrl.hostname.includes(domain))
      if (!isValidDomain) {
        return NextResponse.json(
          { ok: false, error: 'El link del track debe ser de una plataforma válida (Spotify, SoundCloud, YouTube, Bandcamp, Audiomack)' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { ok: false, error: 'URL del track inválida' },
        { status: 400 }
      )
    }

    // Validate Spotify URL if provided
    if (spotify_artist_url && spotify_artist_url.trim()) {
      try {
        const spotifyUrl = new URL(spotify_artist_url)
        if (!spotifyUrl.hostname.includes('spotify.com')) {
          return NextResponse.json(
            { ok: false, error: 'La URL de Spotify debe ser de open.spotify.com' },
            { status: 400 }
          )
        }
      } catch {
        return NextResponse.json(
          { ok: false, error: 'URL de Spotify inválida' },
          { status: 400 }
        )
      }
    }

    // Validate Instagram username if provided
    if (social_instagram && social_instagram.trim()) {
      const igRegex = /^@?[\w](?!.*?\.{2})[\w.]{1,28}[\w]$/
      const igUsername = social_instagram.replace('@', '')
      if (!igRegex.test(igUsername)) {
        return NextResponse.json(
          { ok: false, error: 'Usuario de Instagram inválido' },
          { status: 400 }
        )
      }
    }

    // Validate message length and content
    const trimmedMessage = message.trim()
    if (trimmedMessage.length < 50 || trimmedMessage.length > 1000) {
      return NextResponse.json(
        { ok: false, error: 'El mensaje debe tener entre 50 y 1000 caracteres' },
        { status: 400 }
      )
    }

    // Validate message has real content (not just repeated characters)
    const uniqueChars = new Set(trimmedMessage.toLowerCase().replace(/\s/g, ''))
    if (uniqueChars.size < 10) {
      return NextResponse.json(
        { ok: false, error: 'El mensaje debe contener contenido real' },
        { status: 400 }
      )
    }

    // Validate genre if provided
    if (genre && genre.trim().length > 50) {
      return NextResponse.json(
        { ok: false, error: 'El género no puede superar 50 caracteres' },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()

    // Insert submission
    const { data, error } = await supabase
      .from('artist_submissions')
      .insert([
        {
          artist_name,
          email,
          phone: phone || null,
          spotify_artist_url: spotify_artist_url || null,
          track_url,
          genre: genre || null,
          social_instagram: social_instagram || null,
          social_youtube: social_youtube || null,
          message,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error inserting artist submission:', error)
      return NextResponse.json(
        { ok: false, error: 'Error al guardar la propuesta' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    console.error('Error in artist-submissions API:', error)
    return NextResponse.json(
      { ok: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
