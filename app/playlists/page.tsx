import { ArtistSubmissionForm } from '@/components/playlists/artist-submission-form'
import { PlaylistCardWrapper } from '@/components/playlists/playlist-card-wrapper'
import { Button } from '@/components/ui/button'
import { getPublishedPlaylists } from '@/lib/repo/playlists'
import { Music2, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Playlists',
  description: 'Con nuestras playlists queremos compartir lo que mas nos gusta de la cultura urbana. Actualizadas y curadas semanalmente, vamos a ayudar y posicionar artistas emergentes desde nuestro espacio.',
  keywords: ['playlists', 'spotify', 'música', 'hip hop', 'trap', 'r&b', 'busy', 'streetwear', 'cultura urbana', ],
  openGraph: {
    title: 'Playlists',
    description: 'Con nuestras playlists queremos compartir lo que mas nos gusta de la cultura urbana. Actualizadas y curadas semanalmente, vamos a ayudar y posicionar artistas emergentes desde nuestro espacio.',
    type: 'website',
    url: 'https://busyclothing.com.ar/playlists',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playlists',
    description: 'Con nuestras playlists queremos compartir lo que mas nos gusta de la cultura urbana. Actualizadas y curadas semanalmente, vamos a ayudar y posicionar artistas emergentes desde nuestro espacio.',
  },
}

export default async function PlaylistsPage() {
  const playlists = await getPublishedPlaylists()

  return (
    <div className="min-h-screen bg-black font-body overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-[#1DB954]/10 to-black py-20 sm:py-20 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('/backgrounds/pattern-black.jpg')] opacity-10" />

        <div className="container relative z-0 px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo Busy Verde */}
            <div className="mb-1 sm:mb-1 flex justify-center">
              <div className="relative">
                <Image
                  src="/logo-busy-white.png"
                  alt="Busy Playlists"
                  width={120}
                  height={120}
                  unoptimized
                  className="object-contain sm:w-[120px] sm:h-[120px]"
                  style={{ filter: 'brightness(0) saturate(100%) invert(65%) sepia(89%) saturate(2476%) hue-rotate(92deg) brightness(95%) contrast(80%)' }}
                />
              </div>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-3 bg-gradient-to-r from-white via-[#1DB954] to-white bg-clip-text text-transparent px-4">
              Nuestras Playlists
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-6 leading-relaxed px-4">
              Actualizamos y curamos nuestras playlists todas las semanas.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold"
              >
                <a
                  href={process.env.NEXT_PUBLIC_SPOTIFY_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Music2 className="h-5 w-5" />
                  Seguinos en Spotify
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Playlists Grid */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-24">
        <div className="container px-4 sm:px-6">
          {playlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {playlists.map((playlist, index) => (
                <PlaylistCardWrapper key={playlist.id} playlist={playlist} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <Music2 className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-base sm:text-lg px-4">
                Próximamente nuevas playlists...
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section for Artists */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-[#1DB954]/10 to-black py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="absolute inset-0 bg-[url('/backgrounds/pattern-black.jpg')] opacity-10" />

        <div className="container relative z-0 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <div className="inline-flex items-center justify-center p-2.5 sm:p-3 mb-4 sm:mb-6">
                <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-[#1DB954]" />
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                ¿Sos artista o tenes una banda?
              </h2>

              <p className="text-muted-foreground text-base sm:text-lg px-4">
                Si querés que tu música esté en alguna de nuestras playlists,
                completá el formulario.
                <br />
                Desde nuestro espacio en Busy
                queremos ayudar talentos a crecer y posicionarse.
              </p>
            </div>

            {/* Form */}
            <div className="rounded-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#1DB954]/5 via-black to-[#1DB954]/5 border border-[#1DB954]/20 shadow-2xl hover:border-[#1DB954]/40 transition-all duration-300">
              <ArtistSubmissionForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
