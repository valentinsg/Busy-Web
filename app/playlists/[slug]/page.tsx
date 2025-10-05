import { Button } from '@/components/ui/button'
import { getPlaylistBySlug } from '@/lib/repo/playlists'
import { PlaylistDetailWrapper } from '@/components/playlists/playlist-detail-wrapper'
import { ArrowLeft, ExternalLink, Music2 } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PlaylistDetailPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PlaylistDetailPageProps): Promise<Metadata> {
  const playlist = await getPlaylistBySlug(params.slug)

  if (!playlist) {
    return {
      title: 'Playlist no encontrada | Busy Streetwear',
    }
  }

  const keywords = ['playlist', 'spotify', playlist.title, 'música', 'busy', 'streetwear']
  if (playlist.genre) keywords.push(playlist.genre)

  return {
    title: `${playlist.title}`,
    description: playlist.description,
    keywords,
    openGraph: {
      title: `${playlist.title}`,
      description: playlist.description,
      type: 'music.playlist',
      url: `https://busyclothing.com.ar/playlists/${playlist.slug}`,
      images: playlist.cover_image ? [{ url: playlist.cover_image, width: 1200, height: 630, alt: playlist.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${playlist.title}`,
      description: playlist.description,
      images: playlist.cover_image ? [playlist.cover_image] : [],
    },
  }
}

export default async function PlaylistDetailPage({ params }: PlaylistDetailPageProps) {
  const playlist = await getPlaylistBySlug(params.slug)

  if (!playlist) {
    notFound()
  }

  // Format: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
  const playlistId = playlist.spotify_url.split('/playlist/')[1]?.split('?')[0]

  return (
    <PlaylistDetailWrapper>
      <div className="min-h-screen bg-black font-body py-8 sm:py-14 md:py-18 lg:py-18">
      {/* Header */}
      <div className="backdrop-blur-md sticky top-0 z-10">
        <div className="container px-4 sm:px-6 py-4 sm:py-8">
          <Link href="/playlists">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#1DB954]/30 hover:bg-[#1DB954]/10 hover:border-[#1DB954] hover:text-[#1DB954] transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg text-xs sm:text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Volver a Playlists</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Playlist Info & Player */}
      <section>
        <div className="container px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Playlist Header */}
            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 mb-8 sm:mb-12">
              {/* Cover Image - Clickeable para abrir en Spotify */}
              {playlist.cover_image && (
                <a
                  href={playlist.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-full md:w-48 lg:w-64 aspect-square rounded-2xl overflow-hidden shadow-2xl ring-2 ring-[#1DB954]/20 hover:ring-[#1DB954]/40 transition-all duration-300 cursor-pointer group"
                >
                  <Image
                    src={playlist.cover_image}
                    alt={playlist.title}
                    fill
                    className="object-cover transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Indicador de click */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                    <ExternalLink className="h-12 w-12 text-[#1DB954]" />
                  </div>
                </a>
              )}

              {/* Info */}
              <div className="flex-1 flex flex-col justify-center">
                {playlist.genre && (
                  <span className="inline-block w-fit px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-full bg-[#1DB954]/20 text-[#1DB954] mb-3 sm:mb-4 border border-[#1DB954]/30">
                    {playlist.genre}
                  </span>
                )}

                <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-[#1DB954] to-white bg-clip-text text-transparent">
                  {playlist.title}
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  {playlist.description}
                </p>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="w-full sm:w-auto bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-md hover:shadow-xl"
                  >
                    <a
                      href={playlist.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                      Abrir en Spotify
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Spotify Embed Player */}
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-2 ring-[#1DB954]/20 bg-gradient-to-br from-[#1DB954]/5 via-black to-[#1DB954]/5 p-1 hover:ring-[#1DB954]/40 transition-all duration-300">
              <div className="rounded-xl overflow-hidden bg-black/50 backdrop-blur-sm">
                {playlistId ? (
                  <iframe
                    src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="380"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-xl sm:h-[450px] md:h-[500px] lg:h-[600px]"
                  />
                ) : (
                  <div className="h-[380px] sm:h-[450px] md:h-[500px] lg:h-[600px] flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <Music2 className="h-12 w-12 sm:h-16 sm:w-16 text-[#1DB954]/50" />
                    <p className="text-sm sm:text-base">No se pudo cargar el reproductor de Spotify</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1DB954]/10 to-transparent border border-[#1DB954]/20 hover:border-[#1DB954]/40 transition-all duration-300">
              <h2 className="font-heading text-lg sm:text-xl font-bold mb-2 sm:mb-3 flex items-center gap-2">
                <Music2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#1DB954]" />
                Sobre esta playlist
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Esta playlist es parte de nuestra colección curada de música para acompañar tu estilo de vida.
                Actualizamos regularmente con nuevos tracks y clásicos que nunca pasan de moda.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </PlaylistDetailWrapper>
  )
}

