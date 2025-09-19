import { supabase } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"

function mapRowToProduct(row: any, stockBySize?: Record<string, number>): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    currency: row.currency,
    images: row.images ?? [],
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    measurementsBySize: row.measurements_by_size ?? undefined,
    category: row.category,
    sku: row.sku,
    stock: row.stock ?? 0,
    stockBySize,
    description: row.description ?? "",
    tags: row.tags ?? [],
    rating: Number(row.rating ?? 0),
    reviews: Number(row.reviews ?? 0),
  }
}

export type SortBy = "price-asc" | "price-desc" | "rating" | "newest"

export async function getProductsAsync(params?: {
  category?: string
  color?: string
  size?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: SortBy
  tagsContains?: string[]
  featuredOnly?: boolean
}): Promise<Product[]> {
  let query = supabase.from("products").select("*")

  if (params?.category) query = query.eq("category", params.category)
  if (params?.color) query = query.contains("colors", [params.color])
  if (params?.size) query = query.contains("sizes", [params.size])
  if (params?.minPrice !== undefined) query = query.gte("price", params.minPrice)
  if (params?.maxPrice !== undefined) query = query.lte("price", params.maxPrice)
  if (params?.tagsContains && params.tagsContains.length) query = query.contains("tags", params.tagsContains)
  if (params?.featuredOnly) query = query.contains("tags", ["featured"]) 

  if (params?.sortBy) {
    switch (params.sortBy) {
      case "price-asc":
        query = query.order("price", { ascending: true })
        break
      case "price-desc":
        query = query.order("price", { ascending: false })
        break
      case "rating":
        query = query.order("rating", { ascending: false })
        break
      case "newest":
        // Prefer created_at desc if available
        query = query.order("created_at", { ascending: false })
        break
    }
  } else {
    // Default: show newest first
    query = query.order("created_at", { ascending: false })
  }

  const { data, error } = await query
  if (error) throw error
  const rows = data ?? []
  if (rows.length === 0) return []

  // Fetch size-level stock and merge
  const ids = rows.map((r: any) => r.id)
  const { data: sizesData, error: sizesError } = await supabase
    .from("product_sizes")
    .select("product_id,size,stock")
    .in("product_id", ids)
  if (sizesError && sizesError.code !== "PGRST116") {
    // Ignore missing table; fall back silently
    // PGRST116 is no rows returned; we can ignore
  }
  const stockMap = new Map<string, Record<string, number>>()
  for (const row of sizesData || []) {
    const key = row.product_id as string
    const size = row.size as string
    const stock = Number(row.stock) || 0
    if (!stockMap.has(key)) stockMap.set(key, {})
    stockMap.get(key)![size] = stock
  }

  return rows.map((r: any) => mapRowToProduct(r, stockMap.get(r.id)))
}

export async function getProductByIdAsync(id: string): Promise<Product | undefined> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  if (!data) return undefined
  let stockBySize: Record<string, number> | undefined
  const { data: sizesData } = await supabase
    .from("product_sizes")
    .select("size,stock")
    .eq("product_id", id)
  if (sizesData && sizesData.length) {
    stockBySize = {}
    for (const r of sizesData) {
      stockBySize[r.size] = Number(r.stock) || 0
    }
  }
  return mapRowToProduct(data, stockBySize)
}

export async function searchProductsAsync(queryText: string): Promise<Product[]> {
  const q = `%${queryText}%`
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(
      `name.ilike.${q},description.ilike.${q}`,
    )
  if (error) throw error
  const rows = data ?? []
  // Optionally fetch size stock for these rows as well
  const ids = rows.map((r: any) => r.id)
  let stockMap = new Map<string, Record<string, number>>()
  if (ids.length) {
    const { data: sizesData } = await supabase
      .from("product_sizes")
      .select("product_id,size,stock")
      .in("product_id", ids)
    if (sizesData && sizesData.length) {
      stockMap = new Map()
      for (const row of sizesData) {
        const key = row.product_id as string
        const size = row.size as string
        const stock = Number(row.stock) || 0
        if (!stockMap.has(key)) stockMap.set(key, {})
        stockMap.get(key)![size] = stock
      }
    }
  }
  return rows.map((r: any) => mapRowToProduct(r, stockMap.get(r.id)))
}
