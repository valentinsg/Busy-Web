# 📝 Módulo de Guiones - Resumen Ejecutivo

## 🎯 Qué es

Sistema privado de gestión de guiones para contenido de video, diseñado exclusivamente para el equipo admin de Busy. Permite crear, editar, versionar y exportar guiones con storyboards interactivos.

## ✨ Características Clave

### 1. **Editor MDX Profesional**
- Preview en tiempo real
- Front-matter editable (hook, CTA, tone, etc.)
- Autosave cada 2 segundos
- Soporte Markdown completo

### 2. **Storyboard con Drag & Drop**
- Reordenar escenas arrastrando
- Campos completos: heading, objective, dialogue, B-roll, duración, shot type, locación, props
- Indicador visual de duración total vs objetivo

### 3. **Inteligencia Útil (Sin IA Remota)**
- **6 Plantillas**: Ad/UGC, How-to, BTS, Lanzamiento, Testimonial, Trend Remix
- **Autogenerar Escenas**: Crea 4 escenas desde hook, CTA y duración
- **Validaciones**: Detecta CTA faltante, hook largo, duración incorrecta
- **Checklist por Plataforma**: Instagram, TikTok, YouTube con recomendaciones específicas

### 4. **Versionado Completo**
- Snapshots al crear "Nueva versión"
- Revert a cualquier versión anterior
- Timeline de cambios

### 5. **Colaboración**
- Comentarios por guion
- Resolver/Reabrir comentarios
- Timestamps automáticos

### 6. **Adjuntos Privados**
- Upload a Supabase Storage (bucket privado)
- Moodboards, referencias, storyboards dibujados
- Previsualización de imágenes

### 7. **Exports Profesionales**
- **CSV Shotlist**: Para software de edición
- **PDF One-Pager**: Para llevar al set
- **MDX File**: Backup o compartir

### 8. **Tutorial Interactivo**
- 10 pasos guiados
- Explicación de cada funcionalidad
- Tips y mejores prácticas

## 🗂️ Estructura de Archivos

```
📦 Módulo de Guiones
├── 📁 supabase/schema/
│   └── scripts_module.sql (Schema completo con RLS)
├── 📁 supabase/seed/
│   └── scripts_seed.sql (Datos de ejemplo)
├── 📁 types/
│   └── scripts.ts (TypeScript types)
├── 📁 lib/
│   ├── repo/scripts.ts (Repositorio)
│   └── scripts/
│       ├── templates.ts (6 plantillas)
│       ├── validators.ts (Validaciones + checklists)
│       └── exports.ts (CSV, PDF, MDX)
├── 📁 app/actions/
│   └── scripts.ts (Server Actions)
├── 📁 app/admin/scripts/
│   ├── page.tsx (Listado SSR)
│   ├── scripts-list-client.tsx (Listado interactivo)
│   └── [id]/
│       ├── page.tsx (Editor SSR)
│       ├── script-editor-client.tsx (Editor principal)
│       ├── versions-panel.tsx (Versiones)
│       ├── comments-panel.tsx (Comentarios)
│       └── assets-panel.tsx (Adjuntos)
└── 📁 components/scripts/
    ├── mdx-editor.tsx (Editor MDX)
    ├── storyboard.tsx (Drag & drop)
    ├── intelligence-panel.tsx (Plantillas + validaciones)
    └── tutorial-dialog.tsx (Tutorial interactivo)
```

## 🚀 Setup Rápido

### 1. Instalar Dependencias
```bash
pnpm install
# Agrega: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
```

### 2. Ejecutar Migraciones
```sql
-- En Supabase SQL Editor
supabase/schema/scripts_module.sql
```

### 3. Crear Bucket de Storage
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('scripts-assets', 'scripts-assets', false);
```

### 4. Seed (Opcional)
```sql
-- Reemplazar YOUR_USER_ID con tu UUID
supabase/seed/scripts_seed.sql
```

### 5. Acceder
```
http://localhost:3000/admin/scripts
```

## 📊 Modelo de Datos

### Tablas Principales
- `script_projects` - Proyectos (colecciones)
- `scripts` - Guiones con MDX y metadatos
- `script_scenes` - Escenas del storyboard
- `script_versions` - Snapshots de versiones
- `script_comments` - Comentarios colaborativos
- `script_assets` - Adjuntos en Storage

### Seguridad
- **RLS habilitado** en todas las tablas
- **Filtro por `team_id`**: Solo el equipo puede acceder
- **Bucket privado** para assets

## 🎨 Plantillas Incluidas

| Plantilla | Duración | Plataforma | Escenas |
|-----------|----------|------------|---------|
| Ad/UGC | 25s | Instagram | 4 |
| How-to | 40s | TikTok | 5 |
| Behind the Scenes | 60s | Instagram | 5 |
| Lanzamiento | 20s | Instagram | 4 |
| Testimonial | 45s | Instagram | 4 |
| Trend Remix | 15s | TikTok | 3 |

## 🧠 Validaciones Automáticas

### Errores
- ❌ Sin escenas

### Warnings
- ⚠️ Falta CTA
- ⚠️ Falta Hook
- ⚠️ Hook > 3s
- ⚠️ Duración escenas ≠ objetivo (±10%)

### Info
- ℹ️ Sin subtítulos
- ℹ️ Sin safe zones
- ℹ️ Escenas sin objetivo

## 📤 Exports

### CSV Shotlist
```csv
idx,heading,objective,shot_type,duration_seconds,broll_notes
0,Hook,Captar atención,close-up,3,Visual impactante
```

### PDF One-Pager
- Portada con metadatos completos
- Storyboard con todas las escenas
- Formato imprimible

### MDX File
- Archivo completo con front-matter
- Backup o compartir

## 🎯 Casos de Uso

### Flujo Típico
1. **Crear guion** desde listado
2. **Aplicar plantilla** (ej: Ad/UGC)
3. **Editar MDX** con hook, CTA, tono
4. **Autogenerar escenas** o crearlas manualmente
5. **Reordenar** con drag & drop
6. **Validar** con checklist de plataforma
7. **Comentar** para feedback del equipo
8. **Crear versión** antes de cambios grandes
9. **Exportar CSV** para producción
10. **Exportar PDF** para llevar al set

## 🔧 Tecnologías

- **Next.js 14** (App Router, Server Actions)
- **TypeScript** (Strict mode)
- **Tailwind CSS** (Styling)
- **Supabase** (Auth, Database, Storage, RLS)
- **@dnd-kit** (Drag & drop)
- **@uiw/react-md-editor** (Editor MDX)
- **gray-matter** (Front-matter parsing)
- **react-markdown** (Preview MDX)

## 📈 Métricas Esperadas

- ⏱️ **Tiempo de creación**: ~5 min con plantilla
- 🎬 **Escenas promedio**: 4-6 por guion
- ⏳ **Duración promedio**: 20-45 segundos
- 📤 **Export más usado**: CSV (producción)

## 🔐 Seguridad

- ✅ RLS en todas las tablas
- ✅ Bucket privado para assets
- ✅ Solo equipo admin tiene acceso
- ✅ Auditoría con created_by/updated_by
- ✅ Timestamps automáticos

## 🚢 Deployment

### Vercel
```bash
vercel --prod
```

### Supabase
- Migraciones aplicadas
- RLS configurado
- Bucket creado
- Políticas activas

## 📚 Documentación

- **README Completo**: `SCRIPTS_MODULE_README.md`
- **Schema SQL**: `supabase/schema/scripts_module.sql`
- **Seed SQL**: `supabase/seed/scripts_seed.sql`
- **Tutorial Interactivo**: Botón en `/admin/scripts`

## 🎉 Resultado Final

Un sistema profesional de gestión de guiones que:
- ✅ Acelera la creación de contenido
- ✅ Estandariza el proceso creativo
- ✅ Facilita la colaboración del equipo
- ✅ Optimiza para cada plataforma
- ✅ Exporta en formatos profesionales
- ✅ Mantiene historial completo

---

**¿Listo para crear tu primer guion?** 🚀

1. Ejecutá las migraciones SQL
2. Instalá dependencias (`pnpm install`)
3. Andá a `/admin/scripts`
4. Click en "Tutorial" para empezar

**Desarrollado para Busy** 📝✨
