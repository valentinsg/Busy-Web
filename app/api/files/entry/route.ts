import { filesService } from '@/lib/supabase/files';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const entry = await filesService.getEntry(id, true);

    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error in /api/files/entry:', error);
    return NextResponse.json(
      { error: 'Failed to load files entry' },
      { status: 500 },
    );
  }
}
