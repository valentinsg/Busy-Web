import { getFinalPrice } from "@/lib/pricing";
import type { CartItem } from "@/types";

/**
 * Extrae el prefijo del SKU para agrupar productos relacionados
 * Ejemplo: "BUSY-BASIC000" -> "BUSY-BASIC"
 */
export function getSkuPrefix(sku: string): string {
  // Busca el patrón: letras-letras seguido de números
  const match = sku.match(/^([A-Z]+-[A-Z]+)/i)
  return match ? match[1].toUpperCase() : sku.toUpperCase()
}

/**
 * Detecta si un badge es de tipo promoción NxM (2x1, 3x2, etc.)
 */
export function parsePromoFromBadge(badgeText?: string): { buy: number; pay: number } | null {
  if (!badgeText) return null

  const normalized = badgeText.trim().toLowerCase()

  // Detectar patrones: 2x1, 3x2, 4x3, etc.
  const match = normalized.match(/^(\d+)x(\d+)$/)
  if (match) {
    const buy = parseInt(match[1], 10)
    const pay = parseInt(match[2], 10)
    if (buy > pay && pay > 0) {
      return { buy, pay }
    }
  }

  return null
}

/**
 * Agrupa items del carrito por prefijo de SKU
 */
export function groupItemsBySkuPrefix(items: CartItem[]): Map<string, CartItem[]> {
  const groups = new Map<string, CartItem[]>()

  for (const item of items) {
    const prefix = getSkuPrefix(item.product.sku)
    const existing = groups.get(prefix) || []
    groups.set(prefix, [...existing, item])
  }

  return groups
}

/**
 * Calcula el descuento total aplicable por promociones NxM
 *
 * Lógica:
 * - Agrupa productos por prefijo de SKU
 * - Si todos los productos del grupo tienen el mismo badge de promo (ej: 2x1)
 * - Calcula cuántos sets completos se pueden formar
 * - Aplica el descuento correspondiente
 *
 * Ejemplo 2x1:
 * - 3 productos del mismo grupo con badge "2x1" -> 1 set completo (pagas 2, llevas 3)
 * - Descuento = precio del producto más barato del set
 *
 * Ejemplo 3x2:
 * - 5 productos del mismo grupo con badge "3x2" -> 1 set completo (pagas 2, llevas 3)
 * - Descuento = precio del producto más barato del set
 */
export function calculatePromoDiscount(items: CartItem[]): {
  discount: number
  appliedPromos: Array<{
    skuPrefix: string
    promo: string
    itemsInPromo: number
    discountAmount: number
  }>
} {
  const groups = groupItemsBySkuPrefix(items)
  const appliedPromos: Array<{
    skuPrefix: string
    promo: string
    itemsInPromo: number
    discountAmount: number
  }> = []
  let totalDiscount = 0

  for (const [prefix, groupItems] of groups.entries()) {
    // Verificar que todos los items del grupo tengan el mismo badge de promo
    const promoBadges = groupItems
      .map(item => item.product.badgeText)
      .filter((badge): badge is string => !!badge)

    if (promoBadges.length === 0) continue

    // Verificar que todos tengan el mismo badge
    const firstBadge = promoBadges[0]
    const allSameBadge = promoBadges.every(badge => badge === firstBadge)

    if (!allSameBadge) continue

    // Parsear la promoción
    const promo = parsePromoFromBadge(firstBadge)
    if (!promo) continue

    // Contar cantidad total de items en el grupo
    const totalQuantity = groupItems.reduce((sum, item) => sum + item.quantity, 0)

    // Calcular cuántos sets completos se pueden formar
    const completeSets = Math.floor(totalQuantity / promo.buy)

    if (completeSets === 0) continue

    // Ordenar items por precio final (del más barato al más caro)
    const sortedItems = [...groupItems].sort((a, b) => getFinalPrice(a.product) - getFinalPrice(b.product))

    // Calcular descuento: por cada set completo, regalamos (buy - pay) items
    const freeItemsPerSet = promo.buy - promo.pay
    const totalFreeItems = completeSets * freeItemsPerSet

    // Aplicar descuento sobre los items más baratos
    let remainingFreeItems = totalFreeItems
    let setDiscount = 0

    for (const item of sortedItems) {
      if (remainingFreeItems === 0) break

      const itemsToDiscount = Math.min(item.quantity, remainingFreeItems)
      setDiscount += getFinalPrice(item.product) * itemsToDiscount
      remainingFreeItems -= itemsToDiscount
    }

    totalDiscount += setDiscount
    appliedPromos.push({
      skuPrefix: prefix,
      promo: firstBadge,
      itemsInPromo: completeSets * promo.buy,
      discountAmount: setDiscount,
    })
  }

  return {
    discount: totalDiscount,
    appliedPromos,
  }
}

/**
 * Calcula el subtotal del carrito aplicando descuentos de promociones
 */
export function calculateCartTotals(items: CartItem[]): {
  subtotal: number
  promoDiscount: number
  subtotalAfterPromo: number
  appliedPromos: Array<{
    skuPrefix: string
    promo: string
    itemsInPromo: number
    discountAmount: number
  }>
} {
  const subtotal = items.reduce((sum, item) => sum + getFinalPrice(item.product) * item.quantity, 0)
  const { discount, appliedPromos } = calculatePromoDiscount(items)

  return {
    subtotal,
    promoDiscount: discount,
    subtotalAfterPromo: Math.max(0, subtotal - discount),
    appliedPromos,
  }
}
