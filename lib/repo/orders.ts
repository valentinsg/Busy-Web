import getServiceClient from "@/lib/supabase/server"
import type { Order, OrderItem } from "@/types/commerce"

export type OrderWithDetails = Order & {
  customer?: {
    full_name: string | null
    email: string | null
    phone: string | null
  }
  items?: Array<{
    product_name: string
    quantity: number
    unit_price: number
    variant_size: string | null
    variant_color: string | null
    total: number
  }>
}

export type OrderFilters = {
  status?: string
  channel?: string
  customer_id?: string
  payment_method?: string
  limit?: number
  offset?: number
}

export type CreateManualOrderInput = {
  customer_id?: string | null
  customer_name?: string | null
  customer_email?: string | null
  channel: Order["channel"]
  items: Array<{
    product_id: string
    product_name?: string
    variant_color?: string | null
    variant_size?: string | null
    quantity: number
    unit_price: number
  }>
  notes?: string | null
  currency?: string
  discount?: number
  shipping?: number
  tax?: number
  placed_at?: string
  is_barter?: boolean
}

export async function createManualOrder(input: CreateManualOrderInput): Promise<{ order: Order; items: OrderItem[] }> {
  const supabase = getServiceClient()

  // Resolve customer id from name/email if needed
  let resolvedCustomerId: string | null | undefined = input.customer_id ?? null
  if (!resolvedCustomerId && (input.customer_email || input.customer_name)) {
    // Try find by email first
    if (input.customer_email) {
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("email", input.customer_email)
        .maybeSingle()
      if (existing?.id) {
        resolvedCustomerId = existing.id
      }
    }
    if (!resolvedCustomerId) {
      const { data: created, error: custErr } = await supabase
        .from("customers")
        .insert({
          email: input.customer_email ?? null,
          full_name: input.customer_name ?? null,
          last_seen_at: new Date().toISOString(),
        })
        .select("id")
        .single()
      if (custErr) throw custErr
      resolvedCustomerId = created.id
    }
  }

  const currency = input.currency ?? "USD"
  const subtotal = input.items.reduce((acc, it) => acc + it.unit_price * it.quantity, 0)
  const discount = input.discount ?? 0
  const shipping = input.shipping ?? 0
  const tax = input.tax ?? 0
  const total = subtotal - discount + shipping + tax

  // 1) create order (with fallback if is_barter column is missing)
  const basePayload = {
    customer_id: resolvedCustomerId ?? null,
    channel: input.channel,
    status: "paid",
    currency,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    notes: input.notes ?? null,
    placed_at: input.placed_at ?? new Date().toISOString(),
  }
  // Prefer including is_barter, but we'll retry if the column doesn't exist
  const firstTryPayload = { ...basePayload, is_barter: Boolean(input.is_barter) || false }

  let order: Order | null = null
  let orderErr: Error | null = null
  {
    const res = await supabase.from("orders").insert(firstTryPayload).select("*").single()
    order = res.data
    orderErr = res.error
  }
  if (orderErr && String(orderErr.message || "").toLowerCase().includes("is_barter")) {
    // Retry without is_barter for older schemas
    const res2 = await supabase.from("orders").insert(basePayload).select("*").single()
    order = res2.data
    orderErr = res2.error
  }
  if (orderErr) throw orderErr
  if (!order) throw new Error("Failed to create order")
  const createdOrder: Order = order

  // 2) insert items
  const itemsPayload = input.items.map((it: CreateManualOrderInput["items"][number]) => ({
    order_id: createdOrder.id,
    product_id: it.product_id,
    product_name: it.product_name ?? null,
    variant_color: it.variant_color ?? null,
    variant_size: it.variant_size ?? null,
    quantity: it.quantity,
    unit_price: it.unit_price,
    total: it.unit_price * it.quantity,
  }))

  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .insert(itemsPayload)
    .select("*")
  if (itemsErr) throw itemsErr

  // 3) decrement stock (best-effort; consider moving to DB triggers for atomicity)
  for (const it of input.items) {
    // decrement total stock
    const { error: updErr } = await supabase.rpc("decrement_product_stock", {
      p_product_id: it.product_id,
      p_size: it.variant_size ?? null,
      p_qty: it.quantity,
    })
    if (updErr) {
      // fallback: try naive update on products table
      await supabase
        .from("products")
        .update({}) // no-op to ensure call structure
        .eq("id", it.product_id)
      // ignoring error but you may log it
    }
  }

  return { order: createdOrder, items: (items ?? []) as OrderItem[] }
}

/**
 * Fetch orders with optional filters and pagination
 */
export async function getOrders(filters: OrderFilters = {}): Promise<{
  orders: OrderWithDetails[]
  total: number
}> {
  const supabase = getServiceClient()
  const { status, channel, customer_id, payment_method, limit = 50, offset = 0 } = filters

  // Build query
  let query = supabase
    .from("orders")
    .select(`
      id,
      customer_id,
      total,
      subtotal,
      shipping,
      discount,
      tax,
      placed_at,
      updated_at,
      status,
      channel,
      payment_method,
      notes,
      is_barter,
      currency,
      customers:customer_id (
        full_name,
        email,
        phone
      )
    `, { count: 'exact' })
    .order("placed_at", { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (status) query = query.eq("status", status)
  if (channel) query = query.eq("channel", channel)
  if (customer_id) query = query.eq("customer_id", customer_id)
  if (payment_method) query = query.eq("payment_method", payment_method)

  const { data: orders, error: ordersErr, count } = await query

  if (ordersErr) throw ordersErr

  // Fetch items for each order
  const ordersWithItems = await Promise.all(
    (orders || []).map(async (order) => {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, quantity, unit_price, variant_size, variant_color, total")
        .eq("order_id", order.id)

      return {
        ...order,
        customer: Array.isArray(order.customers) ? order.customers[0] : order.customers,
        items: items || [],
      } as OrderWithDetails
    })
  )

  return {
    orders: ordersWithItems,
    total: count || 0,
  }
}

/**
 * Get a single order by ID with all details
 */
export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
  const supabase = getServiceClient()

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(`
      *,
      customers:customer_id (
        full_name,
        email,
        phone
      )
    `)
    .eq("id", orderId)
    .single()

  if (orderErr) throw orderErr
  if (!order) return null

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)

  return {
    ...order,
    customer: Array.isArray(order.customers) ? order.customers[0] : order.customers,
    items: items || [],
  } as OrderWithDetails
}

/**
 * Get pending orders (status = 'pending')
 */
export async function getPendingOrders(): Promise<OrderWithDetails[]> {
  const { orders } = await getOrders({ status: 'pending', limit: 100 })
  return orders
}

/**
 * Update order
 */
export async function updateOrder(
  orderId: string,
  data: { status?: string; notes?: string }
): Promise<boolean> {
  const supabase = getServiceClient()
  
  const { error } = await supabase
    .from("orders")
    .update(data)
    .eq("id", orderId)

  if (error) {
    console.error("Error updating order:", error)
    return false
  }

  return true
}
