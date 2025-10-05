import { getServiceClient } from '@/lib/supabase/server'
import type { Playlist } from '@/types/playlists'

/**
 * Get all published playlists ordered by order_index and updated_at
 */
export async function getPublishedPlaylists(): Promise<Playlist[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching published playlists:', error)
    return []
  }

  return data || []
}

/**
 * Get all playlists (for admin)
 */
export async function getAllPlaylists(): Promise<Playlist[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all playlists:', error)
    return []
  }

  return data || []
}

/**
 * Get a single playlist by slug
 */
export async function getPlaylistBySlug(slug: string): Promise<Playlist | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching playlist:', error)
    return null
  }

  return data
}

/**
 * Create a new playlist
 */
export async function createPlaylist(playlist: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>): Promise<Playlist | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('playlists')
    .insert([playlist])
    .select()
    .single()

  if (error) {
    console.error('Error creating playlist:', error)
    return null
  }

  return data
}

/**
 * Update an existing playlist
 */
export async function updatePlaylist(id: string, updates: Partial<Playlist>): Promise<Playlist | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('playlists')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating playlist:', error)
    return null
  }

  return data
}

/**
 * Delete a playlist
 */
export async function deletePlaylist(id: string): Promise<boolean> {
  const supabase = getServiceClient()
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting playlist:', error)
    return false
  }

  return true
}
