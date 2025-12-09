import { getSignedUrlForR2 } from '@/lib/r2';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

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

    // Get a signed URL that's valid for 1 hour
    const signedUrl = await getSignedUrlForR2(key, 3600);

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
