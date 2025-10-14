# Sistema de Promociones V2 - Gestión Personalizable

## 🎯 Resumen

Sistema completo de promociones basado en base de datos con panel de administración. Permite crear promociones personalizadas sin depender de badges, con reglas flexibles y tipos de descuentos variados.

## 🆕 Cambios Principales

### Antes (V1)
- ❌ Promociones inferidas del badge del producto
- ❌ Solo soportaba 2x1, 3x2 (NxM)
- ❌ Agrupación automática por prefijo SKU
- ❌ No personalizable

### Ahora (V2)
- ✅ Promociones gestionadas desde admin panel
- ✅ 6 tipos de promociones diferentes
- ✅ Agrupación manual y personalizable
- ✅ Reglas flexibles por SKU
- ✅ Badges solo visuales (no afectan lógica)
- ✅ Prioridades configurables
- ✅ Límites de uso
- ✅ Fechas de vigencia

## 📊 Tipos de Promociones

### 1. **NxM** (2x1, 3x2, 4x3, etc.)
Llevá N productos, pagá M.

**Config:**
```json
{
  "buy": 2,
  "pay": 1
}
```

**Ejemplo:** 2x1 en remeras básicas
- SKUs elegibles: `BUSY-BASIC` (prefijo)
- Cliente agrega 3 remeras → Paga 2, lleva 3

### 2. **Porcentaje de Descuento**
Descuento en % sobre productos elegibles.

**Config:**
```json
{
  "discount_percent": 20
}
```

**Ejemplo:** 20% OFF en toda la colección premium
- SKUs elegibles: `BUSY-PREMIUM` (prefijo)
- Subtotal $50,000 → Descuento $10,000

### 3. **Monto Fijo**
Descuento de monto fijo en pesos.

**Config:**
```json
{
  "discount_amount": 5000
}
```

**Ejemplo:** $5,000 OFF en compras de buzos
- SKUs elegibles: `BUSY-HOODIE` (prefijo)
- Se descuentan $5,000 del subtotal

### 4. **Combo**
Requiere SKUs específicos para activarse.

**Config:**
```json
{
  "required_skus": ["BUSY-TEE", "BUSY-PANT"],
  "discount_percent": 20,
  "match_type": "prefix"
}
```

**Ejemplo:** Outfit completo (Remera + Pantalón)
- Cliente debe tener al menos 1 remera Y 1 pantalón
- Se aplica 20% de descuento sobre esos productos

### 5. **Bundle**
Requiere al menos 1 producto de cada grupo.

**Config:**
```json
{
  "sku_groups": [
    ["BUSY-TEE001", "BUSY-TEE002"],
    ["BUSY-PANT001", "BUSY-PANT002"]
  ],
  "discount_amount": 8000
}
```

**Ejemplo:** Look completo
- Grupo 1: Remeras (al menos 1)
- Grupo 2: Pantalones (al menos 1)
- Descuento: $8,000

### 6. **N° Unidad con Descuento**
La N-ésima unidad tiene descuento.

**Config:**
```json
{
  "nth_unit": 2,
  "discount_percent": 50
}
```

**Ejemplo:** 2da unidad 50% OFF
- Cliente compra 2 remeras del mismo SKU
- La 2da remera tiene 50% de descuento

## 🏗️ Arquitectura

### Base de Datos

**Tabla:** `promotions`

```sql
- id (uuid)
- name (text) - "2x1 Remeras Básicas"
- description (text)
- active (boolean)
- promo_type (text) - 'nxm', 'percentage_off', etc.
- config (jsonb) - Configuración específica del tipo
- eligible_skus (text[]) - Array de SKUs o prefijos
- sku_match_type (text) - 'exact' o 'prefix'
- priority (integer) - Mayor = más prioridad
- min_quantity (integer)
- max_uses_per_customer (integer)
- max_total_uses (integer)
- current_uses (integer)
- starts_at (timestamptz)
- ends_at (timestamptz)
```

### Archivos Principales

**Backend:**
- `supabase/schema/promotions.sql` - Schema de BD
- `lib/types.ts` - Tipos TypeScript
- `lib/repo/promotions.ts` - Repositorio
- `lib/checkout/promo-engine.ts` - Motor de cálculo

**API:**
- `app/api/promotions/active/route.ts` - Promociones activas (público)
- `app/api/admin/promotions/route.ts` - CRUD admin
- `app/api/admin/promotions/[id]/route.ts` - Editar/eliminar

**Frontend:**
- `hooks/use-cart.ts` - Hook del carrito (actualizado)
- `components/promotions-provider.tsx` - Provider que carga promos
- `app/admin/promotions/page.tsx` - Lista de promociones
- `app/admin/promotions/new/page.tsx` - Crear promoción

**UI:**
- `components/shop/cart-sheet.tsx` - Muestra promos aplicadas
- `app/checkout/page.tsx` - Desglose de descuentos

## 🎨 Badges (Solo Visual)

Los badges ahora son **puramente visuales** y no afectan la lógica de promociones.

**Variantes disponibles:**
- `default` - Gris oscuro
- `secondary` - Gris
- `destructive` - Rojo
- `success` - Verde ✨
- `warning` - Amarillo ✨
- `promo` - Gradiente púrpura/rosa ✨
- `outline` - Borde

**Uso:**
```tsx
<Badge variant="promo">2x1</Badge>
```

## 🚀 Cómo Usar

### 1. Crear Promoción en Admin

1. Ir a `/admin/promotions`
2. Click en "Nueva Promoción"
3. Completar formulario:
   - **Nombre:** "2x1 Remeras Básicas"
   - **Tipo:** NxM
   - **Config:** Buy=2, Pay=1
   - **SKUs Elegibles:** `BUSY-BASIC` (prefijo)
   - **Prioridad:** 10
4. Guardar

### 2. La Promoción se Aplica Automáticamente

El `PromotionsProvider` carga las promociones activas cada 5 minutos y las guarda en el carrito. Cuando el cliente agrega productos elegibles, el descuento se calcula automáticamente.

### 3. Ver Promociones Aplicadas

En el carrito y checkout se muestran:
```
Subtotal                    $30,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2x1 Remeras Básicas]      -$10,000
  (Llevá 2, Pagá 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total                      $20,000
```

## 📝 Ejemplos Prácticos

### Ejemplo 1: 2x1 en Remeras Básicas

```json
{
  "name": "2x1 Remeras Básicas",
  "promo_type": "nxm",
  "config": {
    "buy": 2,
    "pay": 1
  },
  "eligible_skus": ["BUSY-BASIC"],
  "sku_match_type": "prefix",
  "priority": 10
}
```

### Ejemplo 2: 2da Unidad 50% OFF

```json
{
  "name": "2da Unidad 50% OFF",
  "promo_type": "nth_unit_discount",
  "config": {
    "nth_unit": 2,
    "discount_percent": 50
  },
  "eligible_skus": ["BUSY-PREMIUM"],
  "sku_match_type": "prefix",
  "priority": 5
}
```

### Ejemplo 3: Outfit Completo (Remera + Pantalón)

```json
{
  "name": "Outfit Completo",
  "promo_type": "combo",
  "config": {
    "required_skus": ["BUSY-TEE", "BUSY-PANT"],
    "discount_percent": 20,
    "match_type": "prefix"
  },
  "eligible_skus": ["BUSY-TEE", "BUSY-PANT"],
  "sku_match_type": "prefix",
  "priority": 15
}
```

### Ejemplo 4: Black Friday - 30% OFF Todo

```json
{
  "name": "Black Friday 30% OFF",
  "promo_type": "percentage_off",
  "config": {
    "discount_percent": 30
  },
  "eligible_skus": ["BUSY"],
  "sku_match_type": "prefix",
  "priority": 20,
  "starts_at": "2025-11-29T00:00:00Z",
  "ends_at": "2025-11-30T23:59:59Z"
}
```

## 🔧 Configuración Avanzada

### Prioridades

Las promociones se aplican en orden de prioridad (mayor primero):
- **20+** - Promociones especiales (Black Friday, etc.)
- **15-19** - Combos y bundles
- **10-14** - Promociones NxM estándar
- **5-9** - Descuentos por unidad
- **1-4** - Descuentos generales

### Match Types

**Prefix (recomendado):**
- `BUSY-BASIC` coincide con `BUSY-BASIC001`, `BUSY-BASIC002`, etc.
- Útil para agrupar variantes del mismo producto

**Exact:**
- Solo coincide con el SKU exacto
- Útil para promociones en productos específicos

### Límites de Uso

**Por Cliente:**
```json
{
  "max_uses_per_customer": 1
}
```
Cada cliente puede usar la promo solo 1 vez.

**Total:**
```json
{
  "max_total_uses": 100
}
```
La promo se desactiva después de 100 usos totales.

### Vigencia

```json
{
  "starts_at": "2025-12-01T00:00:00Z",
  "ends_at": "2025-12-31T23:59:59Z"
}
```
La promo solo está activa en ese rango de fechas.

## 🎯 Ventajas del Nuevo Sistema

1. **Flexibilidad Total**
   - Crea cualquier tipo de promoción
   - Combina reglas como quieras
   - No estás limitado a patrones predefinidos

2. **Control Granular**
   - Elige exactamente qué SKUs participan
   - Configura prioridades
   - Establece límites de uso

3. **Gestión Centralizada**
   - Todo desde el admin panel
   - No necesitas tocar código
   - Activa/desactiva con un click

4. **Separación de Concerns**
   - Badges = Visual
   - Promociones = Lógica
   - Cada uno cumple su función

5. **Escalable**
   - Agrega nuevos tipos fácilmente
   - Extiende el motor de promociones
   - Base de datos optimizada

## 🔄 Migración desde V1

Si tenías promociones inferidas del badge:

1. **Crear promociones en admin**
   - Por cada badge "2x1" → Crear promo NxM
   - Configurar SKUs elegibles manualmente

2. **Mantener badges visuales**
   - Los badges siguen mostrándose
   - Solo cambia la lógica interna

3. **Probar en staging**
   - Verificar que los descuentos se aplican correctamente
   - Ajustar prioridades si es necesario

## 📊 Monitoreo

**Métricas disponibles:**
- `current_uses` - Contador de usos de cada promo
- Logs en consola del motor de promociones
- Desglose detallado en checkout

**Próximas mejoras sugeridas:**
- Dashboard de analytics de promociones
- A/B testing de diferentes configuraciones
- Notificaciones cuando una promo está cerca del límite

## 🐛 Troubleshooting

**Promoción no se aplica:**
1. Verificar que está activa
2. Revisar fechas de vigencia
3. Confirmar que los SKUs coinciden
4. Verificar cantidad mínima
5. Revisar límites de uso

**Descuento incorrecto:**
1. Verificar prioridad (puede haber otra promo aplicándose primero)
2. Revisar config del tipo de promo
3. Confirmar que el match_type es correcto

**Performance:**
- Las promociones se cachean en el carrito
- Se recargan cada 5 minutos
- El cálculo es O(n*m) donde n=items, m=promos

---

**Fecha de implementación:** 2025-10-12  
**Versión:** 2.0.0  
**Autor:** Sistema de Promociones Busy
