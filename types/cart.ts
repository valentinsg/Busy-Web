/**
 * @fileoverview Tipos relacionados con el carrito de compras
 * @module types/cart
 */

import type { Product } from './product'

/**
 * Item en el carrito de compras
 * Representa un producto con su cantidad y variantes seleccionadas
 *
 * @example
 * ```ts
 * const item: CartItem = {
 *   product: miProducto,
 *   quantity: 2,
 *   selectedSize: 'M',
 *   selectedColor: 'Negro'
 * }
 * ```
 */
export interface CartItem {
  /** Producto completo */
  product: Product
  /** Cantidad seleccionada */
  quantity: number
  /** Talle seleccionado */
  selectedSize: string
  /** Color seleccionado */
  selectedColor: string
}
