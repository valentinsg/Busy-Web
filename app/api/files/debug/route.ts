import { getServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = getServiceClient();

    // Get first entry from archive
    const { data: entries, error } = await supabase
      .schema('archive')
      .from('entries')
      .select('id, thumb_url, medium_url, full_url, microcopy')
      .limit(3);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!entries?.length) {
      return NextResponse.json({ message: 'No entries found in archive' });
    }

    // Test if URLs are accessible
    const results = await Promise.all(
      entries.map(async (entry) => {
        const testUrl = entry.thumb_url;
        let status = 'unknown';
        let statusCode = 0;
        let headers: Record<string, string> = {};

        try {
          const response = await fetch(testUrl, { method: 'HEAD' });
          status = response.ok ? 'accessible' : 'error';
          statusCode = response.status;
          headers = {
            'content-type': response.headers.get('content-type') || '',
            'access-control-allow-origin': response.headers.get('access-control-allow-origin') || 'not set',
          };
        } catch (e: unknown) {
          status = 'fetch_error';
          headers = {
            error: e instanceof Error ? e.message : 'Unknown fetch error',
          };
        }

        return {
          id: entry.id,
          microcopy: entry.microcopy,
          thumb_url: entry.thumb_url,
          url_status: status,
          http_status: statusCode,
          headers,
        };
      })
    );

    // Check R2 configuration
    const r2Config = {
      R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ? '✓ set' : '✗ missing',
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? '✓ set' : '✗ missing',
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? '✓ set' : '✗ missing',
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'busy-archive (default)',
      PUBLIC_URL: `https://${process.env.R2_BUCKET_NAME || 'busy-archive'}.r2.dev`,
    };

    return NextResponse.json({
      message: 'Archive debug info',
      r2_config: r2Config,
      entries: results,
      fix_instructions: results.some(r => r.url_status !== 'accessible') ? [
        '1. Go to Cloudflare Dashboard → R2 → busy-archive bucket',
        '2. Click Settings tab',
        '3. Find "Public access" or "R2.dev subdomain"',
        '4. Enable "Allow Access" for the r2.dev domain',
        '5. Optionally configure CORS to allow your domain',
      ] : null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
