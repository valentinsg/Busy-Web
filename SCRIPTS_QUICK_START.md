# ⚡ Guiones - Quick Start

Guía rápida de 5 minutos para empezar a usar el módulo de guiones.

## 🎯 ¿Qué es?

Sistema para crear guiones de video con:
- ✅ Editor MDX con preview
- ✅ Storyboard con drag & drop
- ✅ 6 plantillas predefinidas
- ✅ Autogenerar escenas
- ✅ Validaciones en tiempo real
- ✅ Exports: CSV, PDF, MDX

## 🚀 Instalación (3 pasos)

### 1. Instalar dependencias
```bash
pnpm install
```

### 2. Ejecutar SQL
En Supabase SQL Editor:
```sql
-- Copiar y pegar:
supabase/schema/scripts_module.sql
```

### 3. Crear bucket
En Supabase Storage → New Bucket:
- Name: `scripts-assets`
- Public: ❌ NO

**O ejecutar:**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('scripts-assets', 'scripts-assets', false);
```

## 📖 Uso Básico

### Crear Guion desde Plantilla

1. **Ir a** `/admin/scripts`
2. **Click** "Nuevo Guion"
3. **Título**: "Ad Remera Negra - IG Reels"
4. **Click** "Crear Guion"
5. **Panel derecho** → Plantillas → "Ad/UGC"
6. **Click** "Aplicar Plantilla"

¡Listo! Tenés un guion completo con 4 escenas.

### Autogenerar Escenas

1. **Completar metadatos** (barra superior):
   - Hook: "¿Te cansaste de remeras que se deforman?"
   - CTA: "Conseguila en el link de la bio"
   - Duración: 25 segundos

2. **Panel derecho** → Autogenerar Escenas
3. **Click** "Generar Escenas"

Se crean 4 escenas automáticamente con tiempos distribuidos.

### Reordenar Escenas

1. **Tab** "Storyboard"
2. **Arrastrá** las escenas
3. Se guarda automáticamente

### Exportar

**Barra superior** → Export:
- **CSV**: Para software de edición
- **PDF**: Para imprimir
- **MDX**: Para backup

## 🎬 Plantillas Disponibles

| Plantilla | Duración | Plataforma |
|-----------|----------|------------|
| Ad/UGC | 25s | Instagram |
| How-to | 40s | TikTok |
| Behind the Scenes | 60s | Instagram |
| Lanzamiento | 20s | Instagram |
| Testimonial | 45s | Instagram |
| Trend Remix | 15s | TikTok |

## 🧠 Validaciones Automáticas

El sistema te avisa si:
- ⚠️ Falta CTA
- ⚠️ Hook > 3s
- ⚠️ Sin subtítulos
- ⚠️ Duración incorrecta

## 📤 Exports

### CSV Shotlist
```csv
idx,heading,objective,shot_type,duration_seconds,broll_notes
0,Hook,Captar atención,close-up,3,Visual impactante
```

### PDF One-Pager
- Portada con metadatos
- Storyboard completo
- Listo para imprimir

### MDX File
- Archivo completo
- Backup o compartir

## 🎓 Tutorial Interactivo

**Click en "Tutorial"** en `/admin/scripts` para ver una guía paso a paso de 10 pasos.

## 🔑 Atajos

- **Autosave**: Cada 2 segundos
- **Drag & Drop**: Reordenar escenas
- **Ctrl+B**: Toggle sidebar
- **Tab Storyboard**: Ver escenas
- **Tab Versiones**: Historial

## 📊 Flujo Recomendado

```
1. Crear guion
   ↓
2. Aplicar plantilla
   ↓
3. Editar MDX (hook, CTA, tono)
   ↓
4. Ajustar escenas en Storyboard
   ↓
5. Validar con Checklist
   ↓
6. Crear versión (snapshot)
   ↓
7. Exportar CSV para producción
   ↓
8. Exportar PDF para set
```

## 🎯 Casos de Uso Rápidos

### Ad para Instagram Reels (25s)
```
1. Nueva guion → Plantilla "Ad/UGC"
2. Editar hook y CTA
3. Export CSV
```

### Tutorial para TikTok (40s)
```
1. Nuevo guion → Plantilla "How-to"
2. Editar pasos en Storyboard
3. Validar con Checklist TikTok
4. Export PDF
```

### Lanzamiento de Producto (20s)
```
1. Nuevo guion → Plantilla "Lanzamiento"
2. Agregar features en escenas
3. Crear versión
4. Export CSV + PDF
```

## 🆘 Problemas Comunes

### No veo el módulo
**Solución**: Ejecutá las migraciones SQL

### Error al subir archivos
**Solución**: Verificá que el bucket `scripts-assets` exista y sea privado

### Escenas no se reordenan
**Solución**: `pnpm install` para instalar @dnd-kit

## 📚 Documentación Completa

- **README**: `SCRIPTS_MODULE_README.md`
- **Instalación**: `SCRIPTS_INSTALLATION.md`
- **Resumen**: `SCRIPTS_MODULE_SUMMARY.md`

## ✨ Tips Pro

1. **Usá proyectos** para organizar campañas
2. **Creá versiones** antes de cambios grandes
3. **Comentá** para feedback del equipo
4. **Subí moodboards** como adjuntos
5. **Validá** con el checklist de plataforma

---

**¡Empezá a crear guiones profesionales en minutos!** 🎬🚀
