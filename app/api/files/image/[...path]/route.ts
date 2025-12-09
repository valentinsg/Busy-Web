import { getSignedUrlForR2 } from '@/lib/r2';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// In-memory cache for signed URLs (valid for 50 minutes, URLs expire in 60)
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
  // Clean old entries periodically
  if (urlCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of urlCache.entries()) {
      if (now >= v.expires) urlCache.delete(k);
    }
  }
  urlCache.set(key, { url, expires: Date.now() + CACHE_TTL });
}

/**
 * Proxy endpoint to serve R2 images via signed URLs
 * This bypasses the 401 error when R2 public access isn't working
 *
 * Usage: /api/files/image/entries/{id}/thumb.webp
 */
export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const key = params.path.join('/');

    if (!key) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    // Validate key format - prevent path traversal and invalid characters
    if (
      key.length > 500 ||
      key.includes('..') ||
      !/^[a-zA-Z0-9\-_\/\.]+$/.test(key)
    ) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Check cache first
    let signedUrl = getCachedSignedUrl(key);

    if (!signedUrl) {
      // Get a signed URL that's valid for 1 hour
      signedUrl = await getSignedUrlForR2(key, 3600);
      setCachedSignedUrl(key, signedUrl);
    }

    // Check if client prefers redirect (faster) or proxy (more compatible)
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);

    // For mobile Safari, proxy the image directly to avoid redirect issues
    if (isMobile && isSafari) {
      const imageResponse = await fetch(signedUrl);

      if (!imageResponse.ok) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get('content-type') || 'image/webp';

      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // For other browsers, redirect is faster
    return NextResponse.redirect(signedUrl, 302);
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to get image' }, { status: 500 });
  }
}
