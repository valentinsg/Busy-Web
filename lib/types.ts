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
  /** Optional per-product benefits to show in PDP */
  benefits?: BenefitItem[]
  /** Optional markdown/plaintext care instructions */
  careInstructions?: string
  /** Whether the product is imported */
  imported?: boolean
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

export interface BenefitItem {
  title: string
  subtitle?: string
  icon?: string // optional icon name
}

export interface Subscriber {
  email: string
  created_at: string
  status: string
  tags: string[]
}
export interface Expense {
  id: string
  category: string
  amount: number
  currency: string
  description: string
  supplier_id: string
  channel: string
  incurred_at: string
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

export interface Author {
  id: string
  name?: string
  avatar?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  medium?: string
  bio?: string
}

export interface Coupon {
  id: string
  code: string
  percent: number
  active: boolean
  max_uses: number
  expires_at: string | null
}

export interface Order {
  id: string
  customer_id: string
  items: CartItem[]
  total: number
  currency: string
  created_at: string
  updated_at: string
  discount: number
  shipping: number
  tax: number
  notes: string
}

export interface Post {
  id: string
  title: string
  slug: string
  description: string
  tags: string[]
  content: string
  authorName: string
  authorAvatar: string
  cover: string
  coverAlt: string
  canonical: string
  backlinks: string[]
  excerpt: string
  category: string
  readingTime: string
  ogImage: string
  faqs: string[]
  cta: string
  seoKeywords: string[]
}
