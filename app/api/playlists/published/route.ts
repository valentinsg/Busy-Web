import { NextResponse } from 'next/server'
import { getPublishedPlaylists } from '@/lib/repo/playlists'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const playlists = await getPublishedPlaylists()
    return NextResponse.json({ ok: true, playlists })
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    )
  }
}
