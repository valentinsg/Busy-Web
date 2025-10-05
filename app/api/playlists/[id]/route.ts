import { NextResponse } from 'next/server'
import { updatePlaylist, deletePlaylist } from '@/lib/repo/playlists'
import type { Playlist } from '@/types/playlists'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const playlist = await updatePlaylist(params.id, body as Partial<Playlist>)
    
    if (!playlist) {
      return NextResponse.json(
        { ok: false, error: 'Failed to update playlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, playlist })
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deletePlaylist(params.id)
    
    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'Failed to delete playlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    )
  }
}
