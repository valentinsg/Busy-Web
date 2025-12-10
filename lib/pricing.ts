/**
 * @fileoverview Utilidades centralizadas de pricing
 * @module lib/pricing
 *
 * REGLA DE ORO: El precio final SIEMPRE se calcula aquí.
 * Ningún componente debe calcular el precio por su cuenta.
 *
 * Fórmula: final_price = price * (1 - discount_percentage / 100) si hay descuento activo
 *          final_price = price si no hay descuento
 */


/**
 * Tipo mínimo requerido para calcular precios
 * Permite usar estas funciones con productos parciales
 */
export interface PricingProduct {
  price: number
  discountPercentage?: number
  discountActive?: boolean
}

/**
 * Verifica si un producto tiene descuento activo
 * @param product - Producto o item con información de descuento
 * @returns true si el producto tiene descuento activo y porcentaje > 0
 */
export function isDiscounted(product: PricingProduct | null | undefined): boolean {
  if (!product) return false
  return Boolean(
    product.discountActive &&
    product.discountPercentage &&
    product.discountPercentage > 0
  )
}

/**
 * Obtiene el porcentaje de descuento de un producto
 * @param product - Producto con información de descuento
 * @returns Porcentaje de descuento (0-100) o 0 si no hay descuento
 */
export function getDiscountPercentage(product: PricingProduct | null | undefined): number {
  if (!isDiscounted(product)) return 0
  return product!.discountPercentage!
}

/**
 * Calcula el precio final de un producto aplicando descuentos
 * Esta es LA función que todos los componentes deben usar
 *
 * @param product - Producto con precio y posible descuento
 * @returns Precio final después de aplicar descuento (si existe)
 *
 * @example
 * ```ts
 * const product = { price: 10000, discountPercentage: 20, discountActive: true }
 * getFinalPrice(product) // 8000
 *
 * const productNoDiscount = { price: 10000 }
 * getFinalPrice(productNoDiscount) // 10000
 * ```
 */
export function getFinalPrice(product: PricingProduct | null | undefined): number {
  if (!product) return 0

  if (isDiscounted(product)) {
    const discountMultiplier = 1 - (product.discountPercentage! / 100)
    return Math.round(product.price * discountMultiplier)
  }

  return product.price
}

/**
 * Calcula el monto de ahorro en un producto con descuento
 * @param product - Producto con precio y posible descuento
 * @returns Monto ahorrado (precio original - precio final)
 */
export function getSavingsAmount(product: PricingProduct | null | undefined): number {
  if (!product || !isDiscounted(product)) return 0
  return product.price - getFinalPrice(product)
}

/**
 * Calcula el precio total de un item del carrito
 * @param product - Producto
 * @param quantity - Cantidad
 * @returns Precio total (precio final * cantidad)
 */
export function getItemTotal(product: PricingProduct | null | undefined, quantity: number): number {
  return getFinalPrice(product) * Math.max(0, quantity)
}

/**
 * Verifica si un producto califica para la sección de ofertas
 * Un producto califica si tiene descuento activo con porcentaje > 0
 *
 * @param product - Producto a verificar
 * @returns true si el producto debe aparecer en ofertas
 */
export function isOnSale(product: PricingProduct | null | undefined): boolean {
  return isDiscounted(product)
}

/**
 * Ordena productos por mayor descuento primero
 * Útil para la página de ofertas
 *
 * @param products - Array de productos
 * @returns Array ordenado por descuento descendente
 */
export function sortByDiscount<T extends PricingProduct>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const discountA = getDiscountPercentage(a)
    const discountB = getDiscountPercentage(b)
    return discountB - discountA
  })
}

/**
 * Filtra productos que están en oferta
 * @param products - Array de productos
 * @returns Solo productos con descuento activo
 */
export function filterOnSale<T extends PricingProduct>(products: T[]): T[] {
  return products.filter(isOnSale)
}
