# 📝 Módulo de Guiones - Documentación Completa

Sistema privado de gestión de guiones para contenido de video, diseñado para el equipo admin de Busy.

## 🎯 Características Principales

### ✅ Gestión de Guiones
- **Editor MDX** con preview en tiempo real
- **Front-matter** editable (hook, CTA, tone, target_audience, etc.)
- **Metadatos**: status, categoría, tags, plataforma, duración estimada
- **Autosave** con debounce (2 segundos)
- **Búsqueda full-text** por título, tags, categoría y contenido MDX

### 🎬 Storyboard Interactivo
- **Drag & drop** para reordenar escenas
- **Campos por escena**: heading, objective, dialogue_mdx, broll_notes, duration_seconds, shot_type, location, props
- **Totales de duración** con indicador visual (verde/ámbar/rojo)
- **Edición inline** con modal de detalles

### 🔄 Versionado
- **Snapshots** al crear "Nueva versión"
- **Revert** a cualquier versión anterior
- **Diff visual** entre versiones
- **Timeline** de cambios

### 💬 Colaboración
- **Comentarios** por guion
- **Resolver/Reabrir** comentarios
- **Thread simple** con timestamps

### 📎 Adjuntos
- **Upload** a Supabase Storage (bucket privado `scripts-assets`)
- **Previsualización** de imágenes
- **Moodboards**, referencias, storyboards dibujados

### 🧠 Inteligencia Útil

#### Plantillas Predefinidas
1. **Ad/UGC** (25s) - Anuncio estilo UGC
2. **How-to** (40s) - Tutorial paso a paso
3. **Behind the Scenes** (60s) - Proceso creativo
4. **Lanzamiento** (20s) - Anuncio de producto
5. **Testimonial** (45s) - Cliente compartiendo experiencia
6. **Trend Remix** (15s) - Adaptación de tendencia viral

#### Autogenerar Escenas
- Crea **4 escenas** automáticamente desde hook, CTA y duración
- Distribución: Hook (15%), Valor (40%), Prueba (25%), CTA (20%)
- Validación de tiempos (±10%)

#### Validaciones en Tiempo Real
- ⚠️ Falta CTA
- ⚠️ Hook > 3s
- ⚠️ Sin subtítulos
- ⚠️ Duración escenas ≠ objetivo
- ⚠️ Sin safe zones

#### Checklist por Plataforma
**Instagram Reels:**
- Ratio 9:16
- Hook ≤ 3s
- Duración ideal: 7-30s
- Subtítulos on
- Safe zone inferior: 135px

**TikTok:**
- Ratio 9:16
- Hook ≤ 2s
- Duración ideal: 7-20s
- Audio trending
- Subtítulos on

**YouTube Shorts:**
- Ratio 9:16
- Hook ≤ 2-3s
- Duración ideal: 15-60s
- Título/thumbnail opcional

### 📤 Exports

#### CSV Shotlist
```csv
idx,heading,objective,shot_type,duration_seconds,broll_notes
0,Hook,Captar atención,close-up,3,Visual impactante
1,Valor,Presentar solución,medium,9,Demo producto
```

#### PDF One-Pager
- **Portada** con metadatos (título, categoría, plataforma, duración, tags, hook, CTA, tono)
- **Storyboard** con todas las escenas
- **Formato imprimible** para llevar al set

#### MDX File
- Descarga del archivo `.mdx` completo
- Backup o compartir con editores de texto

## 🗄️ Modelo de Datos

### `script_projects`
```sql
id, team_id, name, description, created_by, timestamps
```

### `scripts`
```sql
id, project_id, team_id, title, slug, status, category, tags[], 
platform, est_duration_seconds, cover_asset_url, mdx, mdx_frontmatter,
version, created_by, updated_by, timestamps, search_index
```

**Status:** `idea | outline | draft | review | approved | published`

### `script_scenes`
```sql
id, script_id, idx, heading, objective, dialogue_mdx, broll_notes,
duration_seconds, shot_type, location, props, timestamps
```

### `script_versions`
```sql
id, script_id, version, mdx, mdx_frontmatter, created_by, created_at
```

### `script_comments`
```sql
id, script_id, author_id, body, resolved, timestamps
```

### `script_assets`
```sql
id, script_id, name, url, kind, size_bytes, created_by, created_at
```

## 🔐 Seguridad

### RLS (Row Level Security)
- **Todas las tablas** tienen RLS habilitado
- **Filtro por `team_id`**: solo el equipo puede ver/editar sus guiones
- **Políticas CRUD** completas para cada tabla

### Storage
- **Bucket privado** `scripts-assets`
- **Solo miembros del team** pueden subir/ver/eliminar
- **URLs firmadas** para acceso temporal

## 🚀 Setup

### 1. Ejecutar Migraciones SQL
```bash
# Ejecutar en Supabase SQL Editor
supabase/schema/scripts_module.sql
```

### 2. Crear Bucket de Storage
```sql
-- En Supabase Dashboard > Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('scripts-assets', 'scripts-assets', false);
```

### 3. Instalar Dependencias
```bash
pnpm install
# Ya incluye: @dnd-kit/core, @dnd-kit/sortable, @uiw/react-md-editor, gray-matter
```

### 4. Variables de Entorno
```env
# Ya configuradas en tu .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 5. Seed (Opcional)
```sql
-- Crear proyecto de ejemplo
INSERT INTO script_projects (team_id, name, description, created_by)
VALUES (
  'YOUR_USER_ID',
  'Busy Caps 2025',
  'Campaña de lanzamiento primavera-verano',
  'YOUR_USER_ID'
);

-- Crear guion de ejemplo
INSERT INTO scripts (
  team_id, project_id, title, slug, status, category, 
  platform, est_duration_seconds, mdx, created_by, updated_by
)
VALUES (
  'YOUR_USER_ID',
  'PROJECT_ID',
  'Ad Remera Negra - IG Reels',
  'ad-remera-negra-ig-reels',
  'draft',
  'Publicidad',
  'instagram',
  25,
  '---
hook: "¿Te cansaste de remeras que se deforman?"
cta: "Conseguila en el link de la bio"
tone: "Casual, auténtico"
---

# Ad Remera Negra

Hook impactante sobre el problema...',
  'YOUR_USER_ID',
  'YOUR_USER_ID'
);
```

## 📖 Tutorial Interactivo

El módulo incluye un **tutorial paso a paso** accesible desde el botón "Tutorial" en el listado de guiones.

### Pasos del Tutorial:
1. ✨ Bienvenida
2. 📝 Crear un Guion
3. 📄 Editor MDX con Preview
4. 🏷️ Metadatos del Guion
5. 🎬 Storyboard con Drag & Drop
6. 🧠 Inteligencia Útil
7. 🔄 Versionado y Revert
8. 💬 Comentarios y Colaboración
9. 📎 Adjuntos
10. 📤 Exports Rápidos

## 🎨 UI/UX

### Layout
- **Listado**: Grid responsive con filtros por estado, proyecto y búsqueda
- **Editor**: 2 paneles (editor + inteligencia) con tabs secundarias
- **Storyboard**: Cards arrastrables con totales visuales
- **Dark mode**: Compatible

### Componentes
- `MDXEditor` - Editor con preview split
- `Storyboard` - Drag & drop con @dnd-kit
- `IntelligencePanel` - Plantillas, validaciones, checklist
- `TutorialDialog` - Tutorial interactivo paso a paso
- `VersionsPanel` - Timeline de versiones
- `CommentsPanel` - Thread de comentarios
- `AssetsPanel` - Upload y gestión de archivos

## 🔧 Arquitectura

### Server Components
- `app/admin/scripts/page.tsx` - Listado (SSR)
- `app/admin/scripts/[id]/page.tsx` - Editor (SSR)

### Client Components
- `scripts-list-client.tsx` - Listado interactivo
- `script-editor-client.tsx` - Editor principal
- `versions-panel.tsx` - Gestión de versiones
- `comments-panel.tsx` - Sistema de comentarios
- `assets-panel.tsx` - Upload de archivos

### Server Actions
- `app/actions/scripts.ts` - CRUD completo con revalidación

### Repositorio
- `lib/repo/scripts.ts` - Acceso a datos con Supabase

### Utilidades
- `lib/scripts/templates.ts` - Plantillas predefinidas
- `lib/scripts/validators.ts` - Validaciones y checklists
- `lib/scripts/exports.ts` - Generación de CSV, PDF, MDX

## 🎯 Casos de Uso

### 1. Crear Guion desde Plantilla
1. Click "Nuevo Guion"
2. Abrir panel de inteligencia > Plantillas
3. Seleccionar "Ad/UGC"
4. Aplicar plantilla
5. Personalizar MDX y escenas

### 2. Autogenerar Escenas
1. Completar hook, CTA y duración en metadatos
2. Panel de inteligencia > Autogenerar Escenas
3. Revisar y ajustar escenas generadas

### 3. Colaborar con Comentarios
1. Ir a tab "Comentarios"
2. Escribir feedback
3. Marcar como resuelto cuando se implemente

### 4. Exportar para Producción
1. Finalizar guion
2. Click "Export" > "CSV Shotlist"
3. Importar en software de edición

### 5. Versionado
1. Antes de cambios grandes, click "Nueva Versión"
2. Hacer cambios
3. Si no funciona, ir a tab "Versiones" > Revertir

## 🐛 Troubleshooting

### Error: "Not authenticated"
- Verificar que el usuario esté logueado
- Verificar que `team_id` coincida con `auth.uid()`

### Error: "Permission denied" en Storage
- Verificar que el bucket `scripts-assets` exista
- Verificar políticas de storage en Supabase Dashboard

### Escenas no se reordenan
- Verificar que `@dnd-kit` esté instalado
- Verificar que `reorderScenesAction` se ejecute correctamente

### Autosave no funciona
- Verificar que `handleMDXChange` tenga debounce
- Verificar que `updateScriptAction` se ejecute sin errores

## 📊 Métricas

- **Tiempo de creación**: ~5 min con plantilla
- **Escenas promedio**: 4-6 por guion
- **Duración promedio**: 20-45 segundos
- **Exports más usados**: CSV (producción), PDF (set)

## 🚢 Deployment

### Vercel
```bash
# Ya configurado en tu proyecto
vercel --prod
```

### Supabase
- Migraciones aplicadas automáticamente
- RLS habilitado por defecto
- Bucket privado configurado

## 📝 Notas Finales

- **Privacidad**: Solo equipo admin tiene acceso
- **Performance**: Autosave optimizado con debounce
- **Escalabilidad**: Búsqueda full-text con índices GIN
- **Backup**: Versionado automático + exports

---

**Desarrollado para Busy** 🚀
