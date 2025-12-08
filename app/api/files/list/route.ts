import { filesService } from '@/lib/supabase/files';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Cache list results for 2 minutes
export const revalidate = 120;

// In-memory cache for list queries
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds (reduced for faster updates)

// Export function to clear cache (called after uploads/deletes)
export function clearFilesCache() {
  cache.clear();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get('page') || '1');
    const pageSize = Number(searchParams.get('pageSize') || '20');

    const filters: Record<string, unknown> = {};

    const color = searchParams.get('color');
    if (color) filters.color = color;

    const mood = searchParams.getAll('mood');
    if (mood.length) filters.mood = mood;

    const tags = searchParams.getAll('tags');
    if (tags.length) filters.tags = tags;

    const place = searchParams.get('place');
    if (place) filters.place = place;

    const person = searchParams.get('person');
    if (person) filters.person = person;

    const search = searchParams.get('search');
    if (search) filters.search = search;

    const sort = searchParams.get('sort') as 'newest' | 'oldest' | null;
    if (sort) filters.sort = sort;

    // Admin mode: include private entries (no cache for admin)
    const includePrivate = searchParams.get('admin') === 'true';

    // Create cache key from all params
    const cacheKey = `${page}-${pageSize}-${includePrivate}-${JSON.stringify(filters)}`;

    // Skip cache for admin requests
    if (!includePrivate) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(cached.data, {
          headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
            'X-Cache': 'HIT',
          },
        });
      }
    }

    const result = await filesService.getEntries(filters, page, pageSize, includePrivate);

    // Store in cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    // Clean old entries
    if (cache.size > 50) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error in /api/files/list:', error);
    return NextResponse.json(
      { error: 'Failed to load files entries' },
      { status: 500 },
    );
  }
}
