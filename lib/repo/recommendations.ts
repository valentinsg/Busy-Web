import { supabase } from "@/lib/supabase/client"
import getServiceClient from "@/lib/supabase/server"
import type { Product } from "@/types"

// Fetch manually curated related products (upsell/cross-sell)
export async function getRelatedProducts(productId: string, limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("related_products")
    .select("related_product_id")
    .eq("product_id", productId)
    .order("weight", { ascending: false })
    .limit(limit)
  if (error) throw error
  const ids = (data ?? []).map((r: unknown) => (r as { related_product_id: string }).related_product_id)
  if (!ids.length) return []
  const { data: products, error: prodErr } = await supabase.from("products").select("*").in("id", ids)
  if (prodErr) throw prodErr
  return (products ?? []) as unknown as Product[]
}

// Medium level: popularity-based recommendations
export async function getPopularProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("product_popularity")
    .select("product_id")
    .order("revenue", { ascending: false })
    .limit(limit)
  if (error) throw error
  const ids = (data ?? []).map((r: unknown) => (r as { product_id: string }).product_id)
  if (!ids.length) return []
  const { data: products, error: prodErr } = await supabase.from("products").select("*").in("id", ids)
  if (prodErr) throw prodErr
  return (products ?? []) as unknown as Product[]
}

// Record a product view/click/add_to_cart/purchase action
export async function trackProductAction(params: {
  productId: string
  action: "view" | "click" | "add_to_cart" | "purchase"
  customerId?: string
  sessionId?: string
  source?: string
  metadata?: Record<string, unknown>
}) {
  const svc = getServiceClient()
  const { error } = await svc.from("product_views").insert({
    product_id: params.productId,
    action: params.action,
    customer_id: params.customerId ?? null,
    session_id: params.sessionId ?? null,
    source: params.source ?? null,
    metadata: params.metadata ?? null,
  })
  if (error) throw error
}
