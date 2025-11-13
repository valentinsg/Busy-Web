# 🚨 FIX URGENTE: Error de registro de equipos

## ❌ Problema
Error al registrar equipos: `Could not find the 'logo_url' column of 'teams' in the schema cache`

## ✅ Solución

### 1️⃣ EJECUTAR SQL EN SUPABASE (URGENTE)

**Ve a Supabase Dashboard → SQL Editor → New Query**

Copia y pega este SQL:

```sql
-- Agregar columna logo_url a la tabla teams
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN teams.logo_url IS 'URL del logo o foto del equipo subido a Supabase Storage';

-- Verificar que la columna se creó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'teams' AND column_name = 'logo_url';
```

**Ejecuta el query (Run)**

Deberías ver este resultado:
```
column_name | data_type | is_nullable
logo_url    | text      | YES
```

### 2️⃣ VERIFICAR EN SUPABASE

1. Ve a **Table Editor** → tabla `teams`
2. Verifica que existe la columna `logo_url` (tipo TEXT)
3. Si no aparece, refresca el schema cache:
   - Ve a **Settings** → **API**
   - Click en **Reload schema cache**

### 3️⃣ NUEVA FUNCIONALIDAD: Newsletter automática

Ahora cuando alguien se registra en un torneo:
- ✅ El email del capitán se agrega a la newsletter
- ✅ Los emails de todos los jugadores se agregan a la newsletter
- ✅ Se eliminan duplicados automáticamente
- ✅ Si un email ya existe, se reactiva si estaba inactivo
- ✅ No falla el registro si falla la newsletter

**Tabla afectada:** `newsletter_subscribers`

**Campos insertados:**
```typescript
{
  email: string,
  status: 'subscribed',
  token: null
}
```

## 📊 Resumen de cambios

### Archivos modificados:
1. **`app/api/blacktop/register/route.ts`**
   - Agregado: Lógica para insertar emails en newsletter
   - Manejo de errores: No falla el registro si falla la newsletter

2. **`supabase/schema/migrations/EJECUTAR_AHORA_add_logo_url.sql`**
   - Nuevo archivo con el SQL a ejecutar

### Flujo actualizado:
```
Usuario registra equipo
  ↓
1. Upload de imágenes (equipo + jugadores)
  ↓
2. Crear equipo en DB (con logo_url)
  ↓
3. Crear jugadores en DB (con photo_url)
  ↓
4. Crear notificación admin
  ↓
5. Agregar emails a newsletter ← NUEVO
  ↓
6. Retornar éxito
```

## 🎯 Próximos pasos

1. **EJECUTAR EL SQL EN SUPABASE** ← HACER AHORA
2. Probar registro de equipo con foto
3. Verificar que los emails aparecen en `newsletter_subscribers`
4. Commit y push de los cambios

## 📝 Notas

- La newsletter es **opcional** y no afecta el registro
- Los emails se agregan **automáticamente** sin confirmación
- Se respetan los emails que ya están en la newsletter
- Los jugadores pueden darse de baja desde la newsletter normal
