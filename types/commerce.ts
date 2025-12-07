// Shared commerce types aligning with Supabase schema

export type UUID = string

export type Customer = {
  id: UUID
  email: string | null
  full_name: string | null
  phone: string | null
  tags: string[]
  created_at: string
  last_seen_at: string | null
}

/**
 * Orden de compra
 * Representa una transacción completada o pendiente
 */
export type Order = {
  id: UUID
  customer_id: UUID | null
  channel: 'web' | 'instagram' | 'mercado_libre' | 'feria' | 'manual' | 'marketplace' | 'grupo_wsp' | 'other'
  status: 'paid' | 'pending' | 'refunded' | 'cancelled'
  currency: string
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  notes: string | null
  /** Fecha de creación de la orden (ISO 8601) */
  placed_at: string
  /** Alias de placed_at para compatibilidad */
  created_at?: string
  updated_at: string
  is_barter: boolean
  /** Items de la orden (solo disponible cuando se hace join) */
  items?: OrderItem[]
}

export type OrderItem = {
  id: UUID
  order_id: UUID
  product_id: string
  product_name: string | null
  variant_color: string | null
  variant_size: string | null
  quantity: number
  unit_price: number
  total: number
  created_at: string
}

export type ProductView = {
  id: UUID
  product_id: string
  customer_id: UUID | null
  session_id: string | null
  source: string | null
  action: 'view' | 'click' | 'add_to_cart' | 'purchase'
  occurred_at: string
  metadata: Record<string, any> | null
}

export type RelatedProduct = {
  id: UUID
  product_id: string
  related_product_id: string
  relation_type: 'upsell' | 'cross_sell' | 'accessory' | 'manual'
  weight: number
  created_at: string
}

export type Supplier = {
  id: UUID
  name: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  notes: string | null
  // New fields
  category: string | null
  product_tags: string[]
  reference_price: string | null
  minimum_order_quantity: number | null
  delivery_time_days: number | null
  payment_terms: string | null
  tags: string[]
  status: 'active' | 'inactive'
  reliability_rating: number | null
  created_at: string
}

export type ProductSupplier = {
  id: UUID
  product_id: string
  supplier_id: UUID
  last_cost: number | null
  currency: string | null
  lead_time_days: number | null
}

export type SupplierPurchase = {
  id: UUID
  supplier_id: UUID
  status: 'ordered' | 'received' | 'cancelled'
  currency: string
  subtotal: number
  shipping: number
  tax: number
  total: number
  placed_at: string
  received_at: string | null
  notes: string | null
}

export type SupplierPurchaseItem = {
  id: UUID
  purchase_id: UUID
  product_id: string
  quantity: number
  unit_cost: number
  total_cost: number
}

export type Expense = {
  id: UUID
  category: string
  supplier_id: UUID | null
  description: string | null
  amount: number
  currency: string
  incurred_at: string
  channel: string | null
  metadata: Record<string, any> | null
}

// Analytics views
export type CustomerStats = {
  customer_id: UUID
  email: string | null
  full_name: string | null
  orders_count: number
  total_spent: number
  last_purchase_at: string | null
}

export type ProductPopularity = {
  product_id: string
  name: string
  image_url?: string
  views: number
  clicks: number
  add_to_carts: number
  purchase_events: number
  orders_count: number
  quantity_sold: number
  revenue: number
}
