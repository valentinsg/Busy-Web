import { uploadToR2 } from '@/lib/r2';
import { analyzeImageColors, generateThumbnails } from '@/lib/sharp-utils';
import { getServiceClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export async function POST(request: Request) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const microcopy = formData.get('microcopy') as string | null;
    const mood = (formData.get('mood') as string)?.split(',').map(m => m.trim()).filter(Boolean) || [];
    const place = formData.get('place') as string | null;
    const person = formData.get('person') as string | null;
    const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [];
    const customDate = formData.get('customDate') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file as buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate thumbnails and extract colors in parallel
    const [thumbnails, colors] = await Promise.all([
      generateThumbnails(buffer),
      analyzeImageColors(buffer),
    ]);

    // Generate unique ID for this entry
    const entryId = randomUUID();
    const entryPath = `entries/${entryId}`;

    // Upload all versions to R2 in parallel
    const [thumbUpload, mediumUpload, fullUpload] = await Promise.all([
      uploadToR2(`${entryPath}/thumb.webp`, thumbnails.thumb.buffer, {
        contentType: 'image/webp',
      }),
      uploadToR2(`${entryPath}/medium.webp`, thumbnails.medium.buffer, {
        contentType: 'image/webp',
      }),
      uploadToR2(`${entryPath}/full.webp`, thumbnails.full.buffer, {
        contentType: 'image/webp',
      }),
    ]);

    // Insert entry into Supabase (archive schema, entries table)
    const supabase = getServiceClient();
    // Always set updated_at to NOW (upload time) for sorting
    // created_at can be backdated for historical photos
    const now = new Date().toISOString();
    const { data: entry, error: dbError } = await supabase
      .schema('archive')
      .from('entries')
      .insert({
        id: entryId,
        thumb_url: thumbUpload.url,
        medium_url: mediumUpload.url,
        full_url: fullUpload.url,
        colors,
        mood,
        place: place || null,
        person: person || null,
        tags,
        title: title || null,
        microcopy: microcopy || null,
        likes: 0,
        views: 0,
        is_public: true,
        updated_at: now, // Always current time for "recently uploaded" sorting
        created_at: customDate ? new Date(customDate).toISOString() : now,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    return NextResponse.json(entry);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
