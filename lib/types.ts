export interface Product {
  id: string
  name: string
  price: number
  currency: string
  images: string[]
  colors: string[]
  sizes: string[]
  /**
   * Optional measurements per size (e.g., chest, length, sleeve).
   * Keyed by size label (e.g., "S", "M", "L", "XL", "One Size").
   */
  measurementsBySize?: Record<string, SizeMeasurement>
  category: string
  sku: string
  /**
   * Deprecated: total stock. Prefer stockBySize when available.
   */
  stock: number
  /**
   * Optional stock per size. Keyed by size label.
   */
  stockBySize?: Record<string, number>
  description: string
  tags: string[]
  rating: number
  reviews: number
}

export interface SizeMeasurement {
  unit: "cm" | "in"
  chest?: number
  length?: number
  sleeve?: number
  waist?: number
  hip?: number
  /** Additional arbitrary data for non-garment items (e.g., caps) */
  [key: string]: unknown
}

export interface CartItem {
  product: Product
  quantity: number
  selectedSize: string
  selectedColor: string
}

export interface FilterOptions {
  category?: string
  color?: string
  size?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: "price-asc" | "price-desc" | "rating" | "newest"
}
