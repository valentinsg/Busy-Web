/**
 * Product Weight System
 * Default weights by category for shipping calculations
 * All weights are in GRAMS
 */

/**
 * Default weights by product category (in grams)
 * Used when a product doesn't have an explicit weight set
 */
export const DEFAULT_WEIGHTS: Record<string, number> = {
  // Tops
  remera: 220,
  remeras: 220,
  "t-shirt": 220,
  tshirt: 220,
  camiseta: 220,

  // Hoodies & Sweaters
  hoodie: 750,
  hoodies: 750,
  buzo: 750,
  buzos: 750,
  sweater: 600,
  campera: 800,
  camperas: 800,

  // Bottoms
  pantalon: 500,
  pantalones: 500,
  jogger: 500,
  joggers: 500,
  short: 300,
  shorts: 300,
  bermuda: 350,

  // Headwear
  gorra: 200,
  gorras: 200,
  cap: 200,
  caps: 200,
  beanie: 150,

  // Accessories
  accesorio: 50,
  accesorios: 50,
  accessory: 50,
  accessories: 50,
  medias: 80,
  socks: 80,
  bolso: 300,
  bag: 300,
  mochila: 500,
  backpack: 500,

  // Default fallback
  default: 300,
}

/**
 * Get the weight for a product
 * Returns explicit weight if set, otherwise default based on category
 *
 * @param product - Product with optional weight and category
 * @returns Weight in grams
 */
export function getProductWeight(product: {
  weight?: number | null
  category?: string | null
}): number {
  // If product has explicit weight, use it
  if (product.weight && product.weight > 0) {
    return product.weight
  }

  // Otherwise, get default weight based on category
  return getDefaultWeightByCategory(product.category)
}

/**
 * Get default weight for a category
 * Matches category string against known categories (case-insensitive)
 *
 * @param category - Product category string
 * @returns Default weight in grams
 */
export function getDefaultWeightByCategory(category?: string | null): number {
  if (!category) {
    return DEFAULT_WEIGHTS.default
  }

  const normalizedCategory = category.toLowerCase().trim()

  // Direct match
  if (DEFAULT_WEIGHTS[normalizedCategory]) {
    return DEFAULT_WEIGHTS[normalizedCategory]
  }

  // Partial match (category contains keyword)
  for (const [key, weight] of Object.entries(DEFAULT_WEIGHTS)) {
    if (key !== "default" && normalizedCategory.includes(key)) {
      return weight
    }
  }

  // Check if category contains common keywords
  if (normalizedCategory.includes("remera") || normalizedCategory.includes("shirt")) {
    return DEFAULT_WEIGHTS.remera
  }
  if (normalizedCategory.includes("hoodie") || normalizedCategory.includes("buzo")) {
    return DEFAULT_WEIGHTS.hoodie
  }
  if (normalizedCategory.includes("pantalon") || normalizedCategory.includes("jogger")) {
    return DEFAULT_WEIGHTS.pantalon
  }
  if (normalizedCategory.includes("gorra") || normalizedCategory.includes("cap")) {
    return DEFAULT_WEIGHTS.gorra
  }
  if (normalizedCategory.includes("accesorio") || normalizedCategory.includes("accessor")) {
    return DEFAULT_WEIGHTS.accesorio
  }

  return DEFAULT_WEIGHTS.default
}

/**
 * Calculate total weight for multiple items
 *
 * @param items - Array of items with product info and quantity
 * @returns Total weight in grams
 */
export function calculateTotalWeight(
  items: Array<{
    quantity: number
    product?: {
      weight?: number | null
      category?: string | null
    }
    weight?: number | null
    category?: string | null
  }>
): number {
  return items.reduce((total, item) => {
    const weight = item.product
      ? getProductWeight(item.product)
      : getProductWeight({ weight: item.weight, category: item.category })
    return total + (weight * item.quantity)
  }, 0)
}

/**
 * Format weight for display
 * Shows in grams or kilograms depending on size
 *
 * @param weightInGrams - Weight in grams
 * @returns Formatted string (e.g., "220g" or "1.5kg")
 */
export function formatWeight(weightInGrams: number): string {
  if (weightInGrams >= 1000) {
    const kg = weightInGrams / 1000
    return `${kg.toFixed(kg % 1 === 0 ? 0 : 1)}kg`
  }
  return `${weightInGrams}g`
}

/**
 * Get weight category label for admin display
 */
export function getWeightCategoryLabel(category?: string | null): string {
  const weight = getDefaultWeightByCategory(category)
  return `${formatWeight(weight)} (por defecto)`
}
