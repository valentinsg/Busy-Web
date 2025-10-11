# ✅ Checklist de Optimización LCP

## 🚨 ACCIÓN REQUERIDA INMEDIATA

### 1. Agregar Imágenes del Hero Banner
**Ubicación**: `/public/`

Necesitas agregar estas 2 imágenes:
- [ ] `/public/hero-1.jpg` - Primera imagen del slider
- [ ] `/public/hero-2.jpg` - Segunda imagen del slider

**Opciones**:
1. **Usar imágenes existentes** de `/public/` que ya tengas
2. **Descargar y optimizar** los GIFs actuales:
   - https://64.media.tumblr.com/db8472cfbb89a155148003b053d5f3de/4d6d987e0cee7307-8e/s400x225/158142e8e876044a6191733a02f6ee5ac1643b58.gif
   - https://i.pinimg.com/originals/14/f4/35/14f435eaaf8d107cca5055ce150eaf47.gif
   - Convertir a JPG/WebP con https://squoosh.app
3. **Usar placeholders temporales**:
   ```bash
   # Copiar una imagen existente como placeholder
   cp public/showcase-busy-1.jpg public/hero-1.jpg
   cp public/showcase-busy-2.jpg public/hero-2.jpg
   ```

---

## ✅ Cambios Implementados (Ya Hechos)

- [x] Optimizado `AutoSliderBanner` para usar imágenes locales
- [x] Convertido homepage a Server Component con SSR
- [x] Creado `FeaturedProducts` component con datos pre-renderizados
- [x] Creado `HomeClient` component para secciones con i18n
- [x] Optimizado `ProductsClient` con initial data desde servidor
- [x] Agregado prop `priority` a `ProductCard`
- [x] Eliminada imagen de background duplicada en cards
- [x] Configurado `next.config.mjs` para optimización de imágenes
- [x] Removidos dominios externos de image optimization

---

## 📋 Pasos para Deploy

### 1. Agregar Imágenes (REQUERIDO)
```bash
# Opción A: Copiar imágenes existentes como placeholder
cp public/showcase-busy-1.jpg public/hero-1.jpg
cp public/showcase-busy-2.jpg public/hero-2.jpg

# Opción B: Agregar tus propias imágenes optimizadas
# Coloca hero-1.jpg y hero-2.jpg en /public/
```

### 2. Verificar Build Local
```bash
pnpm build
# Debe compilar sin errores
```

### 3. Commit y Push
```bash
git add .
git commit -m "feat: optimize LCP with SSR and image optimization

- Replaced external GIFs with local optimized images
- Implemented SSR for homepage and products page
- Added priority loading for above-the-fold images
- Removed duplicate background images from product cards
- Configured next.config for better image optimization

Expected LCP improvement:
- Homepage: 5.28s → ~2.0s (-62%)
- Products: 17.84s → ~2.5s (-86%)
- Admin: 4.54s → ~2.3s (-49%)"

git push origin main
```

### 4. Verificar en Vercel
1. Ir a https://vercel.com/dashboard
2. Esperar que termine el deploy
3. Ir a **Analytics** > **Speed Insights**
4. Verificar métricas de LCP después de 24-48h

---

## 🔍 Verificación Post-Deploy

### Checklist de Verificación
- [ ] Homepage carga sin errores
- [ ] Hero banner muestra las imágenes correctamente
- [ ] Productos se muestran en homepage
- [ ] Página /products carga productos inmediatamente
- [ ] No hay errores en consola del navegador
- [ ] LCP en Vercel Speed Insights <2.5s (esperar 24-48h)

### Comandos de Debugging
```bash
# Ver errores de build
pnpm build 2>&1 | grep -i error

# Verificar que las imágenes existen
ls -lh public/hero-*.jpg

# Test local
pnpm dev
# Abrir http://localhost:3000 y verificar Network tab
```

---

## 🎯 Métricas Objetivo

| Página | Antes | Después | Objetivo |
|--------|-------|---------|----------|
| `/` (Homepage) | 5.28s | ~2.0s | <2.5s ✅ |
| `/products` | 17.84s | ~2.5s | <2.5s ✅ |
| `/admin` | 4.54s | ~2.3s | <2.5s ✅ |

---

## 🚀 Optimizaciones Futuras (Opcional)

Si después del deploy aún no alcanzas <2.5s:

### Nivel 1 - Fácil
- [ ] Implementar `next/font` para fuentes locales
- [ ] Lazy load de `HomeLatestBlog` con `next/dynamic`
- [ ] Comprimir más las imágenes del hero (<100KB)

### Nivel 2 - Medio
- [ ] Implementar Suspense boundaries
- [ ] Optimizar CSS crítico con `@next/bundle-analyzer`
- [ ] Preload de recursos críticos

### Nivel 3 - Avanzado
- [ ] Implementar ISR (Incremental Static Regeneration)
- [ ] CDN caching headers personalizados
- [ ] Service Worker para caching agresivo

---

## 📚 Archivos Modificados

```
✅ components/home/auto-slider-banner.tsx
✅ components/home/featured-products.tsx (NUEVO)
✅ components/home/home-client.tsx (NUEVO)
✅ components/products/ProductsClient.tsx
✅ components/shop/product-card.tsx
✅ app/page.tsx
✅ app/products/page.tsx
✅ next.config.mjs
📄 LCP_OPTIMIZATION_SUMMARY.md (NUEVO)
📄 LCP_CHECKLIST.md (NUEVO)
```

---

## ❓ FAQ

**P: ¿Por qué necesito agregar hero-1.jpg y hero-2.jpg?**
R: Reemplazamos los GIFs externos (lentos) por imágenes locales optimizadas por Next.js.

**P: ¿Puedo usar las imágenes que ya tengo en /public?**
R: Sí! Puedes copiar cualquier imagen existente como placeholder temporal.

**P: ¿Cuándo veré los resultados en Vercel?**
R: Las métricas de Speed Insights se actualizan cada 24-48h con datos reales de usuarios.

**P: ¿Qué pasa si el build falla?**
R: Verifica que existan `hero-1.jpg` y `hero-2.jpg` en `/public/`. Si no existen, el build fallará.

---

**Última actualización**: 2025-10-10
**Estado**: ⚠️ REQUIERE ACCIÓN (agregar imágenes hero)
