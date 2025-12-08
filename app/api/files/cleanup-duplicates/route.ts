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

// POST - Find and delete duplicate entries (same thumb_url)
export async function POST() {
  try {
    const supabase = getServiceClient();

    // Get all entries
    const { data: entries, error } = await supabase
      .schema('archive')
      .from('entries')
      .select('id, thumb_url, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching entries:', error);
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    // Find duplicates by thumb_url
    const seen = new Map<string, string>(); // thumb_url -> first id
    const duplicateIds: string[] = [];
    const duplicateUrls: { id: string; thumb_url: string; medium_url?: string; full_url?: string }[] = [];

    for (const entry of entries || []) {
      if (!entry.thumb_url) continue;

      if (seen.has(entry.thumb_url)) {
        duplicateIds.push(entry.id);
      } else {
        seen.set(entry.thumb_url, entry.id);
      }
    }

    if (duplicateIds.length === 0) {
      return NextResponse.json({
        message: 'No duplicates found',
        duplicatesDeleted: 0
      });
    }

    // Get full URLs for duplicates to delete from R2
    const { data: duplicateEntries } = await supabase
      .schema('archive')
      .from('entries')
      .select('id, thumb_url, medium_url, full_url')
      .in('id', duplicateIds);

    // Delete from R2
    for (const entry of duplicateEntries || []) {
      const keys = [entry.thumb_url, entry.medium_url, entry.full_url]
        .map((url: string | null) => getR2KeyFromUrl(url))
        .filter(Boolean) as string[];

      await Promise.allSettled(keys.map((key) => deleteFromR2(key)));
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .schema('archive')
      .from('entries')
      .delete()
      .in('id', duplicateIds);

    if (deleteError) {
      console.error('Error deleting duplicates:', deleteError);
      return NextResponse.json({ error: 'Failed to delete duplicates' }, { status: 500 });
    }

    // Invalidate cache
    revalidatePath('/files');
    revalidatePath('/admin/files/entries');

    return NextResponse.json({
      message: `Deleted ${duplicateIds.length} duplicate entries`,
      duplicatesDeleted: duplicateIds.length,
      deletedIds: duplicateIds
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Preview duplicates without deleting
export async function GET() {
  try {
    const supabase = getServiceClient();

    const { data: entries, error } = await supabase
      .schema('archive')
      .from('entries')
      .select('id, thumb_url, microcopy, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching entries:', error);
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    // Find duplicates
    const seen = new Map<string, { id: string; microcopy: string | null }>();
    const duplicates: { id: string; thumb_url: string; microcopy: string | null; originalId: string }[] = [];

    for (const entry of entries || []) {
      if (!entry.thumb_url) continue;

      if (seen.has(entry.thumb_url)) {
        const original = seen.get(entry.thumb_url)!;
        duplicates.push({
          id: entry.id,
          thumb_url: entry.thumb_url,
          microcopy: entry.microcopy,
          originalId: original.id
        });
      } else {
        seen.set(entry.thumb_url, { id: entry.id, microcopy: entry.microcopy });
      }
    }

    return NextResponse.json({
      totalEntries: entries?.length || 0,
      duplicatesFound: duplicates.length,
      duplicates
    });

  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
