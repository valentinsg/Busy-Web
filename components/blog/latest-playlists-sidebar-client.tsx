"use client"

import Link from "next/link"
import Image from "next/image"
import { Music2 } from "lucide-react"
import { useEffect, useState } from "react"
import type { Playlist } from "@/types/playlists"

export default function LatestPlaylistsSidebarClient() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const res = await fetch('/api/playlists')
        if (res.ok) {
          const data = await res.json()
          const playlistsData = data.playlists || data
          // Filter only published playlists
          const published = playlistsData.filter((p: Playlist) => p.is_published)
          setPlaylists(published.slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching playlists:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPlaylists()
  }, [])
  
  if (loading) {
    return (
      <div className="rounded-md border bg-muted/20 p-4 w-full h-48 animate-pulse" />
    )
  }
  
  if (playlists.length === 0) return null
  
  return (
    <div className="rounded-md border bg-muted/20 p-4 w-full">
      <div className="flex items-center gap-2 mb-4">
        <Music2 className="h-5 w-5 text-accent-brand" />
        <h4 className="font-heading text-base font-semibold">Escuchá nuestras playlists</h4>
      </div>
      <ul className="space-y-3">
        {playlists.map((playlist) => (
          <li key={playlist.id} className="flex items-start gap-2.5">
            <Link href={`/playlists/${playlist.slug}`} className="flex-shrink-0">
              {playlist.cover_image ? (
                <div className="relative w-16 h-16 rounded border overflow-hidden">
                  <Image 
                    src={playlist.cover_image} 
                    alt={playlist.title} 
                    fill
                    sizes="64px"
                    className="object-cover" 
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded border bg-muted flex items-center justify-center">
                  <Music2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link className="hover:underline text-accent-brand text-xs line-clamp-2 font-body font-medium" href={`/playlists/${playlist.slug}`}>
                {playlist.title}
              </Link>
              {playlist.genre && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{playlist.genre}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Link 
        href="/playlists" 
        className="mt-4 block text-center text-sm text-accent-brand hover:underline font-medium"
      >
        Ver todas las playlists →
      </Link>
    </div>
  )
}
