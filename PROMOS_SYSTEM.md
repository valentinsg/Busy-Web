# Sistema de Promociones 2x1, 3x2, etc.

## 📋 Resumen

Sistema completo de promociones automáticas basado en badges de productos. Detecta automáticamente promociones tipo NxM (2x1, 3x2, 4x3, etc.) y aplica descuentos en el carrito.

## 🎨 Mejoras de Badges

### Nuevas Variantes de Colores

Se agregaron **3 nuevas variantes** de badges con colores más visibles:

1. **success** - Verde (`bg-green-600`) - Para promociones exitosas
2. **warning** - Amarillo (`bg-amber-500`) - Para alertas y ofertas limitadas
3. **promo** - Gradiente púrpura/rosa (`from-purple-600 to-pink-600`) - Para promociones especiales con efecto shadow

### Colores Mejorados

Todos los badges ahora tienen:
- Colores más contrastados y visibles
- Soporte completo para dark mode
- Texto blanco sobre fondos oscuros para mejor legibilidad
- El badge "promo" incluye sombra con glow effect

## 🎯 Lógica de Promociones

### Detección Automática

El sistema detecta automáticamente promociones basándose en:

1. **Badge Text**: Debe seguir el patrón `NxM` (ej: "2x1", "3x2", "4x3")
2. **SKU Prefix**: Agrupa productos por prefijo de SKU
   - Ejemplo: `BUSY-BASIC000` y `BUSY-BASIC111` comparten el prefijo `BUSY-BASIC`
   - Permite aplicar promos entre variantes del mismo producto

### Cálculo de Descuentos

**Ejemplo 2x1:**
- Cliente agrega 3 remeras del mismo grupo (mismo prefijo SKU)
- Todas tienen badge "2x1"
- Sistema forma 1 set completo (3 ÷ 2 = 1 set, sobra 1)
- Descuento = precio de la remera más barata del set
- Cliente paga 2 remeras, se lleva 3

**Ejemplo 3x2:**
- Cliente agrega 5 buzos del mismo grupo
- Todos tienen badge "3x2"
- Sistema forma 1 set completo (5 ÷ 3 = 1 set, sobran 2)
- Descuento = precio del buzo más barato del set
- Cliente paga 2 buzos, se lleva 3

### Reglas de Agrupación

Los productos se agrupan por **prefijo de SKU**:
- `BUSY-BASIC000` → Prefijo: `BUSY-BASIC`
- `BUSY-BASIC111` → Prefijo: `BUSY-BASIC`
- `BUSY-PREMIUM001` → Prefijo: `BUSY-PREMIUM`

**Requisitos para aplicar promo:**
1. Todos los productos del grupo deben tener el **mismo badge** (ej: todos "2x1")
2. Deben compartir el **mismo prefijo de SKU**
3. Debe haber suficientes items para formar al menos 1 set completo

## 📁 Archivos Modificados/Creados

### Nuevos Archivos

1. **`lib/checkout/promos.ts`** - Lógica central de promociones
   - `getSkuPrefix()` - Extrae prefijo del SKU
   - `parsePromoFromBadge()` - Parsea badges tipo "2x1"
   - `groupItemsBySkuPrefix()` - Agrupa items por SKU
   - `calculatePromoDiscount()` - Calcula descuentos automáticos
   - `calculateCartTotals()` - Totales con promociones

### Archivos Modificados

1. **`components/ui/badge.tsx`**
   - Agregadas variantes: `success`, `warning`, `promo`
   - Colores mejorados para mejor visibilidad

2. **`lib/types.ts`**
   - Actualizado `badgeVariant` con nuevas variantes

3. **`lib/repo/products.ts`**
   - Soporte para nuevas variantes de badge

4. **`hooks/use-cart.ts`**
   - `getPromoDiscount()` - Obtiene descuento de promos
   - `getAppliedPromos()` - Lista de promos aplicadas
   - `getDiscount()` - Ahora incluye promos + cupones

5. **`components/shop/cart-sheet.tsx`**
   - Muestra promociones aplicadas en el resumen
   - Badge verde con nombre de promo y cantidad de items

6. **`app/checkout/page.tsx`**
   - Desglose detallado de promociones
   - Separación entre descuentos de promo y cupones

7. **`app/admin/products/[id]/page.tsx`**
   - Selector actualizado con 7 opciones de badge
   - Nuevas opciones: Success, Warning, Promo

8. **`components/shop/product-card.tsx`**
   - Soporte para nuevas variantes de badge

9. **`components/shop/product-detail.tsx`**
   - Soporte para nuevas variantes de badge

## 🎨 UI/UX

### En el Carrito (cart-sheet.tsx)

```
Subtotal                    $50,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2x1] (3 items)            -$10,000  ← Badge verde con promo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Envío                       $8,000
Impuestos                   $4,800
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total                      $52,800
```

### En el Checkout

```
Subtotal (3 items)          $50,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2x1] (3 items)            -$10,000  ← Badge verde redondeado
Cupón (VERANO20)            -$8,000  ← Si hay cupón adicional
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal con descuentos    $32,000
Envío                       $8,000
Impuesto online (10%)       $4,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total                      $44,000
```

## 🔧 Uso en Admin

### Configurar Promoción 2x1

1. Ir a **Admin → Productos → [Producto]**
2. En sección "Badge y Descuentos":
   - **Texto del Badge**: `2x1`
   - **Estilo del Badge**: `Promo (Gradiente Púrpura/Rosa)` o `Destructive (Rojo)`
3. Guardar cambios
4. Repetir para todos los productos del mismo grupo (mismo prefijo SKU)

### Configurar Promoción 3x2

1. Mismo proceso pero con:
   - **Texto del Badge**: `3x2`
   - **Estilo del Badge**: `Success (Verde)` o `Promo`

## 🧪 Casos de Uso

### Caso 1: 2x1 en Remeras Básicas

**Setup:**
- Remera Negra: SKU `BUSY-BASIC000`, Badge "2x1"
- Remera Blanca: SKU `BUSY-BASIC111`, Badge "2x1"
- Remera Gris: SKU `BUSY-BASIC222`, Badge "2x1"

**Carrito:**
- 2x Remera Negra ($10,000 c/u)
- 1x Remera Blanca ($10,000)

**Resultado:**
- Subtotal: $30,000
- Promo 2x1: -$10,000 (se regala la más barata)
- **Total: $20,000** ✅

### Caso 2: 3x2 en Buzos Premium

**Setup:**
- Buzo Negro: SKU `BUSY-PREMIUM001`, Badge "3x2"
- Buzo Blanco: SKU `BUSY-PREMIUM002`, Badge "3x2"

**Carrito:**
- 2x Buzo Negro ($25,000 c/u)
- 1x Buzo Blanco ($25,000)

**Resultado:**
- Subtotal: $75,000
- Promo 3x2: -$25,000 (se regala el más barato)
- **Total: $50,000** ✅

### Caso 3: Mezcla de Promociones

**Carrito:**
- 3x Remeras con "2x1" (grupo BUSY-BASIC)
- 2x Buzos sin promo (grupo BUSY-PREMIUM)

**Resultado:**
- Solo se aplica 2x1 a las remeras
- Los buzos se cobran normales
- Descuentos se muestran separados por grupo

## 🎯 Ventajas del Sistema

1. **Automático**: No requiere cupones ni códigos
2. **Flexible**: Funciona con cualquier patrón NxM
3. **Inteligente**: Agrupa por prefijo de SKU
4. **Transparente**: Muestra claramente qué promos se aplicaron
5. **Compatible**: Funciona junto con cupones de descuento
6. **Visual**: Badges llamativos en productos

## 🔄 Orden de Aplicación de Descuentos

1. **Primero**: Promociones automáticas (2x1, 3x2)
2. **Segundo**: Cupones de descuento (sobre subtotal después de promos)
3. **Tercero**: Cálculo de envío e impuestos

Esto maximiza el ahorro del cliente.

## 📊 Tracking

El sistema retorna información detallada de cada promo aplicada:

```typescript
{
  skuPrefix: "BUSY-BASIC",
  promo: "2x1",
  itemsInPromo: 3,
  discountAmount: 10000
}
```

Esto permite:
- Analytics de qué promos se usan más
- Reportes de descuentos por tipo
- Optimización de estrategias de pricing

## 🚀 Próximos Pasos Sugeridos

1. **Analytics**: Trackear uso de promociones en Google Analytics
2. **A/B Testing**: Probar diferentes badges (colores, textos)
3. **Notificaciones**: Avisar cuando el cliente está cerca de completar un set
4. **Sugerencias**: "Agregá 1 más y llevate 3x2"
5. **Límites**: Opción de limitar cantidad de sets por cliente

---

**Fecha de implementación**: 2025-10-12  
**Versión**: 1.0.0
