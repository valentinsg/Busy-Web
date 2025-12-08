import { filesService } from '@/lib/supabase/files';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { id?: string } | null;
    const id = body?.id;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const likes = await filesService.incrementLikes(id);

    return NextResponse.json({ id, likes });
  } catch (error) {
    console.error('Error in /api/files/like POST:', error);
    return NextResponse.json(
      { error: 'Failed to like files entry' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { id?: string } | null;
    const id = body?.id;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const likes = await filesService.decrementLikes(id);

    return NextResponse.json({ id, likes });
  } catch (error) {
    console.error('Error in /api/files/like DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to unlike files entry' },
      { status: 500 },
    );
  }
}
