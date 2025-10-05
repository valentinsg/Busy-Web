# Sistema de Popovers Personalizable - Guía Completa

## ✅ Cambios Realizados

### 1. **Tipos de Popover** (`types/popover.ts`)
- ✅ 5 tipos diferentes: `simple`, `discount`, `email-gate`, `newsletter`, `custom`
- ✅ Campos de interacción: `require_email`, `show_newsletter`
- ✅ CTA personalizado: `cta_text`, `cta_url`

### 2. **Repositorio actualizado** (`lib/repo/popovers.ts`)
- ✅ Todos los campos nuevos incluidos en queries
- ✅ Soporte completo para crear/actualizar con nuevas opciones

### 3. **API Endpoints** (`app/api/admin/popovers/`)
- ✅ GET, POST, PATCH, DELETE con todos los campos
- ✅ Validación de tipos y campos

### 4. **Formulario Admin** (`app/admin/popovers/new/page.tsx`)
- ✅ Selector de tipo de popover
- ✅ Upload de imagen con preview
- ✅ Checkboxes para require_email y show_newsletter
- ✅ Campos CTA personalizados
- ✅ Interfaz intuitiva con descripciones

### 5. **Componente Frontend** (`components/site-popover.tsx`)
- ✅ **Más grande**: max-w-2xl (antes max-w-md)
- ✅ **Email-gate**: Pide email antes de mostrar código
- ✅ **Newsletter**: Formulario de suscripción integrado
- ✅ **CTA personalizado**: Botón con URL configurable
- ✅ Animaciones y diseño moderno
- ✅ Sistema de localStorage para no mostrar popovers descartados

## 📋 Pasos Pendientes en Supabase

### Paso 1: Agregar columna `image_url` a la tabla `popovers`

Ejecuta en **SQL Editor** de Supabase:

```sql
-- Add image_url column to popovers table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN image_url text;
  END IF;
END $$;
```

### Paso 2: Agregar campos de interacción

Ejecuta en **SQL Editor** de Supabase el contenido de `add_popover_interaction_fields.sql`:

```sql
-- Add interaction fields to popovers table
DO $$ 
BEGIN
  -- Add type column (default 'simple' for existing records)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN type text DEFAULT 'simple' NOT NULL;
  END IF;

  -- Add require_email column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'require_email'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN require_email boolean DEFAULT false NOT NULL;
  END IF;

  -- Add show_newsletter column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'show_newsletter'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN show_newsletter boolean DEFAULT false NOT NULL;
  END IF;

  -- Add cta_text column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'cta_text'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN cta_text text;
  END IF;

  -- Add cta_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'cta_url'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN cta_url text;
  END IF;
END $$;

-- Add check constraint for type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'popovers_type_check'
  ) THEN
    ALTER TABLE public.popovers 
    ADD CONSTRAINT popovers_type_check 
    CHECK (type IN ('simple', 'discount', 'email-gate', 'newsletter', 'custom'));
  END IF;
END $$;
```

### Paso 3: Crear bucket de Storage para popovers

Ejecuta en **SQL Editor** de Supabase:

```sql
-- Create popovers bucket in Supabase Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'popovers',
  'popovers',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to popovers bucket
CREATE POLICY IF NOT EXISTS "Public read access for popovers"
ON storage.objects FOR SELECT
USING (bucket_id = 'popovers');

-- Allow authenticated users to upload to popovers bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can upload popovers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'popovers' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY IF NOT EXISTS "Authenticated users can update popovers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'popovers' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their uploads
CREATE POLICY IF NOT EXISTS "Authenticated users can delete popovers"
ON storage.objects FOR DELETE
USING (bucket_id = 'popovers' AND auth.role() = 'authenticated');
```

### Paso 4: Limpiar localStorage (si el popover no se muestra)

Si creaste un popover de prueba y lo descartaste, está guardado en localStorage. Para verlo de nuevo:

1. Abre DevTools (F12)
2. Ve a **Application** → **Local Storage**
3. Busca claves que empiecen con `dismiss_popover_`
4. Elimínalas
5. Recarga la página

## 🎯 Cómo Usar el Sistema

## 📝 Tipos de Popover

### 1. **Simple** 
Solo muestra un mensaje sin interacción especial.
- **Uso**: Anuncios generales, avisos importantes
- **Ejemplo**: "¡Nueva colección disponible!"

### 2. **Discount** 
Muestra el código de descuento directamente.
- **Uso**: Promociones donde quieres que todos vean el código
- **Ejemplo**: "Usa el código BUSY10 para 10% OFF"

### 3. **Email-Gate** 
Requiere que el usuario ingrese su email antes de ver el código.
- **Uso**: Captura de leads, construir lista de emails
- **Ejemplo**: "Ingresa tu email para desbloquear 15% OFF"
- **Configuración**: 
  - Marca "Requiere email para ver código"
  - Agrega un código de descuento

### 4. **Newsletter** 
Formulario de suscripción al newsletter.
- **Uso**: Crecimiento de lista de suscriptores
- **Ejemplo**: "Suscríbete y recibe ofertas exclusivas"
- **Configuración**: 
  - Marca "Mostrar formulario de newsletter"

### 5. **Custom** 
Combina cualquier opción según necesites.
- **Uso**: Casos especiales, campañas complejas
- **Ejemplo**: Newsletter + código + CTA personalizado

## 🛠️ Crear un Popover

1. Ve a `/admin/popovers`
2. Clic en **"Nuevo popover"**
3. Completa el formulario:

### Campos Básicos
- **Título**: Mensaje principal (requerido) - Ej: "¡Oferta Especial!"
- **Contenido**: Descripción adicional (opcional) - Ej: "Aprovecha 20% OFF en toda la tienda"
- **Imagen**: Sube una imagen llamativa (opcional)

### Tipo de Popover
- Selecciona el tipo según tu objetivo (ver tipos arriba)

### Código de Descuento
- **Código**: Ej: `BUSY20` (opcional)
- Si usas email-gate, este código se mostrará después del email

### Opciones de Interacción
- ☑️ **Requiere email para ver código**: El usuario debe ingresar email
- ☑️ **Mostrar formulario de newsletter**: Suscripción al newsletter

### CTA Personalizado
- **Texto del botón**: Ej: "Ver productos", "Comprar ahora"
- **URL**: Ej: `/products`, `/sale`

### Configuración
- **Activo**: Marcar para activar inmediatamente
- **Prioridad**: Mayor número = mayor prioridad (0-100)
- **Ventana de tiempo**: Inicio y fin (opcional)
- **Secciones**: Ej: `home, products, blog` (opcional)
- **Rutas**: Ej: `/products, /blog` (opcional)

### Segmentación

- **Sin secciones ni rutas**: Se muestra en todas las páginas
- **Con secciones**: Solo en páginas que pasen ese `section` prop
- **Con rutas**: Solo en páginas cuya URL comience con esas rutas
  - Ejemplo: `/products` mostrará en `/products`, `/products/123`, etc.

### Prioridad

Si hay múltiples popovers activos que coinciden con la página actual, se muestra el de **mayor prioridad**.

## 🐛 Troubleshooting

### El popover no se muestra

1. **Verifica que esté activo** en `/admin/popovers`
2. **Revisa la ventana de tiempo** (start_at y end_at)
3. **Verifica la segmentación** (secciones/rutas)
4. **Limpia localStorage** (ver Paso 3 arriba)
5. **Revisa la consola** del navegador para errores

### Error al subir imagen

1. **Verifica que el bucket existe** en Supabase Storage
2. **Ejecuta la migración** del Paso 2
3. **Verifica los permisos** del bucket (políticas RLS)

### La imagen no se muestra en el popover

1. **Verifica que la URL sea pública** (bucket debe ser público)
2. **Revisa que la columna `image_url` exista** en la tabla
3. **Ejecuta la migración** del Paso 1

## 📊 Logs y Debugging

El componente `SitePopover` hace logs en consola:
- Errores de carga: `console.error("Error loading popover:", e)`

La API responde con:
- `GET /api/popovers/active?path=/` → `{ ok: true, popover: {...} }`

## 💡 Ejemplos Prácticos

### Ejemplo 1: Descuento de Bienvenida con Email-Gate
```
Título: "¡Bienvenido a Busy! 🎉"
Contenido: "Obtén 15% OFF en tu primera compra"
Imagen: Banner atractivo con productos
Tipo: Email-Gate
Código: BIENVENIDA15
✅ Requiere email para ver código
Prioridad: 10
Rutas: / (solo home)
```

### Ejemplo 2: Newsletter Simple
```
Título: "No te pierdas nuestras ofertas"
Contenido: "Suscríbete y recibe descuentos exclusivos cada semana"
Tipo: Newsletter
✅ Mostrar formulario de newsletter
Prioridad: 5
```

### Ejemplo 3: Lanzamiento de Producto con CTA
```
Título: "Nueva Colección Primavera 2025"
Contenido: "Descubre los nuevos diseños exclusivos"
Imagen: Foto de la colección
Tipo: Custom
CTA Texto: "Ver Colección"
CTA URL: /products?collection=primavera-2025
Ventana: 01/03/2025 - 31/03/2025
```

### Ejemplo 4: Flash Sale con Código Directo
```
Título: "⚡ FLASH SALE - 24 HORAS"
Contenido: "50% OFF en productos seleccionados"
Tipo: Discount
Código: FLASH50
Prioridad: 100 (máxima)
Ventana: Hoy 00:00 - Hoy 23:59
```

### Ejemplo 5: Promoción por Sección
```
Título: "Envío Gratis en Hoodies"
Contenido: "Compra cualquier hoodie y el envío es gratis"
Tipo: Discount
Código: HOODIEFREE
Secciones: products
Rutas: /products/hoodies
```

## 🎨 Personalización

### Cambiar el tamaño del popover

Edita `components/site-popover.tsx` línea 148:
```tsx
// Actual: max-w-2xl (672px)
className="... max-w-2xl ..."

// Más grande:
className="... max-w-4xl ..."

// Más pequeño:
className="... max-w-xl ..."
```

### Cambiar el diseño del popover

Edita `components/site-popover.tsx`:
- Línea 139-144: Backdrop overlay
- Línea 147-275: Modal del popover
- Línea 166-177: Sección de imagen
- Línea 193-227: Formulario de email
- Línea 230-254: Código de descuento
- Línea 257-269: Botón CTA

### Cambiar la animación

Modifica las clases de Tailwind en líneas 140-150 de `site-popover.tsx`:
```tsx
// Animación actual: fade + scale
className={`... transition-all duration-300 ${
  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
}`}

// Slide desde arriba:
className={`... transition-all duration-300 ${
  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
}`}
```
