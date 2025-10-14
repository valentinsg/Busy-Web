import getServiceClient from "@/lib/supabase/server"
import type { Promotion } from "@/lib/types"

/**
 * Obtiene todas las promociones activas
 */
export async function getActivePromotionsAsync(): Promise<Promotion[]> {
  const supabase = await getServiceClient()
  
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('active', true)
    .order('priority', { ascending: false })
  
  if (error) {
    console.error('Error fetching active promotions:', error)
    return []
  }
  
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    active: row.active,
    promo_type: row.promo_type,
    config: row.config,
    eligible_skus: row.eligible_skus || [],
    sku_match_type: row.sku_match_type || 'prefix',
    min_quantity: row.min_quantity,
    max_uses_per_customer: row.max_uses_per_customer,
    max_total_uses: row.max_total_uses,
    current_uses: row.current_uses || 0,
    priority: row.priority || 0,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

/**
 * Obtiene todas las promociones (admin)
 */
export async function getAllPromotionsAsync(): Promise<Promotion[]> {
  const supabase = await getServiceClient()
  
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('priority', { ascending: false })
  
  if (error) {
    console.error('Error fetching all promotions:', error)
    return []
  }
  
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    active: row.active,
    promo_type: row.promo_type,
    config: row.config,
    eligible_skus: row.eligible_skus || [],
    sku_match_type: row.sku_match_type || 'prefix',
    min_quantity: row.min_quantity,
    max_uses_per_customer: row.max_uses_per_customer,
    max_total_uses: row.max_total_uses,
    current_uses: row.current_uses || 0,
    priority: row.priority || 0,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
}

/**
 * Obtiene una promoción por ID
 */
export async function getPromotionByIdAsync(id: string): Promise<Promotion | null> {
  const supabase = await getServiceClient()
  
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !data) {
    console.error('Error fetching promotion:', error)
    return null
  }
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    active: data.active,
    promo_type: data.promo_type,
    config: data.config,
    eligible_skus: data.eligible_skus || [],
    sku_match_type: data.sku_match_type || 'prefix',
    min_quantity: data.min_quantity,
    max_uses_per_customer: data.max_uses_per_customer,
    max_total_uses: data.max_total_uses,
    current_uses: data.current_uses || 0,
    priority: data.priority || 0,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

/**
 * Crea una nueva promoción
 */
export async function createPromotionAsync(promotion: Omit<Promotion, 'id' | 'created_at' | 'updated_at' | 'current_uses'>): Promise<Promotion | null> {
  const supabase = await getServiceClient()
  
  const { data, error } = await supabase
    .from('promotions')
    .insert({
      name: promotion.name,
      description: promotion.description,
      active: promotion.active,
      promo_type: promotion.promo_type,
      config: promotion.config,
      eligible_skus: promotion.eligible_skus,
      sku_match_type: promotion.sku_match_type,
      min_quantity: promotion.min_quantity,
      max_uses_per_customer: promotion.max_uses_per_customer,
      max_total_uses: promotion.max_total_uses,
      priority: promotion.priority,
      starts_at: promotion.starts_at,
      ends_at: promotion.ends_at,
    })
    .select()
    .single()
  
  if (error || !data) {
    console.error('Error creating promotion:', error)
    return null
  }
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    active: data.active,
    promo_type: data.promo_type,
    config: data.config,
    eligible_skus: data.eligible_skus || [],
    sku_match_type: data.sku_match_type || 'prefix',
    min_quantity: data.min_quantity,
    max_uses_per_customer: data.max_uses_per_customer,
    max_total_uses: data.max_total_uses,
    current_uses: data.current_uses || 0,
    priority: data.priority || 0,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

/**
 * Actualiza una promoción
 */
export async function updatePromotionAsync(id: string, updates: Partial<Omit<Promotion, 'id' | 'created_at' | 'updated_at'>>): Promise<Promotion | null> {
  const supabase = await getServiceClient()
  
  const { data, error } = await supabase
    .from('promotions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error || !data) {
    console.error('Error updating promotion:', error)
    return null
  }
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    active: data.active,
    promo_type: data.promo_type,
    config: data.config,
    eligible_skus: data.eligible_skus || [],
    sku_match_type: data.sku_match_type || 'prefix',
    min_quantity: data.min_quantity,
    max_uses_per_customer: data.max_uses_per_customer,
    max_total_uses: data.max_total_uses,
    current_uses: data.current_uses || 0,
    priority: data.priority || 0,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

/**
 * Elimina una promoción
 */
export async function deletePromotionAsync(id: string): Promise<boolean> {
  const supabase = await getServiceClient()
  
  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting promotion:', error)
    return false
  }
  
  return true
}

/**
 * Incrementa el contador de usos de una promoción
 */
export async function incrementPromotionUsageAsync(id: string): Promise<boolean> {
  const supabase = await getServiceClient()
  
  const { error } = await supabase.rpc('increment_promotion_usage', { promo_id: id })
  
  if (error) {
    console.error('Error incrementing promotion usage:', error)
    return false
  }
  
  return true
}
