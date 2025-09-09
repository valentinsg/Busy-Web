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
  return (data || []) as any
}

export async function updateCustomer(id: string, patch: Partial<Customer>): Promise<Customer> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("customers")
    .update({
      email: patch.email ?? undefined,
      full_name: patch.full_name ?? undefined,
      phone: patch.phone ?? undefined,
      tags: patch.tags as any,
    })
    .eq("id", id)
    .select("id,email,full_name,phone,tags")
    .single()
  if (error) throw error
  return data as any
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
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,channel,status,currency,subtotal,discount,shipping,tax,total,notes,placed_at")
    .eq("customer_id", customerId)
    .order("placed_at", { ascending: false })
    .limit(limit)
  if (error) throw error

  const ids = (orders || []).map((o) => o.id)
  if (!ids.length) return []
  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("order_id,product_id,product_name,variant_color,variant_size,quantity,unit_price,total")
    .in("order_id", ids)
  if (itemsErr) throw itemsErr

  const grouped = new Map<string, OrderWithItems>()
  for (const o of orders || []) {
    grouped.set(o.id, { ...(o as any), items: [] })
  }
  for (const it of items || []) {
    const g = grouped.get((it as any).order_id)
    if (g) g.items.push({
      product_id: (it as any).product_id,
      product_name: (it as any).product_name,
      variant_color: (it as any).variant_color,
      variant_size: (it as any).variant_size,
      quantity: (it as any).quantity,
      unit_price: (it as any).unit_price,
      total: (it as any).total,
    })
  }
  return Array.from(grouped.values())
}
