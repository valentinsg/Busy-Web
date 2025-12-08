/**
 * Script to fix R2 URLs to use our proxy endpoint
 *
 * Run with: npx tsx --env-file=.env.local scripts/fix-r2-urls-proxy.ts
 *
 * This updates all Busy Files entries to use the proxy URL format:
 *   /api/files/image/entries/{id}/thumb.webp
 *
 * This bypasses R2 public access issues by using signed URLs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://busy.com.ar';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Match any R2 URL pattern
const R2_URL_PATTERN = /https:\/\/[^/]+\.r2\.dev\//;

function convertToProxyUrl(url: string | null): string | null {
  if (!url) return null;

  // Extract the path after the domain
  const match = url.match(/https:\/\/[^/]+\.r2\.dev\/(.+)/);
  if (!match) return url; // Not an R2 URL, return as-is

  const path = match[1];
  return `${siteUrl}/api/files/image/${path}`;
}

async function fixUrls() {
  console.log('🔧 Converting R2 URLs to proxy URLs...\n');
  console.log(`Site URL: ${siteUrl}\n`);

  // Get all entries
  const { data: entries, error } = await supabase
    .schema('archive')
    .from('entries')
    .select('id, thumb_url, medium_url, full_url');

  if (error) {
    console.error('Error fetching entries:', error);
    process.exit(1);
  }

  if (!entries?.length) {
    console.log('No entries found.');
    return;
  }

  console.log(`Found ${entries.length} entries to check.\n`);

  let updated = 0;
  let skipped = 0;

  for (const entry of entries) {
    const needsUpdate =
      R2_URL_PATTERN.test(entry.thumb_url || '') ||
      R2_URL_PATTERN.test(entry.medium_url || '') ||
      R2_URL_PATTERN.test(entry.full_url || '');

    if (!needsUpdate) {
      skipped++;
      continue;
    }

    const newThumbUrl = convertToProxyUrl(entry.thumb_url);
    const newMediumUrl = convertToProxyUrl(entry.medium_url);
    const newFullUrl = convertToProxyUrl(entry.full_url);

    console.log(`Entry ${entry.id}:`);
    console.log(`  thumb: ${entry.thumb_url}`);
    console.log(`  → ${newThumbUrl}\n`);

    const { error: updateError } = await supabase
      .schema('archive')
      .from('entries')
      .update({
        thumb_url: newThumbUrl,
        medium_url: newMediumUrl,
        full_url: newFullUrl,
      })
      .eq('id', entry.id);

    if (updateError) {
      console.error(`❌ Error updating entry ${entry.id}:`, updateError);
    } else {
      console.log(`✅ Updated entry ${entry.id}`);
      updated++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${entries.length}`);
}

fixUrls().catch(console.error);
