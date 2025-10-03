import Link from 'next/link'
import { getAllPlaylists } from '@/lib/repo/playlists'
import { PlaylistRowActions } from '@/components/admin/playlist-row-actions'

export const dynamic = 'force-dynamic'

export default async function AdminPlaylistsPage() {
  const playlists = await getAllPlaylists()

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-2">Playlists</h2>
          <p className="font-body text-muted-foreground">
            Gestionar playlists de Spotify.
          </p>
        </div>
        <Link
          href="/admin/playlists/new"
          className="rounded-md border bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90"
        >
          Nueva playlist
        </Link>
      </section>

      <div className="rounded-lg border bg-muted/10 divide-y">
        {playlists.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            No hay playlists aún.
          </div>
        )}
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="p-4 flex items-center justify-between gap-3"
          >
            <div className="flex-1">
              <div className="font-heading font-medium">{playlist.title}</div>
              <div className="text-xs text-muted-foreground">
                {playlist.genre || 'Sin género'} · {playlist.is_published ? 'Publicada' : 'Borrador'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={playlist.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:underline"
              >
                Spotify
              </a>
              <PlaylistRowActions playlist={playlist} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
