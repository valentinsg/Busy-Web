import type { CartItem, Promotion, AppliedPromo, PromoType, NxMConfig, PercentageOffConfig, FixedAmountConfig, ComboConfig, BundleConfig, NthUnitDiscountConfig } from "@/lib/types"

/**
 * Motor de promociones - Calcula descuentos basados en reglas de la BD
 */

/**
 * Verifica si un SKU coincide con los criterios de elegibilidad
 */
function isSkuEligible(sku: string, eligibleSkus: string[], matchType: 'exact' | 'prefix'): boolean {
  if (matchType === 'exact') {
    return eligibleSkus.includes(sku)
  }
  
  // Match por prefijo
  return eligibleSkus.some(prefix => sku.toUpperCase().startsWith(prefix.toUpperCase()))
}

/**
 * Filtra items del carrito que son elegibles para una promoción
 */
function getEligibleItems(items: CartItem[], promotion: Promotion): CartItem[] {
  return items.filter(item => 
    isSkuEligible(item.product.sku, promotion.eligible_skus, promotion.sku_match_type)
  )
}

/**
 * Calcula descuento para promoción tipo NxM (2x1, 3x2, etc.)
 */
function calculateNxMDiscount(items: CartItem[], config: NxMConfig): number {
  const { buy, pay } = config
  
  if (buy <= pay) return 0
  
  // Contar cantidad total
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  
  // Calcular sets completos
  const completeSets = Math.floor(totalQuantity / buy)
  if (completeSets === 0) return 0
  
  // Items gratis por set
  const freeItemsPerSet = buy - pay
  const totalFreeItems = completeSets * freeItemsPerSet
  
  // Ordenar items por precio (más barato primero)
  const sortedItems = [...items].sort((a, b) => a.product.price - b.product.price)
  
  // Aplicar descuento sobre los más baratos
  let remainingFreeItems = totalFreeItems
  let discount = 0
  
  for (const item of sortedItems) {
    if (remainingFreeItems === 0) break
    
    const itemsToDiscount = Math.min(item.quantity, remainingFreeItems)
    discount += item.product.price * itemsToDiscount
    remainingFreeItems -= itemsToDiscount
  }
  
  return discount
}

/**
 * Calcula descuento para promoción de porcentaje
 */
function calculatePercentageDiscount(items: CartItem[], config: PercentageOffConfig): number {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  return (subtotal * config.discount_percent) / 100
}

/**
 * Calcula descuento de monto fijo
 */
function calculateFixedDiscount(items: CartItem[], config: FixedAmountConfig): number {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  return Math.min(config.discount_amount, subtotal)
}

/**
 * Calcula descuento para combo (requiere SKUs específicos)
 */
function calculateComboDiscount(items: CartItem[], config: ComboConfig, promotion: Promotion): number {
  const { required_skus, discount_percent, discount_amount, match_type = 'prefix' } = config
  
  // Verificar que tengamos al menos 1 de cada SKU requerido
  const hasAllRequired = required_skus.every(requiredSku => 
    items.some(item => {
      if (match_type === 'exact') {
        return item.product.sku === requiredSku
      }
      return item.product.sku.toUpperCase().startsWith(requiredSku.toUpperCase())
    })
  )
  
  if (!hasAllRequired) return 0
  
  // Calcular descuento sobre los items del combo
  const comboItems = items.filter(item =>
    required_skus.some(requiredSku => {
      if (match_type === 'exact') {
        return item.product.sku === requiredSku
      }
      return item.product.sku.toUpperCase().startsWith(requiredSku.toUpperCase())
    })
  )
  
  const comboSubtotal = comboItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  
  if (discount_percent) {
    return (comboSubtotal * discount_percent) / 100
  }
  
  if (discount_amount) {
    return Math.min(discount_amount, comboSubtotal)
  }
  
  return 0
}

/**
 * Calcula descuento para bundle (grupos de SKUs)
 */
function calculateBundleDiscount(items: CartItem[], config: BundleConfig): number {
  const { sku_groups, discount_percent, discount_amount } = config
  
  // Verificar que tengamos al menos 1 item de cada grupo
  const hasAllGroups = sku_groups.every(group =>
    items.some(item => group.includes(item.product.sku))
  )
  
  if (!hasAllGroups) return 0
  
  // Calcular descuento sobre todos los items del bundle
  const bundleItems = items.filter(item =>
    sku_groups.some(group => group.includes(item.product.sku))
  )
  
  const bundleSubtotal = bundleItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  
  if (discount_percent) {
    return (bundleSubtotal * discount_percent) / 100
  }
  
  if (discount_amount) {
    return Math.min(discount_amount, bundleSubtotal)
  }
  
  return 0
}

/**
 * Calcula descuento para N-ésima unidad (ej: 2da unidad 50% off)
 */
function calculateNthUnitDiscount(items: CartItem[], config: NthUnitDiscountConfig): number {
  const { nth_unit, discount_percent } = config
  
  let totalDiscount = 0
  
  // Agrupar items por SKU
  const itemsBySkuMap = new Map<string, CartItem[]>()
  for (const item of items) {
    const existing = itemsBySkuMap.get(item.product.sku) || []
    itemsBySkuMap.set(item.product.sku, [...existing, item])
  }
  
  // Para cada grupo de SKU, aplicar descuento a la N-ésima unidad
  for (const [sku, skuItems] of itemsBySkuMap) {
    const totalQty = skuItems.reduce((sum, item) => sum + item.quantity, 0)
    
    if (totalQty < nth_unit) continue
    
    // Calcular cuántas unidades con descuento hay
    const discountedUnits = Math.floor(totalQty / nth_unit)
    
    // Ordenar por precio (más barato primero para maximizar ahorro del cliente)
    const sortedItems = [...skuItems].sort((a, b) => a.product.price - b.product.price)
    
    // Aplicar descuento
    let remainingDiscountedUnits = discountedUnits
    for (const item of sortedItems) {
      if (remainingDiscountedUnits === 0) break
      
      const unitsToDiscount = Math.min(item.quantity, remainingDiscountedUnits)
      const discountPerUnit = (item.product.price * discount_percent) / 100
      totalDiscount += discountPerUnit * unitsToDiscount
      remainingDiscountedUnits -= unitsToDiscount
    }
  }
  
  return totalDiscount
}

/**
 * Calcula descuento para una promoción específica
 */
function calculatePromotionDiscount(
  items: CartItem[], 
  promotion: Promotion
): { discount: number; itemsInPromo: number } {
  const eligibleItems = getEligibleItems(items, promotion)
  
  if (eligibleItems.length === 0) {
    return { discount: 0, itemsInPromo: 0 }
  }
  
  // Verificar cantidad mínima
  if (promotion.min_quantity) {
    const totalQty = eligibleItems.reduce((sum, item) => sum + item.quantity, 0)
    if (totalQty < promotion.min_quantity) {
      return { discount: 0, itemsInPromo: 0 }
    }
  }
  
  // Verificar vigencia
  const now = new Date()
  if (promotion.starts_at && new Date(promotion.starts_at) > now) {
    return { discount: 0, itemsInPromo: 0 }
  }
  if (promotion.ends_at && new Date(promotion.ends_at) < now) {
    return { discount: 0, itemsInPromo: 0 }
  }
  
  // Verificar límite de usos
  if (promotion.max_total_uses && promotion.current_uses >= promotion.max_total_uses) {
    return { discount: 0, itemsInPromo: 0 }
  }
  
  let discount = 0
  const itemsInPromo = eligibleItems.reduce((sum, item) => sum + item.quantity, 0)
  
  switch (promotion.promo_type) {
    case 'nxm':
      discount = calculateNxMDiscount(eligibleItems, promotion.config as NxMConfig)
      break
    case 'percentage_off':
      discount = calculatePercentageDiscount(eligibleItems, promotion.config as PercentageOffConfig)
      break
    case 'fixed_amount':
      discount = calculateFixedDiscount(eligibleItems, promotion.config as FixedAmountConfig)
      break
    case 'combo':
      discount = calculateComboDiscount(items, promotion.config as ComboConfig, promotion)
      break
    case 'bundle':
      discount = calculateBundleDiscount(eligibleItems, promotion.config as BundleConfig)
      break
    case 'nth_unit_discount':
      discount = calculateNthUnitDiscount(eligibleItems, promotion.config as NthUnitDiscountConfig)
      break
  }
  
  return { discount: Math.max(0, discount), itemsInPromo }
}

/**
 * Calcula todas las promociones aplicables al carrito
 * Retorna las promociones ordenadas por prioridad
 */
export function calculateAllPromotions(
  items: CartItem[],
  promotions: Promotion[]
): {
  totalDiscount: number
  appliedPromos: AppliedPromo[]
} {
  const appliedPromos: AppliedPromo[] = []
  let totalDiscount = 0
  
  // Ordenar por prioridad (mayor primero)
  const sortedPromotions = [...promotions].sort((a, b) => b.priority - a.priority)
  
  for (const promotion of sortedPromotions) {
    if (!promotion.active) continue
    
    const { discount, itemsInPromo } = calculatePromotionDiscount(items, promotion)
    
    if (discount > 0) {
      appliedPromos.push({
        promotion_id: promotion.id,
        promotion_name: promotion.name,
        promo_type: promotion.promo_type,
        items_in_promo: itemsInPromo,
        discount_amount: discount,
        details: getPromoDetails(promotion),
      })
      
      totalDiscount += discount
    }
  }
  
  return { totalDiscount, appliedPromos }
}

/**
 * Genera descripción legible de la promoción
 */
function getPromoDetails(promotion: Promotion): string {
  switch (promotion.promo_type) {
    case 'nxm': {
      const config = promotion.config as NxMConfig
      return `Llevá ${config.buy}, pagá ${config.pay}`
    }
    case 'percentage_off': {
      const config = promotion.config as PercentageOffConfig
      return `${config.discount_percent}% OFF`
    }
    case 'fixed_amount': {
      const config = promotion.config as FixedAmountConfig
      return `$${config.discount_amount} OFF`
    }
    case 'combo': {
      return 'Combo especial'
    }
    case 'bundle': {
      return 'Bundle'
    }
    case 'nth_unit_discount': {
      const config = promotion.config as NthUnitDiscountConfig
      return `${config.nth_unit}° unidad ${config.discount_percent}% OFF`
    }
    default:
      return ''
  }
}
