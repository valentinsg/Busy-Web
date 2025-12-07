/**
 * @fileoverview Tipos para el sistema de promociones y descuentos
 * @module types/promotion
 *
 * El motor de promociones soporta múltiples tipos:
 * - NxM: Llevá N, pagá M (ej: 2x1, 3x2)
 * - Porcentaje: X% de descuento
 * - Monto fijo: $X de descuento
 * - Combo: Descuento al comprar SKUs específicos juntos
 * - Bundle: Descuento al comprar de grupos de SKUs
 * - N-ésima unidad: Descuento en la N-ésima unidad (ej: 2da al 50%)
 */

/**
 * Tipos de promoción disponibles
 */
export type PromoType =
  | 'nxm'              // Llevá N, pagá M
  | 'percentage_off'   // Porcentaje de descuento
  | 'fixed_amount'     // Monto fijo de descuento
  | 'combo'            // Combo de productos específicos
  | 'bundle'           // Bundle de grupos de productos
  | 'nth_unit_discount' // Descuento en N-ésima unidad

/**
 * Configuración para promoción NxM (ej: 2x1, 3x2)
 * @example
 * ```ts
 * // 2x1: Llevá 2, pagá 1
 * const config: NxMConfig = { buy: 2, pay: 1 }
 * // 3x2: Llevá 3, pagá 2
 * const config: NxMConfig = { buy: 3, pay: 2 }
 * ```
 */
export interface NxMConfig {
  /** Cantidad de productos a comprar */
  buy: number
  /** Cantidad de productos a pagar */
  pay: number
}

/**
 * Configuración para descuento porcentual
 */
export interface PercentageOffConfig {
  /** Porcentaje de descuento (0-100) */
  discount_percent: number
}

/**
 * Configuración para descuento de monto fijo
 */
export interface FixedAmountConfig {
  /** Monto fijo de descuento en ARS */
  discount_amount: number
}

/**
 * Configuración para combo de productos
 * Requiere comprar SKUs específicos para activar el descuento
 */
export interface ComboConfig {
  /** SKUs o prefijos requeridos para el combo */
  required_skus: string[]
  /** Descuento en porcentaje (opcional) */
  discount_percent?: number
  /** Descuento en monto fijo (opcional) */
  discount_amount?: number
  /** Tipo de match para los SKUs */
  match_type?: 'exact' | 'prefix'
}

/**
 * Configuración para bundle de productos
 * Requiere al menos 1 producto de cada grupo de SKUs
 */
export interface BundleConfig {
  /** Grupos de SKUs (debe tener al menos 1 de cada grupo) */
  sku_groups: string[][]
  /** Descuento en porcentaje (opcional) */
  discount_percent?: number
  /** Descuento en monto fijo (opcional) */
  discount_amount?: number
}

/**
 * Configuración para descuento en N-ésima unidad
 * @example
 * ```ts
 * // 2da unidad al 50%
 * const config: NthUnitDiscountConfig = { nth_unit: 2, discount_percent: 50 }
 * ```
 */
export interface NthUnitDiscountConfig {
  /** Número de unidad con descuento (ej: 2 para "2da unidad") */
  nth_unit: number
  /** Porcentaje de descuento en esa unidad */
  discount_percent: number
}

/**
 * Unión de todas las configuraciones de promoción
 */
export type PromoConfig =
  | NxMConfig
  | PercentageOffConfig
  | FixedAmountConfig
  | ComboConfig
  | BundleConfig
  | NthUnitDiscountConfig

/**
 * Promoción activa en el sistema
 *
 * @example
 * ```ts
 * const promo: Promotion = {
 *   id: 'promo_123',
 *   name: '2x1 en Remeras',
 *   active: true,
 *   promo_type: 'nxm',
 *   config: { buy: 2, pay: 1 },
 *   eligible_skus: ['REM-'],
 *   sku_match_type: 'prefix',
 *   priority: 10,
 *   current_uses: 0,
 *   created_at: '2024-01-01',
 *   updated_at: '2024-01-01'
 * }
 * ```
 */
export interface Promotion {
  /** ID único de la promoción */
  id: string
  /** Nombre descriptivo */
  name: string
  /** Descripción detallada (opcional) */
  description?: string
  /** Si la promoción está activa */
  active: boolean
  /** Tipo de promoción */
  promo_type: PromoType
  /** Configuración específica según el tipo */
  config: PromoConfig
  /** SKUs elegibles (exactos o prefijos) */
  eligible_skus: string[]
  /** Tipo de match para SKUs */
  sku_match_type: 'exact' | 'prefix'
  /** Cantidad mínima de items para activar */
  min_quantity?: number
  /** Máximo de usos por cliente */
  max_uses_per_customer?: number
  /** Máximo de usos totales */
  max_total_uses?: number
  /** Usos actuales */
  current_uses: number
  /** Prioridad (mayor = se aplica primero) */
  priority: number
  /** Fecha de inicio (ISO 8601) */
  starts_at?: string
  /** Fecha de fin (ISO 8601) */
  ends_at?: string
  /** Fecha de creación */
  created_at: string
  /** Fecha de última actualización */
  updated_at: string
}

/**
 * Promoción aplicada al carrito
 * Resultado del cálculo del motor de promociones
 */
export interface AppliedPromo {
  /** ID de la promoción aplicada */
  promotion_id: string
  /** Nombre de la promoción */
  promotion_name: string
  /** Tipo de promoción */
  promo_type: PromoType
  /** Cantidad de items que participan en la promo */
  items_in_promo: number
  /** Monto de descuento calculado */
  discount_amount: number
  /** Descripción legible del descuento (ej: "Llevá 2, pagá 1") */
  details?: string
}
