import { supabase } from "@/lib/supabase/client"
import type { Product, SizeMeasurement, BenefitItem } from "@/lib/types"

function mapRowToProduct(row: unknown, stockBySize?: Record<string, number>): Product {
  // Build sizes from multiple sources to avoid losing variants
  const sizesFromRow = ((row as { sizes?: string[] }).sizes ?? []) as string[]
  const sizesFromStock = stockBySize ? Object.keys(stockBySize) : []
  const sizesFromMeasurements = (() => {
    const raw = (row as { measurements_by_size?: unknown }).measurements_by_size
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      return Object.keys(raw as Record<string, unknown>)
    }
    return [] as string[]
  })()
  const mergedSizes = Array.from(new Set([...
    sizesFromRow,
    ...sizesFromStock,
    ...sizesFromMeasurements,
  ].filter(Boolean)))

  return {
    id: (row as { id: string }).id,
    name: (row as { name: string }).name,
    price: Number((row as { price: string }).price),
    currency: (row as { currency: string }).currency,
    images: (row as { images: string[] }).images ?? [],
    colors: (row as { colors: string[] }).colors ?? [],
    sizes: mergedSizes,
    measurementsBySize: (() => {
      const raw = (row as { measurements_by_size?: unknown }).measurements_by_size
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        return raw as Record<string, SizeMeasurement>
      }
      return undefined
    })(),
    category: (row as { category: string }).category,
    sku: (row as { sku: string }).sku,
    stock: Number((row as { stock: string }).stock) ?? 0,
    stockBySize,
    description: (row as { description: string }).description ?? "",
    benefits: ((): BenefitItem[] | undefined => {
      const b = (row as { benefits?: unknown }).benefits
      return Array.isArray(b) ? (b as BenefitItem[]) : undefined
    })(),
    careInstructions: (row as { care_instructions?: string }).care_instructions ?? undefined,
    imported: Boolean((row as { imported?: boolean }).imported),
    tags: (row as { tags: string[] }).tags ?? [],
    rating: Number((row as { rating: string }).rating ?? 0),
    reviews: Number((row as { reviews: string }).reviews ?? 0),
    badgeText: (row as { badge_text?: string }).badge_text ?? undefined,
    badgeVariant: (row as { badge_variant?: string }).badge_variant as 'default' | 'destructive' | 'secondary' | 'outline' | 'success' | 'warning' | 'promo' | undefined,
    discountPercentage: (row as { discount_percentage?: number }).discount_percentage ?? undefined,
    discountActive: Boolean((row as { discount_active?: boolean }).discount_active),
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

  if (params?.category) query = query.ilike("category", params.category)
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
  const ids = rows.map((r) => (r as { id: string }).id)
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

  return rows.map((r) => mapRowToProduct(r, stockMap.get((r as { id: string }).id)))
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
  const ids = rows.map((r: unknown) => (r as { id: string }).id)
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
  return rows.map((r) => mapRowToProduct(r, stockMap.get((r as { id: string }).id)))
}
