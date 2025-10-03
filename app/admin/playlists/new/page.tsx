import { PlaylistForm } from '@/components/admin/playlist-form'

export default function NewPlaylistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold mb-2">
          Nueva Playlist
        </h2>
        <p className="font-body text-muted-foreground">
          Agregar una nueva playlist de Spotify.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <PlaylistForm mode="create" />
      </div>
    </div>
  )
}
