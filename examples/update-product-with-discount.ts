/**
 * Ejemplo de cómo actualizar un producto con badge y descuento
 * 
 * Este archivo muestra diferentes escenarios de uso del sistema de badges y descuentos.
 * NO ejecutar directamente - solo como referencia.
 */

import { supabase } from '@/lib/supabase/client'

// ============================================
// EJEMPLO 1: Agregar badge "2x1" sin descuento
// ============================================
async function example1_badge2x1() {
  const { data, error } = await supabase
    .from('products')
    .update({
      badge_text: '2x1',
      badge_variant: 'destructive', // Rojo llamativo
      discount_percentage: null,
      discount_active: false
    })
    .eq('id', 'busy-classic-black')
    .select()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Badge 2x1 agregado:', data)
  }
}

// ============================================
// EJEMPLO 2: Descuento del 30% sin badge personalizado
// ============================================
async function example2_discount30() {
  const { data, error } = await supabase
    .from('products')
    .update({
      badge_text: null, // Sin badge personalizado
      badge_variant: 'default',
      discount_percentage: 30,
      discount_active: true // ¡Importante activar!
    })
    .eq('id', 'busy-premium-gray')
    .select()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Descuento 30% activado:', data)
  }
}

// ============================================
// EJEMPLO 3: Badge "OFERTA" + 50% descuento
// ============================================
async function example3_oferta50() {
  const { data, error } = await supabase
    .from('products')
    .update({
      badge_text: 'OFERTA',
      badge_variant: 'destructive',
      discount_percentage: 50,
      discount_active: true
    })
    .eq('id', 'busy-signature-navy')
    .select()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Oferta 50% configurada:', data)
  }
}

// ============================================
// EJEMPLO 4: Badge "NUEVO" sin descuento
// ============================================
async function example4_nuevo() {
  const { data, error } = await supabase
    .from('products')
    .update({
      badge_text: 'NUEVO',
      badge_variant: 'secondary', // Oscuro elegante
      discount_percentage: null,
      discount_active: false
    })
    .eq('id', 'busy-limited-white')
    .select()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Badge NUEVO agregado:', data)
  }
}

// ============================================
// EJEMPLO 5: Remover badge y descuento
// ============================================
async function example5_remove() {
  const { data, error } = await supabase
    .from('products')
    .update({
      badge_text: null,
      badge_variant: 'default',
      discount_percentage: null,
      discount_active: false
    })
    .eq('id', 'busy-classic-black')
    .select()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Badge y descuento removidos:', data)
  }
}

// ============================================
// EJEMPLO 6: Actualizar múltiples productos con descuento
// ============================================
async function example6_bulkDiscount() {
  const productIds = [
    'busy-classic-black',
    'busy-premium-gray',
    'busy-signature-navy'
  ]

  const { data, error } = await supabase
    .from('products')
    .update({
      badge_text: 'BLACK FRIDAY',
      badge_variant: 'destructive',
      discount_percentage: 40,
      discount_active: true
    })
    .in('id', productIds)
    .select()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Black Friday aplicado a', data?.length, 'productos')
  }
}

// ============================================
// EJEMPLO 7: Desactivar descuento pero mantener badge
// ============================================
async function example7_deactivateDiscount() {
  const { data, error } = await supabase
    .from('products')
    .update({
      // Mantener el badge
      // badge_text: 'OFERTA' (no se modifica)
      // badge_variant: 'destructive' (no se modifica)
      
      // Solo desactivar el descuento
      discount_active: false
    })
    .eq('id', 'busy-signature-navy')
    .select()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Descuento desactivado, badge mantenido:', data)
  }
}

// ============================================
// EJEMPLO 8: Query productos con descuento activo
// ============================================
async function example8_queryDiscounted() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('discount_active', true)
    .order('discount_percentage', { ascending: false })

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Productos con descuento:', data?.length)
    data?.forEach(p => {
      console.log(`  - ${p.name}: ${p.discount_percentage}% OFF`)
    })
  }
}

// ============================================
// EJEMPLO 9: Query productos con badges
// ============================================
async function example9_queryWithBadges() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .not('badge_text', 'is', null)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Productos con badges:', data?.length)
    data?.forEach(p => {
      console.log(`  - ${p.name}: "${p.badge_text}" (${p.badge_variant})`)
    })
  }
}

// ============================================
// EJEMPLO 10: Calcular precio con descuento
// ============================================
function calculateDiscountedPrice(originalPrice: number, discountPercentage: number): number {
  return originalPrice * (1 - discountPercentage / 100)
}

// Uso:
const originalPrice = 149.99
const discount = 30
const finalPrice = calculateDiscountedPrice(originalPrice, discount)
console.log(`Precio original: $${originalPrice}`)
console.log(`Descuento: ${discount}%`)
console.log(`Precio final: $${finalPrice.toFixed(2)}`)

// ============================================
// TIPOS ÚTILES
// ============================================

type BadgeVariant = 'default' | 'destructive' | 'secondary' | 'outline'

interface ProductBadgeDiscount {
  badge_text?: string | null
  badge_variant?: BadgeVariant
  discount_percentage?: number | null
  discount_active?: boolean
}

// Ejemplo de uso con tipos:
const productUpdate: ProductBadgeDiscount = {
  badge_text: 'SALE',
  badge_variant: 'destructive',
  discount_percentage: 25,
  discount_active: true
}

export {
  example1_badge2x1,
  example2_discount30,
  example3_oferta50,
  example4_nuevo,
  example5_remove,
  example6_bulkDiscount,
  example7_deactivateDiscount,
  example8_queryDiscounted,
  example9_queryWithBadges,
  calculateDiscountedPrice,
  type ProductBadgeDiscount,
  type BadgeVariant
}
