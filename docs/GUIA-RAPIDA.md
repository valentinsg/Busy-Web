# Guía Rápida para Desarrolladores 🚀

Referencia rápida de las cosas más comunes que vas a necesitar.

---

## 🛒 E-Commerce (Tienda)

### Agregar/Editar Productos
- **Admin**: `/admin/products`
- **Componente form**: `components/admin/product-form.tsx`
- **Repo**: `lib/repo/products.ts`
- **Tipos**: `types/commerce.ts` → `Product`

### Carrito
- **Hook**: `hooks/use-cart.ts` (usa Zustand)
- **Componente**: `components/shop/cart-sheet.tsx`
- **Uso**:
```typescript
const { items, addItem, removeItem, clearCart, total } = useCart()
```

### Checkout
- **Página**: `app/checkout/page.tsx`
- **Lógica de totales**: `lib/checkout/totals.ts`
- **Cupones**: `lib/checkout/coupons.ts`
- **Mercado Pago**: `lib/mp/client.ts`

### Configuración de Envío
- **Admin**: `/admin/settings`
- **Repo**: `lib/repo/settings.ts`
- Valores: `shipping_flat_rate` y `shipping_free_threshold`

---

## 📝 Blog

### Crear/Editar Posts
- **Admin**: `/admin/blog`
- **Editor**: `components/admin/blog-editor.tsx`
- **Repo**: `lib/blog.ts`
- **Tipos**: `types/blog.ts` → `Post`, `Author`

### Mostrar Posts
- **Listado**: `app/blog/page.tsx`
- **Detalle**: `app/blog/[slug]/page.tsx`
- **Card**: `components/blog/post-card.tsx`

---

## 🏀 Blacktop (Torneos)

### Estructura
- **Páginas públicas**: `app/blacktop/`
- **Admin**: `app/admin/blacktop/`
- **Componentes**: `components/blacktop/`
- **Repo**: `lib/repo/blacktop.ts`
- **Lógica**: `lib/blacktop/` (fixtures, standings, playoffs)
- **Tipos**: `types/blacktop.ts`

### Entidades
- `Tournament` - Torneo
- `Team` - Equipo
- `Player` - Jugador
- `Match` - Partido

---

## 🖼️ Files (Galería)

### Estructura
- **Página**: `app/files/page.tsx`
- **Admin**: `app/admin/files/`
- **Componentes**: `components/files/`
- **Storage**: Cloudflare R2 (`lib/r2.ts`)
- **Tipos**: `types/files.ts`

---

## 🎵 Playlists

### Estructura
- **Página**: `app/playlists/page.tsx`
- **Admin**: `app/admin/playlists/`
- **Componentes**: `components/playlists/`
- **Repo**: `lib/repo/playlists.ts`
- **Tipos**: `types/playlists.ts`

---

## 🌍 Traducciones

### Archivos
- `locales/es.json` - Español
- `locales/en.json` - Inglés

### Uso
```typescript
import { useTranslations } from '@/hooks/use-translations'

function MiComponente() {
  const t = useTranslations('product') // namespace

  return <button>{t('add_to_cart')}</button>
}
```

### Agregar traducción
1. Abrir `locales/es.json`
2. Agregar la key en el namespace correcto:
```json
{
  "product": {
    "nueva_key": "Texto en español"
  }
}
```
3. Hacer lo mismo en `locales/en.json`

---

## 🎨 Componentes UI (shadcn/ui)

Los componentes base están en `components/ui/`. Son de shadcn/ui.

### Más usados
```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
```

---

## ✨ Animaciones

### Framer Motion (micro-interacciones)
```typescript
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Contenido
</motion.div>
```

### Sistema Motion (componentes listos)
```typescript
import { FadeIn, Confetti } from '@/motion'

<FadeIn direction="up">
  <div>Aparece desde abajo</div>
</FadeIn>
```

---

## 🗄️ Supabase (Base de Datos)

### Cliente
```typescript
// En el servidor (Server Components, API Routes)
import { createServerClient } from '@/lib/supabase/server'
const supabase = createServerClient()

// En el cliente (Client Components)
import { createBrowserClient } from '@/lib/supabase/client'
const supabase = createBrowserClient()
```

### Queries comunes
```typescript
// SELECT
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('active', true)

// INSERT
const { data } = await supabase
  .from('products')
  .insert({ name: 'Nuevo', price: 1000 })
  .select()
  .single()

// UPDATE
const { data } = await supabase
  .from('products')
  .update({ price: 2000 })
  .eq('id', 'xxx')

// DELETE
await supabase
  .from('products')
  .delete()
  .eq('id', 'xxx')
```

---

## 📧 Emails

### Enviar email
```typescript
import { sendEmail } from '@/lib/email/send'

await sendEmail({
  to: 'cliente@email.com',
  subject: 'Tu pedido',
  template: 'order-confirmation',
  data: { orderNumber: '123' }
})
```

### Templates
- `lib/email/templates/` - Plantillas HTML

---

## 🔔 Notificaciones Push

### Enviar notificación
```typescript
import { sendPushNotification } from '@/lib/notifications/send'

await sendPushNotification({
  title: 'Nuevo producto',
  body: 'Mirá lo nuevo que llegó',
  url: '/products'
})
```

---

## 🖼️ Imágenes

### Next.js Image
```typescript
import Image from 'next/image'

<Image
  src="/imagen.jpg"
  alt="Descripción"
  width={400}
  height={300}
  className="object-cover"
/>
```

### Imágenes remotas (Supabase/R2)
Ya están configuradas en `next.config.mjs`. Solo usar la URL directa.

---

## 🎯 Patrones Comunes

### Server Component con datos
```typescript
// app/products/page.tsx
import { getProducts } from '@/lib/repo/products'

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
```

### Client Component con estado
```typescript
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  )
}
```

### API Route
```typescript
// app/api/ejemplo/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const data = { mensaje: 'Hola' }
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  // hacer algo con body
  return NextResponse.json({ ok: true })
}
```

---

## 🐛 Debug Tips

### Ver logs del servidor
Los `console.log` en Server Components y API Routes aparecen en la terminal donde corre `pnpm dev`.

### Ver logs del cliente
Los `console.log` en Client Components aparecen en la consola del browser (F12).

### Errores de TypeScript
```bash
pnpm build
```
Muestra todos los errores de tipos.

### Errores de Supabase
Siempre revisar el objeto `error`:
```typescript
const { data, error } = await supabase.from('tabla').select()
if (error) {
  console.error('Error:', error.message)
}
```

---

## 📱 Responsive

### Breakpoints de Tailwind
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+
- `2xl:` - 1536px+

### Ejemplo
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- 1 columna en mobile, 2 en tablet, 3 en desktop -->
</div>
```

### Hook para detectar mobile
```typescript
import { useMobile } from '@/hooks/use-mobile'

const isMobile = useMobile()
```

---

## 🔗 Links Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase Docs](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/icons)

---

**¿Algo no está claro? Preguntá!** 🙋‍♂️
