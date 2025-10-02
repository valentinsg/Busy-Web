import type { Product, FilterOptions } from "./types"
import productsData from "@/data/products.json"

export const products: Product[] = productsData

// Category slug normalization (ES and EN synonyms)
const SLUG_TO_CATEGORY: Record<string, string> = {
  // Spanish
  buzos: 'buzos',
  remeras: 'remeras',
  accesorios: 'accesorios',
  pantalones: 'pantalones',
  // English aliases -> Spanish canonical
  hoodies: 'buzos',
  tshirts: 'remeras',
  tees: 'remeras',
  accessories: 'accesorios',
  pants: 'pantalones',
}

const PREFERRED_SLUG_BY_CATEGORY: Record<string, string> = {
  // Prefer Spanish slugs for URL
  buzos: 'buzos',
  remeras: 'remeras',
  accesorios: 'accesorios',
  pantalones: 'pantalones',
}

export function resolveCategorySlug(slug?: string | null): string | undefined {
  if (!slug) return undefined
  return SLUG_TO_CATEGORY[slug.toLowerCase()]
}

export function categoryToSlug(category?: string | null): string | undefined {
  if (!category) return undefined
  const canonical = resolveCategorySlug(category) || category.toLowerCase()
  return PREFERRED_SLUG_BY_CATEGORY[canonical] || canonical
}

export function getProducts(filters?: FilterOptions): Product[] {
  let filteredProducts = [...products]

  if (filters?.category) {
    filteredProducts = filteredProducts.filter((p) => p.category === filters.category)
  }

  if (filters?.color) {
    filteredProducts = filteredProducts.filter((p) => p.colors.includes(filters.color!))
  }

  if (filters?.size) {
    filteredProducts = filteredProducts.filter((p) => p.sizes.includes(filters.size!))
  }

  if (filters?.minPrice !== undefined) {
    filteredProducts = filteredProducts.filter((p) => p.price >= filters.minPrice!)
  }

  if (filters?.maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter((p) => p.price <= filters.maxPrice!)
  }

  // Sort products
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case "price-asc":
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filteredProducts.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        // Assuming newer products have higher IDs
        filteredProducts.reverse()
        break
    }
  }

  return filteredProducts
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category)
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  )
}

export function getCategories(): string[] {
  return [...new Set(products.map((p) => p.category))]
}

export function getAvailableColors(): string[] {
  return [...new Set(products.flatMap((p) => p.colors))]
}

export function getAvailableSizes(): string[] {
  return [...new Set(products.flatMap((p) => p.sizes))]
}
