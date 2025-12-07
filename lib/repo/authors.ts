import type { Author } from '@/types'
import { SupabaseClient } from '@supabase/supabase-js'

export interface AuthorCreateInput {
  id: string
  name: string
  email?: string
  avatar_url?: string
  bio?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  medium?: string
  active?: boolean
}

export interface AuthorUpdateInput {
  name?: string
  email?: string
  avatar_url?: string
  bio?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  medium?: string
  active?: boolean
}

/**
 * Get all active authors
 */
export async function getAllAuthors(supabase: SupabaseClient): Promise<Author[]> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching authors:', error)
    return []
  }

  return (data || []).map(mapDbToAuthor)
}

/**
 * Get author by ID
 */
export async function getAuthorById(
  supabase: SupabaseClient,
  id: string
): Promise<Author | null> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching author:', error)
    return null
  }

  return data ? mapDbToAuthor(data) : null
}

/**
 * Get author by email
 */
export async function getAuthorByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<Author | null> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    console.error('Error fetching author by email:', error)
    return null
  }

  return data ? mapDbToAuthor(data) : null
}

/**
 * Get author by name (case-insensitive)
 */
export async function getAuthorByName(
  supabase: SupabaseClient,
  name: string
): Promise<Author | null> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .ilike('name', name)
    .single()

  if (error) {
    console.error('Error fetching author by name:', error)
    return null
  }

  return data ? mapDbToAuthor(data) : null
}

/**
 * Create a new author
 */
export async function createAuthor(
  supabase: SupabaseClient,
  input: AuthorCreateInput
): Promise<Author | null> {
  const { data, error } = await supabase
    .from('authors')
    .insert({
      id: input.id,
      name: input.name,
      email: input.email || null,
      avatar_url: input.avatar_url || null,
      bio: input.bio || null,
      instagram: input.instagram || null,
      twitter: input.twitter || null,
      linkedin: input.linkedin || null,
      medium: input.medium || null,
      active: input.active ?? true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating author:', error)
    return null
  }

  return data ? mapDbToAuthor(data) : null
}

/**
 * Update an existing author
 */
export async function updateAuthor(
  supabase: SupabaseClient,
  id: string,
  input: AuthorUpdateInput
): Promise<Author | null> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.email !== undefined) updateData.email = input.email || null
  if (input.avatar_url !== undefined) updateData.avatar_url = input.avatar_url || null
  if (input.bio !== undefined) updateData.bio = input.bio || null
  if (input.instagram !== undefined) updateData.instagram = input.instagram || null
  if (input.twitter !== undefined) updateData.twitter = input.twitter || null
  if (input.linkedin !== undefined) updateData.linkedin = input.linkedin || null
  if (input.medium !== undefined) updateData.medium = input.medium || null
  if (input.active !== undefined) updateData.active = input.active

  const { data, error } = await supabase
    .from('authors')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating author:', error)
    return null
  }

  return data ? mapDbToAuthor(data) : null
}

/**
 * Delete an author (soft delete by setting active = false)
 */
export async function deleteAuthor(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase
    .from('authors')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting author:', error)
    return false
  }

  return true
}

/**
 * Upload author avatar to storage
 */
export async function uploadAuthorAvatar(
  supabase: SupabaseClient,
  authorId: string,
  file: File
): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${authorId}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('authors')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    return null
  }

  const { data } = supabase.storage.from('authors').getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Delete author avatar from storage
 */
export async function deleteAuthorAvatar(
  supabase: SupabaseClient,
  avatarUrl: string
): Promise<boolean> {
  // Extract file path from URL
  const urlParts = avatarUrl.split('/authors/')
  if (urlParts.length < 2) return false

  const filePath = urlParts[1]

  const { error } = await supabase.storage.from('authors').remove([filePath])

  if (error) {
    console.error('Error deleting avatar:', error)
    return false
  }

  return true
}

/**
 * Map database row to Author type
 */
function mapDbToAuthor(row: Record<string, unknown>): Author {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string | undefined,
    avatar: row.avatar_url as string | undefined,
    instagram: row.instagram as string | undefined,
    twitter: row.twitter as string | undefined,
    linkedin: row.linkedin as string | undefined,
    medium: row.medium as string | undefined,
    bio: row.bio as string | undefined,
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  }
}
