import { getServiceClient } from '@/lib/supabase/server'
import type { ArtistSubmission } from '@/types/playlists'

/**
 * Get all artist submissions (for admin)
 */
export async function getAllArtistSubmissions(): Promise<ArtistSubmission[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('artist_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching artist submissions:', error)
    return []
  }

  return data || []
}

/**
 * Get artist submissions by status
 */
export async function getArtistSubmissionsByStatus(
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
): Promise<ArtistSubmission[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('artist_submissions')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching artist submissions by status:', error)
    return []
  }

  return data || []
}

/**
 * Get a single artist submission by ID
 */
export async function getArtistSubmissionById(
  id: string
): Promise<ArtistSubmission | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('artist_submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching artist submission:', error)
    return null
  }

  return data
}

/**
 * Update artist submission status and notes
 */
export async function updateArtistSubmission(
  id: string,
  updates: {
    status?: 'pending' | 'reviewed' | 'approved' | 'rejected'
    admin_notes?: string
  }
): Promise<ArtistSubmission | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('artist_submissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating artist submission:', error)
    return null
  }

  return data
}

/**
 * Delete an artist submission
 */
export async function deleteArtistSubmission(id: string): Promise<boolean> {
  const supabase = getServiceClient()
  const { error } = await supabase
    .from('artist_submissions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting artist submission:', error)
    return false
  }

  return true
}

/**
 * Get submission statistics
 */
export async function getArtistSubmissionStats(): Promise<{
  total: number
  pending: number
  reviewed: number
  approved: number
  rejected: number
}> {
  const supabase = getServiceClient()
  
  const { data, error } = await supabase
    .from('artist_submissions')
    .select('status')

  if (error) {
    console.error('Error fetching submission stats:', error)
    return { total: 0, pending: 0, reviewed: 0, approved: 0, rejected: 0 }
  }

  const stats = {
    total: data.length,
    pending: data.filter((s) => s.status === 'pending').length,
    reviewed: data.filter((s) => s.status === 'reviewed').length,
    approved: data.filter((s) => s.status === 'approved').length,
    rejected: data.filter((s) => s.status === 'rejected').length,
  }

  return stats
}
