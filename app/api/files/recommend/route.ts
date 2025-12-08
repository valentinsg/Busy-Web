import { filesService } from '@/lib/supabase/files';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Allow caching for 5 minutes - recommendations don't change often
export const revalidate = 300;

// Simple in-memory cache for recommendations
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = Number(searchParams.get('limit') || '8');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const cacheKey = `${id}-${limit}`;
    const cached = cache.get(cacheKey);

    // Return cached data if valid
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'HIT',
        },
      });
    }

    const rawRecommendations = await filesService.getRecommendations(id, { limit });

    // Extract just the entry objects for the frontend
    const recommendations = rawRecommendations
      .map((r) => (r as { entry?: unknown }).entry ?? r)
      .filter(Boolean);

    // Store in cache
    cache.set(cacheKey, { data: recommendations, timestamp: Date.now() });

    // Clean old entries periodically (keep cache small)
    if (cache.size > 100) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }

    return NextResponse.json(recommendations, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error in /api/files/recommend:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 },
    );
  }
}
