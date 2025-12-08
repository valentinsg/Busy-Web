import { deleteFromR2 } from '@/lib/r2';
import { getServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getR2KeyFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\//, '');
  } catch {
    return null;
  }
}

// GET - Obtener una entrada por ID
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = getServiceClient();

    const { data: entry, error } = await supabase
      .schema('archive')
      .from('entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }
      console.error('Error fetching files entry:', error);
      return NextResponse.json({ error: 'Failed to load entry' }, { status: 500 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Unexpected error in GET /api/files/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Actualizar una entrada (solo metadatos, no imagen)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const supabase = getServiceClient();

    // Campos permitidos para actualizar
    const updateData: Record<string, any> = {};

    if (body.title !== undefined) updateData.title = body.title || null;
    if (body.microcopy !== undefined) updateData.microcopy = body.microcopy || null;
    if (body.place !== undefined) updateData.place = body.place || null;
    if (body.person !== undefined) updateData.person = body.person || null;
    if (body.is_public !== undefined) updateData.is_public = Boolean(body.is_public);

    // Arrays
    if (body.mood !== undefined) {
      updateData.mood = Array.isArray(body.mood)
        ? body.mood.filter(Boolean)
        : (body.mood || '').split(',').map((m: string) => m.trim()).filter(Boolean);
    }
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags)
        ? body.tags.filter(Boolean)
        : (body.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .schema('archive')
      .from('entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating files entry:', error);
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, entry: data });
  } catch (error) {
    console.error('Unexpected error in PUT /api/files/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      console.error('DELETE /api/files/[id]: No ID provided');
      return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
    }

    console.log('DELETE /api/files/[id]: Deleting entry', id);
    const supabase = getServiceClient();

    const { data: entry, error: fetchError } = await supabase
      .schema('archive')
      .from('entries')
      .select('thumb_url, medium_url, full_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      if ((fetchError as any).code === 'PGRST116') {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }
      console.error('Error fetching files entry for delete:', fetchError);
      return NextResponse.json({ error: 'Failed to load entry' }, { status: 500 });
    }

    const keys = [entry.thumb_url, entry.medium_url, entry.full_url]
      .map((url: string | null) => getR2KeyFromUrl(url))
      .filter(Boolean) as string[];

    await Promise.allSettled(keys.map((key) => deleteFromR2(key)));

    const { error: deleteError } = await supabase
      .schema('archive')
      .from('entries')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting files entry:', deleteError);
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    console.log('DELETE /api/files/[id]: Successfully deleted entry', id);

    // Invalidate cache so deleted entries disappear immediately
    revalidatePath('/files');
    revalidatePath('/admin/files/entries');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/files/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
