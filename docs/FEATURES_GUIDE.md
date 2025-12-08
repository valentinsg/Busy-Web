# 📖 Guía de Features - Busy Web

> Mini manual por cada feature del sistema.

---

## 🛒 Tienda (Shop)

### Archivos clave

```
app/products/page.tsx           # Listado de productos
app/product/[slug]/page.tsx     # Detalle de producto
components/shop/product-card.tsx
components/shop/product-detail.tsx
components/shop/add-to-cart.tsx
lib/repo/products.ts            # Repositorio de productos
```

### Flujo

1. Usuario navega a `/products`
2. Ve grid de productos con filtros
3. Click en producto → `/product/[slug]`
4. Selecciona talle/color
5. Click "Agregar al carrito"

### Filtros disponibles

- Categoría (remeras, buzos, accesorios, pantalones)
- Color
- Talle
- Precio (min/max)
- Ordenamiento (precio, rating, más nuevo)

### Agregar producto (Admin)

1. Ir a `/admin/products/new`
2. Completar: nombre, precio, SKU, descripción
3. Subir imágenes (se optimizan automáticamente)
4. Configurar stock por talle
5. Guardar

---

## 🛍️ Carrito

### Archivos clave

```
hooks/use-cart.ts               # Estado con Zustand
components/shop/cart-sheet.tsx  # Drawer del carrito
app/cart/page.tsx               # Página del carrito
```

### Estado (Zustand)

```typescript
interface CartStore {
  items: CartItem[]
  coupon: Coupon | null
  promotions: Promotion[]

  addItem(product, size, color, qty)
  removeItem(productId, size, color)
  updateQuantity(productId, qty, size, color)
  clearCart()
  applyCoupon(code)

  getTotalItems()
  getSubtotal()
  getDiscount()
  getSubtotalAfterDiscount()
}
```

### Persistencia

El carrito se guarda en `localStorage` con la key `busy-cart-storage`.

### Promociones automáticas

Las promociones se cargan al iniciar y se aplican automáticamente:

```typescript
// En el layout o provider
const promotions = await getActivePromotionsAsync()
useCart.getState().setPromotions(promotions)
```

---

## 💳 Checkout

### Archivos clave

```
app/checkout/page.tsx           # Página principal
app/checkout/success/page.tsx   # Pago exitoso
app/checkout/failure/page.tsx   # Pago fallido
app/checkout/pending/page.tsx   # Pago pendiente
components/checkout/pay-with-mercadopago.tsx
components/checkout/pay-with-transfer.tsx
lib/checkout/promo-engine.ts    # Motor de promociones
lib/checkout/totals.ts          # Cálculo de totales
```

### Métodos de pago

1. **Mercado Pago** - Tarjeta, débito, efectivo
2. **Transferencia** - Pago manual, orden queda pendiente

### Flujo de Mercado Pago

```
1. Usuario completa datos
2. Click "Pagar con MP"
3. API crea preferencia → /api/mp/create-preference
4. Redirect a checkout de MP
5. MP procesa pago
6. Webhook recibe notificación → /api/mp/webhook
7. Se actualiza orden en DB
8. Redirect a /checkout/success o /failure
```

### Cálculo de envío

```typescript
// lib/checkout/totals.ts
// Gratis si subtotal >= $100.000
// Sino: $25.000 (o $10.000 para Mar del Plata)
```

---

## 💰 Mercado Pago

### Archivos clave

```
app/api/mp/create-preference/route.ts  # Crear preferencia
app/api/mp/webhook/route.ts            # Recibir notificaciones
lib/mp/                                 # Utilidades
```

### Variables de entorno

```env
MP_ACCESS_TOKEN=APP_USR-xxx
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxx
```

### Webhook

El webhook recibe notificaciones de MP y:
1. Verifica el pago
2. Actualiza estado de la orden
3. Descuenta stock
4. Envía email de confirmación
5. Crea notificación para admin

---

## 📝 Blog

### Archivos clave

```
app/blog/page.tsx               # Listado de posts
app/blog/[slug]/page.tsx        # Post individual
components/blog/blog-client.tsx
components/blog/post-card.tsx
components/blog/author-card.tsx
lib/blog.ts                     # Funciones del blog
```

### Crear post (Admin)

1. Ir a `/admin/blog/new`
2. Escribir en Markdown
3. Agregar cover, tags, categoría
4. Vista previa en tiempo real
5. Publicar

### Markdown soportado

- Headers, listas, links
- Imágenes
- Código con syntax highlighting
- Tablas
- FAQs (para SEO)

---

## 🖼️ Files (Galería)

### Archivos clave

```
app/files/page.tsx              # Grid de fotos
app/files/[id]/page.tsx         # Detalle de foto
components/files/files-grid.tsx
components/files/files-masonry.tsx
components/files/files-detail.tsx
lib/supabase/files.ts
```

### Storage

Las imágenes se guardan en **Cloudflare R2** (más barato que Supabase Storage).

### Filtros

- Color
- Mood (día, noche, etc.)
- Lugar
- Persona
- Tags

### Subir foto (Admin)

1. Ir a `/admin/files`
2. Drag & drop o seleccionar archivo
3. Se procesa con Sharp (resize, optimización)
4. Se sube a R2
5. Se guarda metadata en Supabase

---

## 🎵 Playlists

### Archivos clave

```
app/playlists/page.tsx          # Listado
app/playlists/[slug]/page.tsx   # Detalle con embed
components/playlists/playlist-card.tsx
lib/repo/playlists.ts
```

### Embed de Spotify

```tsx
<iframe
  src={`https://open.spotify.com/embed/playlist/${playlistId}`}
  width="100%"
  height="352"
  allow="autoplay; clipboard-write; encrypted-media"
/>
```

### Propuestas de artistas

Los artistas pueden enviar su música en `/playlists` → formulario de propuesta.

Admin revisa en `/admin/artist-submissions`.

---

## 🏀 Blacktop (Torneos)

### Archivos clave

```
app/blacktop/page.tsx                    # Listado de torneos
app/blacktop/[slug]/page.tsx             # Detalle de torneo
app/blacktop/[slug]/register/page.tsx    # Inscripción
components/blacktop/registration-form.tsx
components/admin/blacktop/tournament-form.tsx
components/admin/blacktop/live-scorekeeper-v2.tsx
lib/blacktop/                            # Lógica de torneos
types/blacktop.ts                        # Tipos
```

### Entidades

```
Tournament
  ├── Teams[]
  │     └── Players[]
  ├── Matches[]
  │     ├── PlayerMatchStats[]
  │     └── TeamMatchStats[]
  └── Groups[] (si es formato grupos)
```

### Formatos

- `groups_playoff` - Fase de grupos + playoffs
- `single_elimination` - Eliminación directa
- `round_robin` - Todos contra todos

### Flujo de torneo

1. Admin crea torneo en `/admin/blacktop/new`
2. Equipos se inscriben en `/blacktop/[slug]/register`
3. Admin aprueba equipos
4. Admin genera fixture
5. Durante el torneo: scorekeeper en vivo
6. Se actualizan standings automáticamente

### Scorekeeper

El scorekeeper (`live-scorekeeper-v2.tsx`) permite:
- Marcar puntos por jugador
- Registrar faltas
- Controlar tiempo
- Finalizar partido
- Ver estadísticas en tiempo real

---

## 🌍 i18n (Traducciones)

### Archivos clave

```
locales/es.json                 # Español
locales/en.json                 # Inglés
hooks/use-translations.ts       # Hook
components/i18n-provider.tsx    # Provider
```

### Uso

```tsx
import { useTranslations } from '@/hooks/use-translations'

function MiComponente() {
  const t = useTranslations('product')

  return (
    <div>
      <label>{t('size')}</label>
      <span>{t('free_shipping_from', { amount: '$100.000' })}</span>
    </div>
  )
}
```

### Agregar traducción

1. Editar `locales/es.json`:
```json
{
  "mi_namespace": {
    "mi_key": "Mi texto en español"
  }
}
```

2. Editar `locales/en.json`:
```json
{
  "mi_namespace": {
    "mi_key": "My text in English"
  }
}
```

### Cambiar idioma

El idioma se guarda en cookie `busy_locale`. Se puede cambiar desde el footer.

---

## 👤 Admin Panel

### Archivos clave

```
app/admin/layout.tsx            # Layout con sidebar
app/admin/page.tsx              # Dashboard
components/admin/admin-guard.tsx
components/admin/admin-sidebar-menu.tsx
```

### Autenticación

```tsx
// components/admin/admin-guard.tsx
// Verifica sesión de Supabase
// Redirige a login si no está autenticado
```

### Secciones

| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard con KPIs |
| `/admin/orders` | Gestión de órdenes |
| `/admin/products` | Gestión de productos |
| `/admin/blog` | Gestión del blog |
| `/admin/files` | Gestión de galería |
| `/admin/blacktop` | Gestión de torneos |
| `/admin/promotions` | Promociones |
| `/admin/coupons` | Cupones |
| `/admin/customers` | Clientes |
| `/admin/analytics` | Métricas |
| `/admin/settings` | Configuración |

---

## 🔍 SEO

### Archivos clave

```
app/layout.tsx                  # Metadata global + schemas
app/[page]/page.tsx             # generateMetadata() por página
next-sitemap.config.js          # Configuración de sitemap
```

### Schemas implementados

- Organization
- LocalBusiness (showroom)
- WebSite con SearchAction
- Product (en páginas de producto)
- Article (en posts del blog)
- FAQPage (en about y FAQ)

### Metadata dinámica

```tsx
// app/product/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug)

  return {
    title: `${product.name} | Busy Streetwear`,
    description: product.description,
    openGraph: {
      images: [product.images[0]],
    },
  }
}
```

### Sitemap

Se genera automáticamente en el build con `next-sitemap`.

---

## 📧 Emails

### Archivos clave

```
lib/email/send.ts               # Función principal
lib/email/templates/            # Templates HTML
lib/email/hooks.ts              # Triggers automáticos
```

### Enviar email

```typescript
import { sendEmail } from '@/lib/email'

await sendEmail({
  template: 'new-order',
  to: 'admin@busy.com.ar',
  data: { orderId, customerName, total }
})
```

### Templates

- `new-order` - Nueva orden (admin)
- `pending-transfer` - Pago pendiente (cliente)
- `order-cancelled` - Orden cancelada (cliente)
- `low-stock` - Stock bajo (admin)
- `newsletter-welcome` - Bienvenida newsletter

---

## 🔔 Notificaciones

### Archivos clave

```
lib/notifications/server.ts     # Crear notificaciones
lib/notifications/push.ts       # Push notifications
components/admin/notifications-bell.tsx
```

### Crear notificación

```typescript
import { createNotification } from '@/lib/notifications/server'

await createNotification({
  type: 'new_order',
  title: 'Nueva orden',
  message: `Orden #${orderId} - $${total}`,
  metadata: { orderId }
})
```

### Push notifications

Requiere que el admin acepte notificaciones en el browser.

---

*Para más detalles técnicos, ver `ARCHITECTURE.md`.*
