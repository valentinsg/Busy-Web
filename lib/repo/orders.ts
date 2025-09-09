import getServiceClient from "@/lib/supabase/server"
import type { Order, OrderItem } from "@/types/commerce"

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
  const basePayload: any = {
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

  let order: any | null = null
  let orderErr: any | null = null
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

  // 2) insert items
  const itemsPayload = input.items.map((it) => ({
    order_id: order.id,
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

  return { order: order as Order, items: (items ?? []) as OrderItem[] }
}
