/**
 * Script to fix R2 URLs in archive entries
 *
 * Run with: npx tsx scripts/fix-r2-urls.ts
 *
 * This updates all archive entries from the old URL format:
 *   https://busy-archive.r2.dev/...
 * To the correct public development URL:
 *   https://pub-12b1027834c046d2965a5d54e06e9c49.r2.dev/...
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
// Run with: npx tsx --env-file=.env.local scripts/fix-r2-urls.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const OLD_URL = 'https://busy-archive.r2.dev';
const NEW_URL = 'https://pub-12b1027834c046d2965a5d54e06e9c49.r2.dev';

async function fixUrls() {
  console.log('🔧 Fixing R2 URLs in archive entries...\n');
  console.log(`Old URL: ${OLD_URL}`);
  console.log(`New URL: ${NEW_URL}\n`);

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
      entry.thumb_url?.includes(OLD_URL) ||
      entry.medium_url?.includes(OLD_URL) ||
      entry.full_url?.includes(OLD_URL);

    if (!needsUpdate) {
      skipped++;
      continue;
    }

    const newThumbUrl = entry.thumb_url?.replace(OLD_URL, NEW_URL);
    const newMediumUrl = entry.medium_url?.replace(OLD_URL, NEW_URL);
    const newFullUrl = entry.full_url?.replace(OLD_URL, NEW_URL);

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
