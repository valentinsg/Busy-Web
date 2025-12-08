import { supabase as client } from "@/lib/supabase/client"
import getServiceClient from "@/lib/supabase/server"

export type FAQ = {
  id: string
  question: string
  answer: string
  category: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type FAQInput = {
  question: string
  answer: string
  category?: string
  sort_order?: number
  is_active?: boolean
}

// Categories for FAQs
export const FAQ_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'envios', label: 'Envíos' },
  { value: 'pagos', label: 'Pagos' },
  { value: 'productos', label: 'Productos' },
  { value: 'cambios', label: 'Cambios y Devoluciones' },
] as const

/**
 * Get all active FAQs (for public page)
 */
export async function getActiveFAQs(): Promise<FAQ[]> {
  const sb = getServiceClient()
  const { data, error } = await sb
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get all FAQs including inactive (for admin)
 */
export async function getAllFAQs(): Promise<FAQ[]> {
  const sb = getServiceClient()
  const { data, error } = await sb
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get single FAQ by ID
 */
export async function getFAQById(id: string): Promise<FAQ | null> {
  const sb = getServiceClient()
  const { data, error } = await sb
    .from("faqs")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Create new FAQ
 */
export async function createFAQ(input: FAQInput): Promise<FAQ> {
  const sb = getServiceClient()

  // Get max sort_order
  const { data: maxOrder } = await sb
    .from("faqs")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  const newOrder = (maxOrder?.sort_order ?? 0) + 1

  const { data, error } = await sb
    .from("faqs")
    .insert({
      question: input.question,
      answer: input.answer,
      category: input.category || 'general',
      sort_order: input.sort_order ?? newOrder,
      is_active: input.is_active ?? true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update existing FAQ
 */
export async function updateFAQ(id: string, input: Partial<FAQInput>): Promise<FAQ> {
  const sb = getServiceClient()
  const { data, error } = await sb
    .from("faqs")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete FAQ
 */
export async function deleteFAQ(id: string): Promise<void> {
  const sb = getServiceClient()
  const { error } = await sb
    .from("faqs")
    .delete()
    .eq("id", id)

  if (error) throw error
}

/**
 * Toggle FAQ active status
 */
export async function toggleFAQActive(id: string): Promise<FAQ> {
  const sb = getServiceClient()

  // Get current status
  const { data: current, error: getError } = await sb
    .from("faqs")
    .select("is_active")
    .eq("id", id)
    .single()

  if (getError) throw getError

  // Toggle
  const { data, error } = await sb
    .from("faqs")
    .update({
      is_active: !current.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Reorder FAQs
 */
export async function reorderFAQs(orderedIds: string[]): Promise<void> {
  const sb = getServiceClient()

  // Update each FAQ with new sort_order
  const updates = orderedIds.map((id, index) =>
    sb
      .from("faqs")
      .update({ sort_order: index + 1 })
      .eq("id", id)
  )

  await Promise.all(updates)
}

/**
 * Get FAQs for client-side (uses browser client)
 */
export async function getFAQsClient(): Promise<FAQ[]> {
  const { data, error } = await client
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) throw error
  return data || []
}
