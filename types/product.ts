/**
 * @fileoverview Tipos relacionados con productos del e-commerce
 * @module types/product
 */

/**
 * Medidas de una prenda por talle
 * @example
 * ```ts
 * const medidas: SizeMeasurement = {
 *   unit: 'cm',
 *   chest: 54,
 *   length: 72,
 *   sleeve: 65
 * }
 * ```
 */
export interface SizeMeasurement {
  /** Unidad de medida */
  unit: 'cm' | 'in'
  /** Contorno de pecho en la unidad especificada */
  chest?: number
  /** Largo total de la prenda */
  length?: number
  /** Largo de manga */
  sleeve?: number
  /** Contorno de cintura */
  waist?: number
  /** Contorno de cadera */
  hip?: number
  /** Propiedades adicionales para items no estándar (gorras, accesorios) */
  [key: string]: unknown
}

/**
 * Beneficio o característica destacada de un producto
 * Se muestra en la página de detalle del producto (PDP)
 */
export interface BenefitItem {
  /** Título del beneficio (ej: "Envío gratis") */
  title: string
  /** Subtítulo o descripción corta */
  subtitle?: string
  /** Nombre del ícono de Lucide a mostrar */
  icon?: string
}

/**
 * Producto del catálogo de la tienda
 *
 * @example
 * ```ts
 * const producto: Product = {
 *   id: 'prod_123',
 *   name: 'Remera Busy Classic',
 *   price: 25000,
 *   currency: 'ARS',
 *   images: ['/products/remera-1.jpg'],
 *   colors: ['Negro', 'Blanco'],
 *   sizes: ['S', 'M', 'L', 'XL'],
 *   category: 'remeras',
 *   sku: 'REM-CLASSIC-001',
 *   stock: 50,
 *   description: 'Remera de algodón premium',
 *   tags: ['remera', 'básico', 'algodón'],
 *   rating: 4.5,
 *   reviews: 23
 * }
 * ```
 */
export interface Product {
  /** ID único del producto (UUID) */
  id: string
  /** Nombre del producto para mostrar */
  name: string
  /** Precio en la moneda especificada (sin decimales para ARS) */
  price: number
  /** Código de moneda ISO 4217 (default: ARS) */
  currency: string
  /** URLs de imágenes del producto */
  images: string[]
  /** Colores disponibles */
  colors: string[]
  /** Talles disponibles (ej: ['S', 'M', 'L', 'XL']) */
  sizes: string[]
  /**
   * Medidas por talle para la guía de talles
   * @example { 'M': { unit: 'cm', chest: 54, length: 72 } }
   */
  measurementsBySize?: Record<string, SizeMeasurement>
  /** Categoría del producto (ej: 'remeras', 'buzos', 'accesorios') */
  category: string
  /** SKU único del producto para inventario */
  sku: string
  /**
   * Stock total del producto
   * @deprecated Usar stockBySize cuando esté disponible
   */
  stock: number
  /**
   * Stock por talle
   * @example { 'S': 10, 'M': 15, 'L': 8, 'XL': 5 }
   */
  stockBySize?: Record<string, number>
  /** Descripción completa del producto (puede incluir HTML) */
  description: string
  /** Beneficios destacados para mostrar en PDP */
  benefits?: BenefitItem[]
  /** Instrucciones de cuidado (markdown o texto plano) */
  careInstructions?: string
  /** Indica si el producto es importado */
  imported?: boolean
  /** Tags para búsqueda y filtrado */
  tags: string[]
  /** Rating promedio (0-5) */
  rating: number
  /** Cantidad de reseñas */
  reviews: number
  /** Texto del badge (ej: '2x1', 'NUEVO', 'OFERTA') */
  badgeText?: string
  /** Variante visual del badge */
  badgeVariant?: 'default' | 'destructive' | 'secondary' | 'outline' | 'success' | 'warning' | 'promo'
  /** Porcentaje de descuento (0-100) */
  discountPercentage?: number
  /** Si el descuento está activo */
  discountActive?: boolean
  /** Si el producto está activo/visible en la tienda */
  isActive?: boolean
  /**
   * Peso del producto en gramos
   * Si es null/undefined, se usa el peso por defecto según categoría
   * Solo visible/editable desde admin
   */
  weight?: number | null
}

/**
 * Opciones de filtrado para listado de productos
 */
export interface FilterOptions {
  /** Filtrar por categoría */
  category?: string
  /** Filtrar por color */
  color?: string
  /** Filtrar por talle disponible */
  size?: string
  /** Precio mínimo */
  minPrice?: number
  /** Precio máximo */
  maxPrice?: number
  /** Ordenamiento */
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest'
}
