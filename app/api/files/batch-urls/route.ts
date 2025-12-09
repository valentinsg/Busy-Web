import { getSignedUrlForR2 } from '@/lib/r2';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// In-memory cache for signed URLs (shared with image proxy)
const urlCache = new Map<string, { url: string; expires: number }>();
const CACHE_TTL = 50 * 60 * 1000; // 50 minutes

function getCachedSignedUrl(key: string): string | null {
  const cached = urlCache.get(key);
  if (cached && Date.now() < cached.expires) {
    return cached.url;
  }
  urlCache.delete(key);
  return null;
}

function setCachedSignedUrl(key: string, url: string): void {
  if (urlCache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of urlCache.entries()) {
      if (now >= v.expires) urlCache.delete(k);
    }
  }
  urlCache.set(key, { url, expires: Date.now() + CACHE_TTL });
}

// Simple rate limiting - track requests per IP
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Lazy cleanup - only when map gets large or enough time has passed
  if (requestCounts.size > 100 || now - lastCleanup > RATE_WINDOW) {
    lastCleanup = now;
    for (const [key, record] of requestCounts.entries()) {
      if (now > record.resetAt) {
        requestCounts.delete(key);
      }
    }
  }

  const record = requestCounts.get(ip);

  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Batch endpoint to get multiple signed URLs in one request
 * POST /api/files/batch-urls
 * Body: { keys: ["entries/id1/thumb.webp", "entries/id2/thumb.webp", ...] }
 * Response: { urls: { "entries/id1/thumb.webp": "https://...", ... } }
 */
export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { keys } = await request.json();

    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid keys array' }, { status: 400 });
    }

    // Limit batch size to prevent abuse
    if (keys.length > 50) {
      return NextResponse.json({ error: 'Too many keys (max 50)' }, { status: 400 });
    }

    // Validate keys format - must be strings and look like valid paths
    const validKeys = keys.filter((key): key is string =>
      typeof key === 'string' &&
      key.length > 0 &&
      key.length < 500 &&
      !key.includes('..') && // Prevent path traversal
      /^[a-zA-Z0-9\-_\/\.]+$/.test(key) // Only safe characters
    );

    if (validKeys.length === 0) {
      return NextResponse.json({ error: 'No valid keys provided' }, { status: 400 });
    }

    const urls: Record<string, string> = {};
    const keysToFetch: string[] = [];

    // Check cache first
    for (const key of validKeys) {
      const cached = getCachedSignedUrl(key);
      if (cached) {
        urls[key] = cached;
      } else {
        keysToFetch.push(key);
      }
    }

    // Fetch remaining URLs in parallel
    if (keysToFetch.length > 0) {
      const results = await Promise.all(
        keysToFetch.map(async (key) => {
          try {
            const url = await getSignedUrlForR2(key, 3600);
            setCachedSignedUrl(key, url);
            return { key, url };
          } catch {
            return { key, url: null };
          }
        })
      );

      for (const { key, url } of results) {
        if (url) urls[key] = url;
      }
    }

    return NextResponse.json(
      { urls },
      {
        headers: {
          'Cache-Control': 'private, max-age=3000', // 50 minutes client cache
        },
      }
    );
  } catch (error) {
    console.error('Error in batch-urls:', error);
    return NextResponse.json({ error: 'Failed to get URLs' }, { status: 500 });
  }
}
