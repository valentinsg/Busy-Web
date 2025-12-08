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
  _request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const key = params.path.join('/');

    if (!key) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    // Get a signed URL that's valid for 1 hour
    const signedUrl = await getSignedUrlForR2(key, 3600);

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl, 302);
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to get image' }, { status: 500 });
  }
}
