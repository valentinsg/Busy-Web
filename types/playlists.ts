export interface Playlist {
  id: string
  slug: string
  title: string
  description: string
  spotify_url: string
  cover_image?: string
  genre?: string
  is_published: boolean
  created_at: string
  updated_at: string
  order_index?: number
}

export interface ArtistSubmission {
  id: string
  artist_name: string
  email: string
  phone?: string
  spotify_artist_url?: string
  track_url: string
  genre?: string
  social_instagram?: string
  social_youtube?: string
  message: string
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
  admin_notes?: string
  created_at: string
  updated_at: string
}
