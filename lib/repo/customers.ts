import getServiceClient from "@/lib/supabase/server"

export type Customer = {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  tags?: string[] | null
}

export async function listCustomers(opts?: { q?: string; limit?: number }): Promise<Customer[]> {
  const supabase = getServiceClient()
  let query = supabase.from("customers").select("id,email,full_name,phone,tags").order("created_at", { ascending: false })
  if (opts?.q) {
    const q = `%${opts.q}%`
    query = query.or(`email.ilike.${q},full_name.ilike.${q},phone.ilike.${q}`)
  }
  if (opts?.limit) query = query.limit(opts.limit)
  const { data, error } = await query
  if (error) throw error
  return (data || []) as Customer[]
}

export async function updateCustomer(id: string, patch: Partial<Customer>): Promise<Customer> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("customers")
    .update({
      email: patch.email ?? undefined,
      full_name: patch.full_name ?? undefined,
      phone: patch.phone ?? undefined,
      tags: patch.tags,
    })
    .eq("id", id)
    .select("id,email,full_name,phone,tags")
    .single()
  if (error) throw error
  return data as Customer
}

export async function deleteCustomer(id: string): Promise<void> {
  const supabase = getServiceClient()
  const { error } = await supabase.from("customers").delete().eq("id", id)
  if (error) throw error
}

export type OrderWithItems = {
  id: string
  channel: string
  status: string
  currency: string
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  notes: string | null
  placed_at: string
  items: Array<{
    product_id: string
    product_name: string | null
    variant_color: string | null
    variant_size: string | null
    quantity: number
    unit_price: number
    total: number
  }>
}

export async function getCustomerOrders(customerId: string, limit = 10): Promise<OrderWithItems[]> {
  const supabase = getServiceClient()
  type OrderRow = {
    id: string
    channel: string
    status: string
    currency: string
    subtotal: number
    discount: number
    shipping: number
    tax: number
    total: number
    notes: string | null
    placed_at: string
  }
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,channel,status,currency,subtotal,discount,shipping,tax,total,notes,placed_at")
    .eq("customer_id", customerId)
    .order("placed_at", { ascending: false })
    .limit(limit)
  if (error) throw error

  const ids = ((orders as OrderRow[] | null) || []).map((o) => o.id)
  if (!ids.length) return []
  type ItemRow = {
    order_id: string
    product_id: string
    product_name: string | null
    variant_color: string | null
    variant_size: string | null
    quantity: number
    unit_price: number
    total: number
  }
  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("order_id,product_id,product_name,variant_color,variant_size,quantity,unit_price,total")
    .in("order_id", ids)
  if (itemsErr) throw itemsErr

  const grouped = new Map<string, OrderWithItems>()
  for (const o of (orders as OrderRow[] | null) || []) {
    grouped.set(o.id, {
      id: o.id,
      channel: o.channel,
      status: o.status,
      currency: o.currency,
      subtotal: Number(o.subtotal) || 0,
      discount: Number(o.discount) || 0,
      shipping: Number(o.shipping) || 0,
      tax: Number(o.tax) || 0,
      total: Number(o.total) || 0,
      notes: o.notes,
      placed_at: o.placed_at,
      items: [],
    })
  }
  for (const it of (items as ItemRow[] | null) || []) {
    const g = grouped.get(it.order_id)
    if (g)
      g.items.push({
        product_id: it.product_id,
        product_name: it.product_name,
        variant_color: it.variant_color,
        variant_size: it.variant_size,
        quantity: Number(it.quantity) || 0,
        unit_price: Number(it.unit_price) || 0,
        total: Number(it.total) || 0,
      })
  }
  return Array.from(grouped.values())
}
