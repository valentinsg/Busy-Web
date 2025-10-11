# 🚀 Quick Start - Sistema de Notificaciones

## ✅ Pasos Completados

- ✅ Dependencias instaladas (`web-push`)
- ✅ VAPID keys generadas
- ✅ Variables de entorno configuradas

## 📝 Próximos Pasos

### 1. Ejecutar Migraciones SQL en Supabase

El archivo SQL ha sido **corregido** para funcionar con Supabase (sin `IF NOT EXISTS` en policies).

**Opción A: Desde el Dashboard de Supabase**

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de: `supabase/schema/notifications.sql`
5. Haz clic en **Run** (o presiona Ctrl+Enter)

**Opción B: Desde CLI (si tienes Supabase CLI)**

```bash
supabase db push
# o
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/schema/notifications.sql
```

### 2. Habilitar Supabase Realtime

1. En el dashboard de Supabase, ve a **Database** → **Replication**
2. Busca la tabla `notifications`
3. Habilita la replicación
4. Selecciona los eventos: **INSERT**, **UPDATE**, **DELETE**
5. Guarda los cambios

### 3. Iniciar el Servidor

```bash
pnpm dev
```

### 4. Probar el Sistema

1. Abre el navegador en `http://localhost:3000/admin`
2. Verás la campana 🔔 en el header (sin notificaciones aún)
3. Ve a `/admin/notifications/preferences`
4. Haz clic en **"Habilitar notificaciones push"** (acepta el permiso del navegador)
5. Haz clic en el botón 🧪 junto a cualquier tipo de notificación
6. Deberías ver:
   - Notificación en la campana 🔔 con badge [1]
   - Notificación push del navegador (si está habilitado)

### 5. Verificar Triggers Automáticos

Para verificar que los triggers funcionan:

**Test 1: Nueva Orden**
```sql
-- Ejecuta en SQL Editor de Supabase
INSERT INTO orders (customer_id, channel, status, currency, total, subtotal)
VALUES (null, 'web', 'paid', 'USD', 100.00, 100.00);
```
Deberías recibir notificación de "Nueva Orden"

**Test 2: Stock Bajo**
```sql
-- Actualiza un producto para que tenga stock bajo
UPDATE products SET stock = 3 WHERE id = 'tu-product-id';
```
Deberías recibir notificación de "Stock Bajo"

**Test 3: Propuesta de Artista**
1. Ve a `/playlists` en el frontend
2. Envía una propuesta de artista
3. Deberías recibir notificación

---

## 🎯 Ubicaciones Importantes

### En la UI
- **Campana**: Header del admin (esquina superior derecha)
- **Panel**: `/admin/notifications`
- **Preferencias**: `/admin/notifications/preferences`
- **Sidebar**: Sección "Notificaciones" 🔔

### En el Código
- **Schema SQL**: `supabase/schema/notifications.sql`
- **Tipos**: `types/notifications.ts`
- **Repositorio**: `lib/repo/notifications.ts`
- **Hooks**: `hooks/use-notifications.ts`, `hooks/use-push-notifications.ts`
- **API**: `app/api/notifications/`

---

## 🔧 Troubleshooting

### Error: "VAPID keys not configured"
- Verifica que las variables estén en `.env.local`
- Reinicia el servidor (`pnpm dev`)

### Error: "Failed to subscribe to push"
- Verifica que estés en HTTPS o localhost
- Revisa los permisos del navegador
- Limpia la caché y vuelve a intentar

### No recibo notificaciones en tiempo real
- Verifica que Supabase Realtime esté habilitado
- Revisa la consola del navegador para errores
- Asegúrate de que el componente esté montado

### Los triggers no funcionan
- Verifica que los triggers se hayan creado: 
  ```sql
  SELECT * FROM pg_trigger WHERE tgname LIKE 'trigger_notify%';
  ```
- Revisa que las preferencias estén habilitadas
- Comprueba los logs de Supabase

---

## 📊 Verificar Instalación

Ejecuta estas queries en Supabase SQL Editor para verificar:

```sql
-- 1. Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'notification%';

-- Deberías ver:
-- - notifications
-- - notification_preferences
-- - notification_logs

-- 2. Verificar triggers
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE 'trigger_notify%';

-- Deberías ver 6 triggers

-- 3. Verificar preferencias por defecto
SELECT notification_type, enabled, priority 
FROM notification_preferences 
ORDER BY notification_type;

-- Deberías ver 10 tipos de notificaciones

-- 4. Verificar funciones
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%notification%';

-- Deberías ver:
-- - create_notification
-- - mark_notification_read
-- - cleanup_old_notifications
```

---

## 🎉 ¡Todo Listo!

Si todos los pasos funcionan correctamente, tu sistema de notificaciones está completamente operativo.

### Próximos Pasos Opcionales

1. **Personalizar iconos y colores** en `types/notifications.ts`
2. **Ajustar umbrales** en preferencias (stock bajo, días newsletter)
3. **Agregar más tipos** siguiendo la guía en `NOTIFICATIONS_SETUP.md`
4. **Configurar cleanup automático** con cron job
5. **Integrar con email** para notificaciones por correo

---

**¿Necesitas ayuda?** Consulta `NOTIFICATIONS_SETUP.md` para la guía completa.
