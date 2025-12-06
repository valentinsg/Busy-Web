import { archiveService } from '@/lib/supabase/archive';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { id?: string } | null;
    const id = body?.id;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const likes = await archiveService.incrementLikes(id);

    return NextResponse.json({ id, likes });
  } catch (error) {
    console.error('Error in /api/archive/like:', error);
    return NextResponse.json(
      { error: 'Failed to like archive entry' },
      { status: 500 },
    );
  }
}
