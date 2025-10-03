import { notFound } from 'next/navigation'
import { PlaylistForm } from '@/components/admin/playlist-form'
import { getServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function EditPlaylistPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = getServiceClient()
  const { data: playlist, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !playlist) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold mb-2">
          Editar Playlist
        </h2>
        <p className="font-body text-muted-foreground">
          Modificar la playlist &quot;{playlist.title}&quot;.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <PlaylistForm mode="edit" playlist={playlist} />
      </div>
    </div>
  )
}
