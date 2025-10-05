# Scripts

Scripts útiles para el proyecto Busy Streetwear.

## update-playlist-covers.ts

Script para actualizar las covers de las playlists desde Spotify.

### Uso

```bash
pnpm tsx scripts/update-playlist-covers.ts
```

---

## validate-optimizations.js

Script para validar que todas las optimizaciones de rendimiento estén correctamente implementadas.

### Uso

```bash
node scripts/validate-optimizations.js
```

### Funcionalidad

Verifica:
- ✅ Fuentes locales en `public/fonts/`
- ✅ Configuración de `next.config.mjs`
- ✅ Configuración de fuentes en `app/fonts.ts`
- ✅ Layout usando fuentes locales
- ✅ Página principal como Server Component
- ✅ Imágenes con optimización
- ✅ Header con minHeight fijo
- ✅ Blog con ISR y generateStaticParams

### Output

- ✅ Éxitos: Optimizaciones correctamente implementadas
- ⚠️ Advertencias: Mejoras opcionales
- ❌ Errores: Problemas que deben corregirse

### Exit Codes

- `0`: Todo OK o solo advertencias
- `1`: Hay errores críticos
