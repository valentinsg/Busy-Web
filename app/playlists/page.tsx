'use client'

import { PlaylistCard } from '@/components/playlists/playlist-card'
import { Button } from '@/components/ui/button'
import { getPublishedPlaylists } from '@/lib/repo/playlists'
import type { Playlist } from '@/types/blog'
import { motion } from 'framer-motion'
import { Mail, Music2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await getPublishedPlaylists()
        if (mounted) {
          setPlaylists(data)
        }
      } catch (error) {
        console.error('Error loading playlists:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-purple-950/20 to-black py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('/pattern-black.jpg')] opacity-10" />
        
        <div className="container relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-purple-600/20 mb-6">
              <Music2 className="h-8 w-8 text-purple-400" />
            </div>
            
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Nuestras Playlists
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Música cuidadosamente seleccionada para acompañar tu estilo de vida. 
              Actualizamos nuestras playlists cada semana con los mejores tracks del momento 
              y clásicos que nunca pasan de moda.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold"
              >
                <a
                  href="https://open.spotify.com/user/busyclothing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Music2 className="h-5 w-5" />
                  Seguinos en Spotify
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Playlists Grid */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : playlists.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {playlists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PlaylistCard playlist={playlist} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <Music2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                Próximamente nuevas playlists...
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section for Artists */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-purple-950/20 to-black py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/pattern-black.jpg')] opacity-10" />
        
        <div className="container relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              ¿Sos artista?
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8">
              Si querés que tu música forme parte de nuestras playlists, 
              envianos tu propuesta. Estamos siempre buscando nuevos talentos 
              para compartir con nuestra comunidad.
            </p>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="font-semibold"
            >
              <a
                href="/contact"
                className="flex items-center gap-2"
              >
                <Mail className="h-5 w-5" />
                Contactanos
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
