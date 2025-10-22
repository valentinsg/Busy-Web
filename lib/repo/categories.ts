import createClient from '@/lib/supabase/server'

export interface ProductCategory {
  id: string
  slug: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type CreateCategoryInput = Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>
export type UpdateCategoryInput = Partial<CreateCategoryInput>

/**
 * Get all categories (admin view - includes inactive)
 */
export async function getAllCategories(): Promise<ProductCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  return data || []
}

/**
 * Get active categories only (public view)
 */
export async function getActiveCategories(): Promise<ProductCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching active categories:', error)
    return []
  }
  
  return data || []
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    console.error('Error fetching category:', error)
    return null
  }
  
  return data
}

/**
 * Create a new category
 */
export async function createCategory(input: CreateCategoryInput): Promise<ProductCategory | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_categories')
    .insert(input)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating category:', error)
    throw new Error(error.message)
  }
  
  return data
}

/**
 * Update a category
 */
export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<ProductCategory | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_categories')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating category:', error)
    throw new Error(error.message)
  }
  
  return data
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting category:', error)
    throw new Error(error.message)
  }
  
  return true
}

/**
 * Check if a slug is available
 */
export async function isCategorySlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClient()
  let query = supabase
    .from('product_categories')
    .select('id')
    .eq('slug', slug)
  
  if (excludeId) {
    query = query.neq('id', excludeId)
  }
  
  const { data, error } = await query.single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking slug availability:', error)
    return false
  }
  
  return !data
}
