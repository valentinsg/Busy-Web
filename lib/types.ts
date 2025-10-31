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
  /** Optional badge text to display on product card (e.g., "2x1", "NUEVO", "OFERTA") */
  badgeText?: string
  /** Badge style variant */
  badgeVariant?: 'default' | 'destructive' | 'secondary' | 'outline' | 'success' | 'warning' | 'promo'
  /** Discount percentage (0-100) */
  discountPercentage?: number
  /** Whether the discount is currently active */
  discountActive?: boolean
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
  email?: string
  avatar?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  medium?: string
  bio?: string
  created_at?: string
  updated_at?: string
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

export type PromoType = 'nxm' | 'percentage_off' | 'fixed_amount' | 'combo' | 'bundle' | 'nth_unit_discount'

export interface Promotion {
  id: string
  name: string
  description?: string
  active: boolean
  promo_type: PromoType
  config: PromoConfig
  eligible_skus: string[]
  sku_match_type: 'exact' | 'prefix'
  min_quantity?: number
  max_uses_per_customer?: number
  max_total_uses?: number
  current_uses: number
  priority: number
  starts_at?: string
  ends_at?: string
  created_at: string
  updated_at: string
}

export type PromoConfig = 
  | NxMConfig 
  | PercentageOffConfig 
  | FixedAmountConfig 
  | ComboConfig 
  | BundleConfig
  | NthUnitDiscountConfig

export interface NxMConfig {
  buy: number // Cantidad a comprar
  pay: number // Cantidad a pagar
}

export interface PercentageOffConfig {
  discount_percent: number // Porcentaje de descuento (0-100)
}

export interface FixedAmountConfig {
  discount_amount: number // Monto fijo de descuento
}

export interface ComboConfig {
  required_skus: string[] // SKUs o prefijos requeridos
  discount_percent?: number // Descuento en porcentaje
  discount_amount?: number // O descuento en monto fijo
  match_type?: 'exact' | 'prefix' // Tipo de match para required_skus
}

export interface BundleConfig {
  sku_groups: string[][] // Grupos de SKUs (debe tener al menos 1 de cada grupo)
  discount_percent?: number
  discount_amount?: number
}

export interface NthUnitDiscountConfig {
  nth_unit: number // Número de unidad con descuento (ej: 2 para "2da unidad")
  discount_percent: number // Porcentaje de descuento en esa unidad
}

export interface AppliedPromo {
  promotion_id: string
  promotion_name: string
  promo_type: PromoType
  items_in_promo: number
  discount_amount: number
  details?: string
}
