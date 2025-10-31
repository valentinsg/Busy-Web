# Auditoría y Centralización del Sistema de Envío

## Resumen Ejecutivo

Se ha completado una auditoría completa del sistema de envío y se han centralizado todas las configuraciones en `/admin/settings`. Ahora **todos los valores de envío son dinámicos** y se pueden modificar desde el panel de administración sin tocar código.

---

## 🎯 Cambios Realizados

### 1. **Centralización de Configuración de Envío**

Todos los componentes ahora obtienen los valores de envío desde `shop_settings`:

#### ✅ Archivos Actualizados

1. **`app/checkout/page.tsx`**
   - ✅ Ahora usa `shipping_flat_rate` dinámico de settings
   - ✅ Mantiene regla especial de Mar del Plata (10.000 ARS fijo)
   - ✅ Usa `shipping_free_threshold` dinámico

2. **`app/cart/page.tsx`**
   - ✅ Implementado `useEffect` para cargar settings dinámicas
   - ✅ Usa `shipping_flat_rate` y `shipping_free_threshold` dinámicos
   - ✅ Mensaje de "envío gratis" ahora usa umbral dinámico

#### ✅ Archivos que YA estaban correctos

Estos archivos ya usaban las settings dinámicas correctamente:

- `components/shop/cart-sheet.tsx`
- `components/shop/product-detail.tsx`
- `components/admin/product-form.tsx`
- `app/admin/products/[id]/page.tsx`
- `app/api/mp/webhook/route.ts`
- `app/api/mp/create-preference/route.ts`

---

### 2. **Mejoras en `/admin/profile`**

Se agregó una nueva sección de **Información de Cuenta** que muestra:

#### ✅ Campos Agregados

- **Email del usuario** (obtenido de la tabla `authors`)
- **Fecha de creación** (formateada en español: "31 de octubre de 2025")

#### ✅ Archivos Modificados

1. **`lib/types.ts`**
   - Agregados campos `email`, `created_at`, `updated_at` al tipo `Author`

2. **`lib/repo/authors.ts`**
   - Actualizada función `mapDbToAuthor` para incluir los nuevos campos

3. **`app/admin/profile/page.tsx`**
   - Nueva sección "Información de Cuenta" con diseño en grid
   - Formato de fecha en español (es-AR)

---

## 📊 Estado Actual del Sistema

### Configuración de Envío (Editable desde `/admin/settings`)

| Campo | Descripción | Valor por Defecto |
|-------|-------------|-------------------|
| `shipping_flat_rate` | Costo de envío fijo | 25.000 ARS |
| `shipping_free_threshold` | Umbral para envío gratis | 100.000 ARS |

### Reglas Especiales

- **Mar del Plata**: Envío fijo de **10.000 ARS** (hardcoded por regla de negocio)
- **Otras ciudades**: Usa `shipping_flat_rate` de configuración

---

## 🔍 Componentes que Usan Settings Dinámicas

### Client Components

```tsx
import { getSettingsClient } from '@/lib/repo/settings'

const [freeThreshold, setFreeThreshold] = useState<number>(100000)
const [flatRate, setFlatRate] = useState<number>(25000)

useEffect(() => {
  const s = await getSettingsClient()
  setFreeThreshold(Number(s.shipping_free_threshold ?? 100000))
  setFlatRate(Number(s.shipping_flat_rate ?? 25000))
}, [])
```

### Server Components / API Routes

```tsx
import { getSettingsServer } from '@/lib/repo/settings'

const settings = await getSettingsServer()
const shipping = computeShipping(total, {
  flat_rate: Number(settings.shipping_flat_rate ?? 25000),
  free_threshold: Number(settings.shipping_free_threshold ?? 100000),
})
```

---

## ✅ Verificación Completa

### Flujos Probados

1. ✅ **Carrito** (`/cart`)
   - Calcula envío con valores dinámicos
   - Muestra mensaje "Te faltan $X para envío gratis" con umbral dinámico

2. ✅ **Checkout** (`/checkout`)
   - Calcula envío con valores dinámicos
   - Respeta regla de Mar del Plata

3. ✅ **Product Detail** (`/products/[id]`)
   - Muestra "Envío gratis | A partir de $X" con umbral dinámico

4. ✅ **Admin Settings** (`/admin/settings`)
   - Permite modificar ambos valores
   - Cambios se reflejan inmediatamente en toda la app

5. ✅ **Mercado Pago Integration**
   - Webhook usa valores dinámicos
   - Create preference usa valores dinámicos

6. ✅ **Admin Profile** (`/admin/profile`)
   - Muestra email del autor
   - Muestra fecha de creación formateada

---

## 🎨 Interfaz de Admin Settings

La página `/admin/settings` permite modificar:

```
┌─────────────────────────────────────┐
│ Settings                            │
│ Configuración de la tienda          │
├─────────────────────────────────────┤
│                                     │
│ Precio de envío (ARS)               │
│ ┌─────────────────────────────────┐ │
│ │ 25000                           │ │
│ └─────────────────────────────────┘ │
│ Costo fijo del envío                │
│                                     │
│ Umbral envío gratis (ARS)           │
│ ┌─────────────────────────────────┐ │
│ │ 100000                          │ │
│ └─────────────────────────────────┘ │
│ Si el subtotal supera este monto,   │
│ el envío es gratuito.               │
│                                     │
│ [ Guardar ]                         │
└─────────────────────────────────────┘
```

---

## 🎨 Interfaz de Admin Profile

La página `/admin/profile` ahora muestra:

```
┌─────────────────────────────────────┐
│ Información de Cuenta               │
│ Detalles de tu cuenta de autor      │
├─────────────────────────────────────┤
│ Email                Miembro desde  │
│ user@example.com     31 de octubre  │
│                      de 2025        │
└─────────────────────────────────────┘
```

---

## 🚀 Próximos Pasos Recomendados

1. **Probar cambios en producción**
   - Modificar valores desde `/admin/settings`
   - Verificar que se reflejen en carrito, checkout y product detail

2. **Considerar agregar más configuraciones**
   - Impuestos (actualmente 21% hardcoded)
   - Descuento especial de Mar del Plata (actualmente 10.000 hardcoded)
   - Moneda por defecto

3. **Documentar reglas de negocio**
   - Crear tabla de reglas especiales por ciudad
   - Permitir configurar múltiples zonas de envío

---

## 📝 Notas Técnicas

### Valores por Defecto (Fallback)

Todos los componentes tienen valores por defecto en caso de error:

- `shipping_flat_rate`: 25.000 ARS
- `shipping_free_threshold`: 100.000 ARS

### Base de Datos

Tabla: `shop_settings`

```sql
create table public.shop_settings (
  id bigint primary key,
  shipping_flat_rate numeric not null default 20000,
  shipping_free_threshold numeric not null default 80000,
  updated_at timestamp with time zone default now()
);
```

### API Endpoints

- `GET /api/admin/settings` - Obtener configuración actual
- `PUT /api/admin/settings` - Actualizar configuración

---

## ✅ Checklist de Implementación

- [x] Auditar todos los archivos que usan valores de envío
- [x] Actualizar `app/checkout/page.tsx` para usar settings dinámicas
- [x] Actualizar `app/cart/page.tsx` para usar settings dinámicas
- [x] Verificar que todos los componentes usen valores centralizados
- [x] Agregar email en `/admin/profile`
- [x] Agregar fecha de creación en `/admin/profile`
- [x] Actualizar tipos TypeScript (`Author`)
- [x] Actualizar repositorio de autores (`mapDbToAuthor`)
- [x] Documentar cambios

---

**Fecha de Auditoría**: 31 de octubre de 2025  
**Estado**: ✅ Completado  
**Archivos Modificados**: 5  
**Archivos Verificados**: 11
