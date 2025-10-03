import type { Playlist } from '@/types/blog'
import { Music2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface PlaylistCardProps {
  playlist: Playlist
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <div className="group relative rounded-2xl p-[4px] bg-gradient-to-br from-white/45 via-white/20 to-transparent shadow-[0_0_50px_rgba(35,35,35,0.3)] ring-2 ring-white/30 transition-all duration-300 hover:shadow-[0_0_70px_rgba(35,35,35,0.5)]">
      {/* Soft external glow */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />

      {/* Subtle inner border */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15" />

      {/* Corner accents */}
      <span className="pointer-events-none absolute top-3 left-3 h-px w-8 bg-white/40" />
      <span className="pointer-events-none absolute top-3 left-3 h-8 w-px bg-white/40" />
      <span className="pointer-events-none absolute top-3 right-3 h-px w-8 bg-white/40" />
      <span className="pointer-events-none absolute top-3 right-3 h-8 w-px bg-white/40" />
      <span className="pointer-events-none absolute bottom-3 left-3 h-px w-8 bg-white/30" />
      <span className="pointer-events-none absolute bottom-3 left-3 h-8 w-px bg-white/30" />
      <span className="pointer-events-none absolute bottom-3 right-3 h-px w-8 bg-white/30" />
      <span className="pointer-events-none absolute bottom-3 right-3 h-8 w-px bg-white/30" />

      {/* Content card */}
      <div className="relative overflow-hidden rounded-[16px] bg-background ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)]">
        {/* Gentle sheen on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-15 transition-opacity duration-500" />

        {/* Cover Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {playlist.cover_image ? (
            <Image
              src={playlist.cover_image}
              alt={playlist.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
              <Music2 className="h-24 w-24 text-white/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6">
          {playlist.genre && (
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
              {playlist.genre}
            </span>
          )}
          
          <h3 className="font-heading text-xl font-bold mb-2 line-clamp-2">
            {playlist.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {playlist.description}
          </p>

          <Button
            asChild
            className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold"
          >
            <a
              href={playlist.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <Music2 className="h-4 w-4" />
              Escuchar en Spotify
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
