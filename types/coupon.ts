/**
 * @fileoverview Tipos para cupones de descuento
 * @module types/coupon
 */

/**
 * Cupón de descuento
 * Los cupones se aplican DESPUÉS de las promociones automáticas
 *
 * @example
 * ```ts
 * const cupon: Coupon = {
 *   id: 'coup_123',
 *   code: 'BUSY20',
 *   percent: 20,
 *   active: true,
 *   max_uses: 100,
 *   expires_at: '2024-12-31T23:59:59Z'
 * }
 * ```
 */
export interface Coupon {
  /** ID único del cupón */
  id: string
  /** Código del cupón (case-insensitive) */
  code: string
  /** Porcentaje de descuento (0-100) */
  percent: number
  /** Si el cupón está activo */
  active: boolean
  /** Máximo de usos permitidos */
  max_uses: number
  /** Fecha de expiración (ISO 8601) o null si no expira */
  expires_at: string | null
}
