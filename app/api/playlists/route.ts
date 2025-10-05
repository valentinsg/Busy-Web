import { NextResponse } from 'next/server'
import { getAllPlaylists, createPlaylist } from '@/lib/repo/playlists'
import type { Playlist } from '@/types/playlists'

export async function GET() {
  try {
    const playlists = await getAllPlaylists()
    return NextResponse.json(
      { ok: true, playlists },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const playlist = await createPlaylist(body as Omit<Playlist, 'id' | 'created_at' | 'updated_at'>)
    
    if (!playlist) {
      return NextResponse.json(
        { ok: false, error: 'Failed to create playlist' },
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
