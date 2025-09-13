import getServiceClient from "@/lib/supabase/server"
import type { Supplier, ProductSupplier, SupplierPurchase, SupplierPurchaseItem } from "@/types/commerce"

export async function listSuppliers(): Promise<Supplier[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase.from("suppliers").select("*").order("name", { ascending: true })
  if (error) throw error
  return (data ?? []) as Supplier[]
}

export async function updateSupplier(id: string, patch: {
  name?: string
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  notes?: string | null
  category?: string | null
  product_tags?: string[]
  reference_price?: string | null
  minimum_order_quantity?: number | null
  delivery_time_days?: number | null
  payment_terms?: string | null
  tags?: string[]
  status?: 'active' | 'inactive'
  reliability_rating?: number | null
}): Promise<Supplier> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("suppliers")
    .update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.contact_name !== undefined ? { contact_name: patch.contact_name } : {}),
      ...(patch.contact_email !== undefined ? { contact_email: patch.contact_email } : {}),
      ...(patch.contact_phone !== undefined ? { contact_phone: patch.contact_phone } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      ...(patch.category !== undefined ? { category: patch.category } : {}),
      ...(patch.product_tags !== undefined ? { product_tags: patch.product_tags } : {}),
      ...(patch.reference_price !== undefined ? { reference_price: patch.reference_price } : {}),
      ...(patch.minimum_order_quantity !== undefined ? { minimum_order_quantity: patch.minimum_order_quantity } : {}),
      ...(patch.delivery_time_days !== undefined ? { delivery_time_days: patch.delivery_time_days } : {}),
      ...(patch.payment_terms !== undefined ? { payment_terms: patch.payment_terms } : {}),
      ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.reliability_rating !== undefined ? { reliability_rating: patch.reliability_rating } : {}),
    })
    .eq("id", id)
    .select("*")
    .single()
  if (error) throw error
  return data as Supplier
}

export async function deleteSupplier(id: string): Promise<void> {
  const supabase = getServiceClient()
  const { error } = await supabase.from("suppliers").delete().eq("id", id)
  if (error) throw error
}

export async function createSupplier(input: {
  name: string
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  notes?: string | null
  category?: string | null
  product_tags?: string[]
  reference_price?: string | null
  minimum_order_quantity?: number | null
  delivery_time_days?: number | null
  payment_terms?: string | null
  tags?: string[]
  status?: 'active' | 'inactive'
  reliability_rating?: number | null
}): Promise<Supplier> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      name: input.name,
      contact_name: input.contact_name ?? null,
      contact_email: input.contact_email ?? null,
      contact_phone: input.contact_phone ?? null,
      notes: input.notes ?? null,
      category: input.category ?? null,
      product_tags: input.product_tags ?? [],
      reference_price: input.reference_price ?? null,
      minimum_order_quantity: input.minimum_order_quantity ?? null,
      delivery_time_days: input.delivery_time_days ?? null,
      payment_terms: input.payment_terms ?? null,
      tags: input.tags ?? [],
      status: input.status ?? 'active',
      reliability_rating: input.reliability_rating ?? null,
    })
    .select("*")
    .single()
  if (error) throw error
  return data as Supplier
}

export async function upsertProductSupplier(input: {
  product_id: string
  supplier_id: string
  last_cost?: number | null
  currency?: string | null
  lead_time_days?: number | null
}): Promise<ProductSupplier> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("product_suppliers")
    .upsert(
      [
        {
          product_id: input.product_id,
          supplier_id: input.supplier_id,
          last_cost: input.last_cost ?? null,
          currency: input.currency ?? null,
          lead_time_days: input.lead_time_days ?? null,
        },
      ],
      { onConflict: "product_id,supplier_id" }
    )
    .select("*")
    .single()
  if (error) throw error
  return data as ProductSupplier
}

export async function listSupplierPurchases(supplierId: string): Promise<SupplierPurchase[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("supplier_purchases")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("placed_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as SupplierPurchase[]
}

export async function createSupplierPurchase(input: {
  supplier_id: string
  items: Array<{ product_id: string; quantity: number; unit_cost: number }>
  currency?: string
  shipping?: number
  tax?: number
  notes?: string | null
  placed_at?: string
}): Promise<{ purchase: SupplierPurchase; items: SupplierPurchaseItem[] }> {
  const supabase = getServiceClient()

  const subtotal = input.items.reduce((acc, it) => acc + it.quantity * it.unit_cost, 0)
  const shipping = input.shipping ?? 0
  const tax = input.tax ?? 0
  const total = subtotal + shipping + tax

  const { data: purchase, error: pErr } = await supabase
    .from("supplier_purchases")
    .insert({
      supplier_id: input.supplier_id,
      status: "ordered",
      currency: input.currency ?? "USD",
      subtotal,
      shipping,
      tax,
      total,
      notes: input.notes ?? null,
      placed_at: input.placed_at ?? new Date().toISOString(),
    })
    .select("*")
    .single()
  if (pErr) throw pErr

  const itemsPayload = input.items.map((it) => ({
    purchase_id: purchase.id,
    product_id: it.product_id,
    quantity: it.quantity,
    unit_cost: it.unit_cost,
    total_cost: it.quantity * it.unit_cost,
  }))

  const { data: items, error: iErr } = await supabase
    .from("supplier_purchase_items")
    .insert(itemsPayload)
    .select("*")
  if (iErr) throw iErr

  return { purchase: purchase as SupplierPurchase, items: (items ?? []) as SupplierPurchaseItem[] }
}
