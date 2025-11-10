# 🚀 Optimización de Image Cache Reads - Vercel

## 📊 Problema Identificado

**Fecha:** 10 Nov 2025  
**Alerta:** 75% del límite gratuito usado (300,000 reads)  
**Período:** 7 días (123,165 reads)  
**Proyección:** ~525,000 reads/mes → **Excede límite gratuito**

---

## 🔍 Causas Principales

### 1. **Hero Banner GIFs** (CRÍTICO 🔴)
**Problema:**
- 3 GIFs (`hero-1.gif`, `hero-2.gif`, `hero-3.gif`) cargando simultáneamente
- Todos renderizados en DOM, solo cambiando `opacity`
- Cada GIF procesado por Next.js Image → múltiples transformaciones
- Quality 90 → archivos muy pesados

**Impacto estimado:** ~40% del consumo total

**Solución aplicada:**
```tsx
// ANTES: Todos los GIFs cargados simultáneamente
{images.map((src, index) => (
  <Image src={src} priority={index === 0} quality={90} />
))}

// DESPUÉS: Solo cargar imagen actual + siguiente
{images.map((src, index) => (
  (index === currentIndex || index === (currentIndex + 1) % images.length) ? (
    <Image 
      src={src} 
      quality={75} 
      unoptimized={true}  // GIFs no necesitan optimización
    />
  ) : null
))}
```

**Ahorro:** ~60% en hero banner

---

### 2. **Imágenes Duplicadas en Product Gallery** (ALTO 🟠)
**Problema:**
- `product-bg.jpg` renderizado 3 veces en imagen principal
- `product-bg.jpg` renderizado en cada thumbnail (4x)
- Total: **5 requests innecesarios por producto**

**Impacto estimado:** ~30% del consumo total

**Solución aplicada:**
```tsx
// ANTES: 3 backgrounds en main image
<Image src="/product-bg.jpg" />
<Image src="/product-bg.jpg" />
<Image src={productImage} />

// DESPUÉS: 1 background + producto
<Image src="/product-bg.jpg" />
<Image src={productImage} />

// ANTES: Background en cada thumbnail
<Image src="/product-bg.jpg" />
<Image src={thumbnailImage} />

// DESPUÉS: Solo thumbnail
<Image src={thumbnailImage} />
```

**Ahorro:** ~40% en product pages

---

### 3. **SVGs Optimizados Innecesariamente** (MEDIO 🟡)
**Problema:**
- SVG icons (16x16px) procesados por Next.js Image
- SVGs son vectoriales → no necesitan optimización

**Impacto estimado:** ~10% del consumo total

**Solución aplicada:**
```tsx
// ANTES
<Image src="/icons/checkroom.svg" width={16} height={16} />

// DESPUÉS
<Image 
  src="/icons/checkroom.svg" 
  width={16} 
  height={16} 
  unoptimized={true}  // Skip optimization para SVGs
/>
```

**Ahorro:** ~100% en SVG icons

---

## 📈 Resultados Esperados

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Cache Reads/día** | ~17,595 | ~7,918 | **-55%** |
| **Cache Reads/mes** | ~525,000 | ~236,250 | **-55%** |
| **Uso del límite** | 175% | 79% | **✅ Dentro del límite** |

---

## ✅ Archivos Modificados

1. **`components/home/auto-slider-banner.tsx`**
   - Render condicional de GIFs (solo actual + siguiente)
   - `unoptimized={true}` para GIFs
   - Quality reducido de 90 → 75

2. **`components/shop/product-gallery.tsx`**
   - Eliminadas 2 imágenes duplicadas en main image
   - Eliminado background en thumbnails

3. **`components/shop/product-card.tsx`**
   - `unoptimized={true}` para SVG icons en tooltips

---

## 🎯 Mejores Prácticas Implementadas

### ✅ DO's

1. **GIFs y animaciones:** Usar `unoptimized={true}`
   ```tsx
   <Image src="/animation.gif" unoptimized={true} />
   ```

2. **SVGs pequeños (<50KB):** Usar `unoptimized={true}`
   ```tsx
   <Image src="/icon.svg" width={24} height={24} unoptimized={true} />
   ```

3. **Lazy loading:** Solo `priority={true}` para above-the-fold
   ```tsx
   <Image src="/hero.jpg" priority={true} />  // Solo primera imagen
   <Image src="/product.jpg" loading="lazy" />  // Resto
   ```

4. **Quality apropiado:**
   - Hero/Marketing: 75-80
   - Productos: 75
   - Thumbnails: 70
   - Backgrounds/Patterns: 60

5. **Render condicional:** No cargar imágenes ocultas
   ```tsx
   {isVisible && <Image src="/image.jpg" />}
   ```

### ❌ DON'Ts

1. **NO** optimizar GIFs con Next.js Image
2. **NO** renderizar múltiples imágenes idénticas
3. **NO** usar `priority={true}` en todas las imágenes
4. **NO** usar quality > 85 (diferencia imperceptible)
5. **NO** cargar todas las imágenes de un slider simultáneamente

---

## 🔧 Configuración Actual

**`next.config.mjs`:**
```js
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 828, 1200, 1920, 2048],
  imageSizes: [384],
  minimumCacheTTL: 31536000,  // 1 año
}
```

**`lib/imageConfig.ts`:**
- 6 widths estratégicos (reducido de 16)
- Configuraciones predefinidas por tipo de imagen
- Normalización de URLs para evitar cache misses

---

## 📊 Monitoreo

**Verificar en Vercel Dashboard:**
1. Ir a: https://vercel.com/[tu-proyecto]/analytics/usage
2. Sección: "Image Optimization - Cache Reads"
3. Objetivo: Mantener < 80% del límite mensual

**Alertas configuradas:**
- 75% → Revisar optimizaciones
- 90% → Considerar upgrade a Pro
- 100% → Servicio interrumpido

---

## 🚨 Si Vuelve a Pasar

### Opción 1: Auditar nuevas imágenes
```bash
# Buscar imágenes sin optimizar
grep -r "next/image" components/ app/ | grep -v "unoptimized"

# Buscar imágenes con priority
grep -r "priority={true}" components/ app/
```

### Opción 2: Mover imágenes estáticas a CDN externo
- Cloudinary (Free tier: 25GB/mes)
- imgix (Free tier: 1,000 master images)
- Supabase Storage (Ya configurado)

### Opción 3: Upgrade a Vercel Pro
- $20/mes
- 5,000,000 cache reads/mes
- Mejor opción si el tráfico sigue creciendo

---

## 📝 Notas Adicionales

- **Supabase Storage:** Ya configurado en `next.config.mjs` con `remotePatterns`
- **Cache TTL:** 1 año para imágenes optimizadas (immutable)
- **Formatos:** AVIF first, WebP fallback
- **Lazy loading:** Automático para imágenes fuera del viewport

---

**Última actualización:** 10 Nov 2025  
**Próxima revisión:** 17 Nov 2025 (verificar métricas post-optimización)
