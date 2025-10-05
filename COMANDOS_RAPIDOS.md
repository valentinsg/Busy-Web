# ⚡ Comandos Rápidos - Implementación de Optimizaciones

## 🚀 Implementación Completa (Copy-Paste)

```bash
# 1. Crear directorio de fuentes
mkdir -p public/fonts

# 2. Backup de página actual
cp app/page.tsx app/page-old.tsx

# 3. Activar nueva versión optimizada
mv app/page-server.tsx app/page.tsx

# 4. Validar optimizaciones
node scripts/validate-optimizations.js

# 5. Limpiar cache y build
rm -rf .next && pnpm build

# 6. Test local
pnpm start
```

---

## 📥 Descargar Fuentes (Método Rápido)

### Opción 1: Google Webfonts Helper

```bash
# Visitar: https://gwfh.mranftl.com/fonts

# Para cada fuente:
# 1. Space Grotesk → Seleccionar: regular, 500, 700 → Download
# 2. Plus Jakarta Sans → Seleccionar: regular, 500, 700 → Download
# 3. Abel → Seleccionar: regular → Download
# 4. DM Sans → Seleccionar: regular, 700 → Download
# 5. Poppins → Seleccionar: regular, 500, 700 → Download

# Extraer y renombrar según INSTRUCCIONES_FUENTES.md
```

### Opción 2: Comando wget (si tienes URLs directas)

```bash
cd public/fonts

# Ejemplo (reemplazar URLs con las correctas):
# wget https://fonts.gstatic.com/.../SpaceGrotesk-Regular.woff2
# wget https://fonts.gstatic.com/.../SpaceGrotesk-Medium.woff2
# ... etc
```

---

## 🧪 Validación y Testing

### Validar Optimizaciones

```bash
node scripts/validate-optimizations.js
```

### Build y Ver Tamaños

```bash
pnpm build | grep "Route (app)"
```

### Test de Producción Local

```bash
pnpm build && pnpm start
```

### Lighthouse CLI (si tienes instalado)

```bash
lighthouse http://localhost:3000 --view
```

---

## 🔄 Rollback (Si algo sale mal)

```bash
# Restaurar página original
mv app/page.tsx app/page-server.tsx
mv app/page-old.tsx app/page.tsx

# Rebuild
rm -rf .next && pnpm build
```

---

## 📊 Análisis de Bundle

### Instalar Bundle Analyzer

```bash
pnpm add -D @next/bundle-analyzer
```

### Configurar en next.config.mjs

```javascript
// Agregar al inicio del archivo
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// Al final, envolver la config
module.exports = withBundleAnalyzer(nextConfig)
```

### Ejecutar Análisis

```bash
ANALYZE=true pnpm build
```

---

## 🚢 Deploy a Vercel

### Deploy Automático

```bash
git add .
git commit -m "feat: optimizaciones de rendimiento - FCP, LCP, CLS"
git push origin main
```

### Deploy Manual (Vercel CLI)

```bash
# Instalar CLI si no lo tienes
npm i -g vercel

# Deploy
vercel --prod
```

---

## 📈 Monitoreo Post-Deploy

### Ver Speed Insights en Vercel

```bash
# Abrir dashboard
open https://vercel.com/[tu-proyecto]/analytics

# O desde CLI
vercel inspect [deployment-url]
```

### Lighthouse en Producción

```bash
lighthouse https://busy.com.ar --view
```

### PageSpeed Insights

```bash
# Abrir en navegador
open "https://pagespeed.web.dev/analysis?url=https://busy.com.ar"
```

---

## 🔧 Troubleshooting

### Fuentes no cargan

```bash
# Verificar archivos
ls -la public/fonts/

# Verificar permisos
chmod 644 public/fonts/*.woff2

# Verificar en DevTools > Network
# Buscar: fonts/SpaceGrotesk-Regular.woff2
```

### Build falla

```bash
# Ver errores detallados
pnpm build --debug

# Limpiar todo y reinstalar
rm -rf .next node_modules
pnpm install
pnpm build
```

### Imágenes no optimizan

```bash
# Verificar next.config.mjs
grep "unoptimized" next.config.mjs

# No debe aparecer "unoptimized: true"

# Limpiar cache de imágenes
rm -rf .next/cache/images
```

### CLS sigue alto

```bash
# Verificar header
grep "minHeight" components/layout/header.tsx

# Verificar imágenes tienen width/height
grep -r "Image" components/ | grep -v "width"
```

---

## 🎯 Checklist Rápido

```bash
# Ejecutar todos los checks
echo "✓ Fuentes descargadas?" && ls public/fonts/ | wc -l
echo "✓ Página reemplazada?" && grep "async function Home" app/page.tsx
echo "✓ Validación OK?" && node scripts/validate-optimizations.js
echo "✓ Build OK?" && pnpm build > /dev/null && echo "OK"
```

---

## 📦 Backup Completo

```bash
# Crear backup antes de cambios
tar -czf backup-$(date +%Y%m%d).tar.gz \
  app/ \
  components/ \
  next.config.mjs \
  package.json

# Restaurar si es necesario
tar -xzf backup-YYYYMMDD.tar.gz
```

---

## 🔥 One-Liner para Todo

```bash
# ⚠️ Solo si estás seguro y tienes las fuentes descargadas
mkdir -p public/fonts && \
cp app/page.tsx app/page-old.tsx && \
mv app/page-server.tsx app/page.tsx && \
node scripts/validate-optimizations.js && \
rm -rf .next && \
pnpm build && \
echo "✅ Listo! Ejecuta: pnpm start"
```

---

## 📱 Comandos para Mobile Testing

### Usar ngrok para test en móvil

```bash
# Instalar ngrok
npm i -g ngrok

# Iniciar servidor local
pnpm start &

# Exponer con ngrok
ngrok http 3000

# Usar URL de ngrok en móvil para testing
```

### Simular 3G en Chrome DevTools

```bash
# 1. Abrir DevTools (F12)
# 2. Network tab
# 3. Throttling: Fast 3G
# 4. Reload y medir
```

---

## 🎨 Comandos de Desarrollo

### Watch mode con análisis

```bash
pnpm dev | grep -E "(compiled|error)"
```

### Lint y Type Check

```bash
pnpm lint && pnpm type-check
```

### Format Code

```bash
pnpm format
```

---

## 💾 Git Helpers

### Commit Semántico

```bash
git add .
git commit -m "feat(performance): optimize images, fonts, and server components

- Enable AVIF/WebP formats
- Migrate fonts to local with display swap
- Convert home page to Server Component
- Add ISR with 1h revalidation
- Reduce bundle size by ~50KB

Expected improvements:
- FCP: -43% (2.8s → 1.6s)
- LCP: -44% (3.9s → 2.2s)
- CLS: -81% (0.43 → 0.08)"
```

### Ver Diff de Cambios

```bash
git diff --stat
git diff next.config.mjs
git diff app/layout.tsx
```

---

## 🏁 Comando Final de Verificación

```bash
echo "🔍 Verificación Final..."
echo ""
echo "1. Fuentes:" && ls public/fonts/*.woff2 2>/dev/null | wc -l && echo "   (debe ser 12)"
echo "2. Página optimizada:" && grep -q "async function Home" app/page.tsx && echo "   ✅ OK" || echo "   ❌ FALTA"
echo "3. Config imágenes:" && grep -q "formats.*avif" next.config.mjs && echo "   ✅ OK" || echo "   ❌ FALTA"
echo "4. Build:" && pnpm build > /tmp/build.log 2>&1 && echo "   ✅ OK" || echo "   ❌ ERROR"
echo ""
echo "✅ Todo listo para deploy!" || echo "❌ Revisar errores arriba"
```

---

**Tip**: Guarda este archivo en favoritos para acceso rápido durante la implementación.
