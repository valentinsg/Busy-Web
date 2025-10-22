# 🚀 Instalación del Módulo de Guiones

Guía paso a paso para instalar y configurar el módulo de guiones en Busy.

## ✅ Checklist de Instalación

### 1. Instalar Dependencias

```bash
pnpm install
```

Las siguientes dependencias ya fueron agregadas al `package.json`:
- `@dnd-kit/core@^6.1.0`
- `@dnd-kit/sortable@^8.0.0`
- `@dnd-kit/utilities@^3.2.2`

Dependencias existentes que se utilizan:
- `@uiw/react-md-editor@^4.0.8`
- `gray-matter@latest`
- `react-markdown@^10.1.0`
- `remark-gfm@latest`

### 2. Ejecutar Migraciones SQL

Abrí **Supabase Dashboard** → **SQL Editor** y ejecutá:

```sql
-- Copiar y pegar el contenido de:
supabase/schema/scripts_module.sql
```

Esto creará:
- ✅ 6 tablas con RLS habilitado
- ✅ Índices para búsqueda full-text
- ✅ Triggers para updated_at y search_index
- ✅ Función de búsqueda `search_scripts()`

### 3. Crear Bucket de Storage

En **Supabase Dashboard** → **Storage** → **New Bucket**:

- **Name**: `scripts-assets`
- **Public**: ❌ NO (privado)
- **File size limit**: 50 MB
- **Allowed MIME types**: `image/*`, `video/*`, `application/pdf`

O ejecutá en SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'scripts-assets',
  'scripts-assets',
  false,
  52428800, -- 50 MB
  ARRAY['image/*', 'video/*', 'application/pdf']
);
```

### 4. Configurar Políticas de Storage

En **Supabase Dashboard** → **Storage** → **scripts-assets** → **Policies**:

```sql
-- Política de SELECT
CREATE POLICY "Team members can view assets"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'scripts-assets' AND
  auth.uid() IS NOT NULL
);

-- Política de INSERT
CREATE POLICY "Team members can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'scripts-assets' AND
  auth.uid() IS NOT NULL
);

-- Política de DELETE
CREATE POLICY "Team members can delete assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'scripts-assets' AND
  auth.uid() IS NOT NULL
);
```

### 5. Seed (Opcional)

Para crear datos de ejemplo, ejecutá en SQL Editor:

```sql
-- IMPORTANTE: Reemplazar 'YOUR_USER_ID' con tu UUID real

-- Obtener tu USER_ID:
SELECT id, email FROM auth.users;

-- Luego copiar y pegar el contenido de:
supabase/seed/scripts_seed.sql
-- (reemplazando YOUR_USER_ID con el UUID obtenido)
```

Esto creará:
- 1 proyecto de ejemplo: "Busy Caps 2025"
- 2 guiones: uno completo con 4 escenas y uno vacío
- 2 comentarios de ejemplo

### 6. Verificar Instalación

#### Verificar Tablas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'script%';
```

Deberías ver:
- `script_projects`
- `scripts`
- `script_scenes`
- `script_versions`
- `script_comments`
- `script_assets`

#### Verificar RLS
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'script%';
```

Todas las tablas deben tener `rowsecurity = true`.

#### Verificar Bucket
```sql
SELECT * FROM storage.buckets WHERE id = 'scripts-assets';
```

Debe existir y tener `public = false`.

### 7. Acceder al Módulo

1. Iniciá el servidor de desarrollo:
```bash
pnpm dev
```

2. Andá a: `http://localhost:3000/admin/scripts`

3. Deberías ver:
   - ✅ Listado de guiones (vacío o con seeds)
   - ✅ Botón "Tutorial" (clic para ver el tutorial interactivo)
   - ✅ Botón "Nuevo Guion"
   - ✅ Botón "Nuevo Proyecto"

### 8. Probar Funcionalidades

#### Crear tu Primer Guion
1. Click en **"Tutorial"** para ver la guía paso a paso
2. Click en **"Nuevo Guion"**
3. Ingresá un título: "Mi Primer Guion - IG Reels"
4. Seleccioná un proyecto (opcional)
5. Click en **"Crear Guion"**

#### Aplicar una Plantilla
1. En el editor, abrí el **Panel de Inteligencia** (derecha)
2. Expandí **"Plantillas"**
3. Seleccioná **"Ad/UGC"**
4. Click en **"Aplicar Plantilla"**
5. Confirmá

#### Autogenerar Escenas
1. Completá los metadatos:
   - Hook: "¿Te cansaste de remeras que se deforman?"
   - CTA: "Conseguila en el link de la bio"
   - Duración: 25 segundos
2. En el Panel de Inteligencia, expandí **"Autogenerar Escenas"**
3. Click en **"Generar Escenas"**
4. Verás 4 escenas creadas automáticamente

#### Reordenar Escenas
1. Andá a la pestaña **"Storyboard"**
2. Arrastrá las escenas para reordenarlas
3. Los cambios se guardan automáticamente

#### Exportar
1. Click en el menú **"Export"** (barra superior)
2. Seleccioná:
   - **CSV Shotlist**: Para software de edición
   - **PDF One-Pager**: Para imprimir y llevar al set
   - **MDX File**: Para backup

## 🔧 Troubleshooting

### Error: "relation 'scripts' does not exist"
**Solución**: Ejecutá las migraciones SQL (`scripts_module.sql`)

### Error: "permission denied for table scripts"
**Solución**: Verificá que RLS esté habilitado y que las políticas estén creadas

### Error: "The resource was not found" al subir archivos
**Solución**: 
1. Verificá que el bucket `scripts-assets` exista
2. Verificá que las políticas de storage estén creadas
3. Verificá que el bucket sea **privado** (public = false)

### Las escenas no se reordenan
**Solución**: 
1. Verificá que `@dnd-kit` esté instalado: `pnpm list @dnd-kit/core`
2. Limpiá caché: `pnpm store prune`
3. Reinstalá: `pnpm install`

### El autosave no funciona
**Solución**: Abrí la consola del navegador y verificá errores. El autosave tiene un delay de 2 segundos.

### Error: "Cannot read property 'id' of null"
**Solución**: Verificá que estés logueado en `/admin/sign-in`

## 📊 Verificación Post-Instalación

Ejecutá estos queries para verificar que todo esté OK:

```sql
-- 1. Contar tablas creadas
SELECT COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'script%';
-- Resultado esperado: 6

-- 2. Verificar índices
SELECT COUNT(*) as total_indexes
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename LIKE 'script%';
-- Resultado esperado: 8+

-- 3. Verificar triggers
SELECT COUNT(*) as total_triggers
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table LIKE 'script%';
-- Resultado esperado: 4+

-- 4. Verificar función de búsqueda
SELECT proname 
FROM pg_proc 
WHERE proname = 'search_scripts';
-- Resultado esperado: search_scripts

-- 5. Verificar bucket
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'scripts-assets';
-- Resultado esperado: scripts-assets | scripts-assets | false
```

## 🎉 ¡Listo!

Si todos los pasos se completaron exitosamente:

✅ El módulo de guiones está instalado y funcionando  
✅ Podés crear, editar y versionar guiones  
✅ Podés usar plantillas y autogenerar escenas  
✅ Podés exportar en CSV, PDF y MDX  
✅ El tutorial interactivo está disponible  

## 📚 Próximos Pasos

1. **Leé la documentación completa**: `SCRIPTS_MODULE_README.md`
2. **Explorá el tutorial interactivo**: Click en "Tutorial" en `/admin/scripts`
3. **Creá tu primer guion**: Usá una plantilla para empezar rápido
4. **Personalizá las plantillas**: Editá `lib/scripts/templates.ts`
5. **Ajustá las validaciones**: Editá `lib/scripts/validators.ts`

## 🆘 Soporte

Si tenés problemas:
1. Revisá esta guía de instalación
2. Verificá los logs de Supabase Dashboard
3. Revisá la consola del navegador (F12)
4. Verificá que todas las dependencias estén instaladas

---

**Desarrollado para Busy** 🚀📝
