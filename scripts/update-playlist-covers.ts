import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const playlistCovers: Record<string, string> = {
  'hip-hop-old-school': '/playlists/old-school-cover.jpg',
  'busy-trap-nights': '/playlists/trap-nights-cover.jpg',
}

async function updatePlaylistCovers() {
  console.log('🎵 Updating playlist covers...\n')

  try {
    // Get all playlists
    const { data: playlists, error } = await supabase
      .from('playlists')
      .select('id, slug, title, cover_image')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching playlists:', error)
      return
    }

    if (!playlists || playlists.length === 0) {
      console.log('No playlists found')
      return
    }

    console.log(`Found ${playlists.length} playlists\n`)

    for (const playlist of playlists) {
      const coverPath = playlistCovers[playlist.slug]
      
      if (!coverPath) {
        console.log(`⚠️  No cover defined for: ${playlist.title} (${playlist.slug})`)
        continue
      }

      if (playlist.cover_image) {
        console.log(`✓ ${playlist.title} already has cover: ${playlist.cover_image}`)
        continue
      }

      // Update playlist with cover
      const { error: updateError } = await supabase
        .from('playlists')
        .update({ cover_image: coverPath })
        .eq('id', playlist.id)

      if (updateError) {
        console.error(`✗ Error updating ${playlist.title}:`, updateError)
      } else {
        console.log(`✓ Updated ${playlist.title} with cover: ${coverPath}`)
      }
    }

    console.log('\n✅ Done!')
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

updatePlaylistCovers()
