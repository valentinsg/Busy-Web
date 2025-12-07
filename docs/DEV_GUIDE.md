# 🛠️ Guía de Desarrollo - Busy Web

> Guía práctica para desarrolladores. Para arquitectura técnica ver `ARCHITECTURE.md`.

---

## 🚀 Quick Start

### 1. Clonar y configurar

```bash
# Clonar el repo
git clone https://github.com/valentinsg/Busy-Web.git
cd Busy-Web

# Instalar dependencias (usamos pnpm)
pnpm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con las credenciales reales
```

### 2. Iniciar desarrollo

```bash
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Iniciar build de producción |
| `pnpm lint` | Verificar errores de ESLint |
| `pnpm lint:fix` | Corregir errores de ESLint |
| `pnpm typecheck` | Verificar tipos de TypeScript |
| `pnpm format` | Formatear código con Prettier |
| `pnpm format:check` | Verificar formato |
| `pnpm clean` | Limpiar cache de Next.js |
| `pnpm clean:full` | Limpiar todo y reinstalar |

---

## 🌿 Flujo de Git

### Branches

```
master          ← Producción (busy.com.ar)
  │
  └── preview   ← Staging para testing
        │
        ├── feature/nueva-feature
        ├── fix/bug-description
        └── benja  ← Branch personal de Benja
```

### Workflow

1. **Crear branch desde preview**
   ```bash
   git checkout preview
   git pull origin preview
   git checkout -b feature/mi-feature
   ```

2. **Desarrollar y commitear**
   ```bash
   git add .
   git commit -m "feat: descripción del cambio"
   ```

3. **Push y PR**
   ```bash
   git push origin feature/mi-feature
   # Crear PR en GitHub: feature/mi-feature → preview
   ```

4. **Después de aprobar**
   - Merge a `preview` para testing
   - Si todo OK, merge `preview` → `master`

### Convención de Commits

```
tipo: descripción corta

Tipos:
- feat:     Nueva funcionalidad
- fix:      Corrección de bug
- docs:     Documentación
- style:    Formato (no afecta lógica)
- refactor: Refactorización
- test:     Tests
- chore:    Mantenimiento
```

**Ejemplos:**
```bash
git commit -m "feat: agregar filtro por color en productos"
git commit -m "fix: corregir cálculo de envío gratis"
git commit -m "docs: actualizar README con nuevos scripts"
```

---

## 📁 Dónde Poner Cada Cosa

### Nuevo componente

```
components/
├── shop/           # Componentes de e-commerce
├── blog/           # Componentes del blog
├── admin/          # Componentes del admin
├── ui/             # Primitivos (shadcn/ui)
└── [feature]/      # Agrupar por feature
```

### Nueva página

```
app/
├── (public)/       # Páginas públicas
├── admin/          # Panel de admin
└── api/            # API routes
```

### Nuevo tipo

```typescript
// Agregar en types/[categoria].ts
// Exportar en types/index.ts

// Ejemplo: types/product.ts
export interface MiNuevoTipo {
  id: string
  // ...
}

// types/index.ts
export type { MiNuevoTipo } from './product'
```

### Nueva función de utilidad

```
lib/
├── repo/           # Acceso a datos (Supabase)
├── checkout/       # Lógica de checkout
├── email/          # Sistema de emails
└── utils.ts        # Utilidades generales
```

---

## 🎨 Estilos y UI

### Tailwind CSS

Usamos Tailwind con la configuración en `tailwind.config.ts`.

**Colores custom:**
```tsx
// Usar colores del tema
<div className="bg-background text-foreground" />
<div className="bg-accent-brand" />  // Color de marca
<div className="bg-muted" />         // Fondo secundario
```

### shadcn/ui

Componentes en `components/ui/`. Para agregar nuevos:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```

### Animaciones

```tsx
// Framer Motion (micro-interacciones)
import { motion } from 'framer-motion'
import { FadeIn } from '@/motion'

// GSAP (scroll animations)
import { useGsapScrollTrigger } from '@/motion'
```

---

## 🗄️ Base de Datos (Supabase)

### Acceso a datos

```typescript
// Client-side
import { supabase } from '@/lib/supabase/client'

// Server-side (Server Components, API Routes)
import getServiceClient from '@/lib/supabase/server'

const supabase = await getServiceClient()
```

### Repositorios

Usar los repositorios en `lib/repo/` en lugar de queries directas:

```typescript
// ✅ Correcto
import { getProductsAsync } from '@/lib/repo/products'
const products = await getProductsAsync({ category: 'remeras' })

// ❌ Evitar queries directas en componentes
const { data } = await supabase.from('products').select('*')
```

### Migraciones

Las migraciones están en `supabase/schema/`. Para aplicar:

1. Ir a Supabase Dashboard → SQL Editor
2. Copiar y ejecutar el contenido del archivo `.sql`

---

## 🔧 Debugging

### Errores comunes

**1. Error de dependencias**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**2. Error de tipos**
```bash
pnpm typecheck
# Ver errores específicos
```

**3. Error de Next.js / cache**
```bash
pnpm clean
# o en Windows:
Remove-Item -Recurse -Force .next
```

**4. Puerto ocupado**
```bash
pnpm dev -p 3001
```

### Logs útiles

```typescript
// En desarrollo, usar console.log
console.log('Debug:', variable)

// Para errores
console.error('Error:', error)

// En producción, los logs van a Vercel
```

---

## 📝 Tipos TypeScript

### Importar tipos

```typescript
// ✅ Importar desde @/types
import type { Product, CartItem, Order } from '@/types'

// ❌ No importar desde archivos individuales
import type { Product } from '@/types/product'
```

### Tipos principales

| Tipo | Descripción | Archivo |
|------|-------------|---------|
| `Product` | Producto del catálogo | `types/product.ts` |
| `CartItem` | Item en el carrito | `types/cart.ts` |
| `Order` | Orden de compra | `types/commerce.ts` |
| `Promotion` | Promoción activa | `types/promotion.ts` |
| `Tournament` | Torneo Blacktop | `types/blacktop.ts` |
| `BlogPost` | Post del blog | `types/blog.ts` |
| `Notification` | Notificación admin | `types/notifications.ts` |

---

## 🌍 Traducciones (i18n)

### Agregar traducción

1. Editar `locales/es.json` y `locales/en.json`
2. Usar el hook:

```tsx
import { useTranslations } from '@/hooks/use-translations'

function MiComponente() {
  const t = useTranslations('product')

  return <label>{t('size')}</label>
}
```

### Namespaces

- `nav` - Navegación
- `footer` - Footer
- `home` - Página de inicio
- `product` - Detalle de producto
- `cart` - Carrito
- `checkout` - Checkout
- `blog` - Blog

---

## 🧪 Testing

### Verificar antes de PR

```bash
# 1. Verificar tipos
pnpm typecheck

# 2. Verificar lint
pnpm lint

# 3. Verificar build
pnpm build

# 4. Probar manualmente en localhost
pnpm dev
```

### Checklist de PR

- [ ] El código compila sin errores
- [ ] ESLint no reporta errores
- [ ] Probé la funcionalidad en localhost
- [ ] Actualicé la documentación si es necesario
- [ ] El commit sigue la convención

---

## 📚 Recursos

### Documentación del proyecto

- `docs/ARCHITECTURE.md` - Arquitectura técnica
- `docs/FEATURES_GUIDE.md` - Guía por features
- `docs/GUIA-RAPIDA.md` - Referencia rápida

### Documentación externa

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion/)

---

## ❓ FAQ

### ¿Cómo agrego un nuevo producto?

1. Ir a `/admin/products/new`
2. Completar el formulario
3. Las imágenes se suben automáticamente a Supabase Storage

### ¿Cómo creo una nueva promoción?

1. Ir a `/admin/promotions/new`
2. Elegir tipo (2x1, porcentaje, etc.)
3. Configurar SKUs elegibles

### ¿Cómo pruebo el checkout?

1. Agregar productos al carrito
2. Ir a checkout
3. Para Mercado Pago en desarrollo, usar tarjetas de prueba

### ¿Cómo veo los logs de producción?

1. Ir a [Vercel Dashboard](https://vercel.com)
2. Seleccionar el proyecto
3. Ver "Logs" en el menú

---

*¿Dudas? Preguntale a Valen o revisá la documentación.*
