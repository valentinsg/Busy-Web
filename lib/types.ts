export interface Product {
  id: string
  name: string
  price: number
  currency: string
  images: string[]
  colors: string[]
  sizes: string[]
  category: string
  sku: string
  stock: number
  description: string
  tags: string[]
  rating: number
  reviews: number
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
