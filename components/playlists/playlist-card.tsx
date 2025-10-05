import type { Playlist } from '@/types/playlists'
import { Music2, ExternalLink, Headphones } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PlaylistCardProps {
  playlist: Playlist
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <div className="group relative rounded-2xl p-[2px] bg-gradient-to-br from-white/45 via-white/20 to-white/30 shadow-[0_0_50px_rgba(35,35,35,0.3)] ring-2 ring-white/30 transition-all duration-300 hover:from-[#1DB954]/60 hover:via-[#1DB954]/40 hover:to-[#1DB954]/50 hover:ring-[#1DB954]/50 hover:shadow-[0_0_40px_rgba(29,185,84,0.3)]">
        {/* Soft external glow - solo en hover */}
        <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-transparent group-hover:bg-[#1DB954]/5 transition-colors duration-300" />

        {/* Subtle inner border */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15 group-hover:ring-[#1DB954]/30 transition-colors duration-300" />

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
      <div className="relative overflow-hidden rounded-[16px] bg-background ring-1 ring-white/10 group-hover:ring-[#1DB954]/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)] group-hover:shadow-[0_8px_40px_rgba(29,185,84,0.2)] transition-all duration-300">
        {/* Gentle sheen on hover - Verde */}
        <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-[#1DB954]/15 via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

        {/* Cover Image - Clickeable */}
        <Link href={`/playlists/${playlist.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer">
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
        </Link>

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

          <div className="flex flex-col gap-2">
            <Button
              asChild
              variant="outline"
              className="w-full border-[#1DB954]/30 hover:bg-[#1DB954]/10 hover:border-[#1DB954] hover:text-[#1DB954] font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg"
            >
              <Link
                href={`/playlists/${playlist.slug}`}
                className="flex items-center justify-center gap-2"
              >
                <Headphones className="h-4 w-4" />
                Explorar Playlist
              </Link>
            </Button>

            <Button
              asChild
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg"
            >
              <a
                href={playlist.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir en Spotify
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
