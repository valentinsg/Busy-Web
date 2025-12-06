import { archiveService } from '@/lib/supabase/archive';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Cache list results for 2 minutes
export const revalidate = 120;

// In-memory cache for list queries
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

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

    // Create cache key from all params
    const cacheKey = `${page}-${pageSize}-${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
          'X-Cache': 'HIT',
        },
      });
    }

    const result = await archiveService.getEntries(filters, page, pageSize);

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
    console.error('Error in /api/archive/list:', error);
    return NextResponse.json(
      { error: 'Failed to load archive entries' },
      { status: 500 },
    );
  }
}
