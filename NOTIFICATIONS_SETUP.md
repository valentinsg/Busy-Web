# 🔔 Sistema de Notificaciones Personalizadas - Guía Completa

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Tipos de Notificaciones](#tipos-de-notificaciones)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Uso del Sistema](#uso-del-sistema)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen Ejecutivo

Sistema completo de notificaciones personalizadas que combina:
- **Web Push API** para notificaciones en tiempo real
- **Supabase Realtime** para actualizaciones instantáneas
- **Database Triggers** para eventos automáticos
- **Panel de Preferencias** para control granular

### Eventos Implementados (10 tipos)

#### Alta Prioridad (Tiempo Real)
1. ✅ **Nueva Orden** - Cuando alguien compra
2. ✅ **Transferencia Pendiente** - Pago por transferencia esperando confirmación
3. ✅ **Nueva Propuesta de Artista** - Cuando un artista quiere colaborar
4. ✅ **Stock Crítico** - Producto con stock < 5 unidades

#### Media Prioridad (Diaria)
5. ✅ **Nueva Suscripción Newsletter** - Cuando alguien se suscribe
6. ✅ **Orden Cancelada** - Cambios de estado importantes
7. ✅ **Error de Pago** - Webhook fallido o pago rechazado

#### Baja Prioridad (Semanal/Mensual)
8. ✅ **Reporte Semanal** - Resumen de ventas, stock, métricas
9. ✅ **Reporte Mensual** - Análisis completo de ingresos, gastos, ROI
10. ✅ **Recordatorio Newsletter** - Sugerencia de enviar campaña (si hace >7 días)

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    NOTIFICATION SYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   DATABASE   │───▶│   TRIGGERS   │───▶│  REALTIME    │ │
│  │   EVENTS     │    │   (Auto)     │    │  UPDATES     │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                                         │         │
│         ▼                                         ▼         │
│  ┌──────────────┐                        ┌──────────────┐ │
│  │ NOTIFICATION │                        │   WEB PUSH   │ │
│  │    TABLE     │                        │     API      │ │
│  └──────────────┘                        └──────────────┘ │
│         │                                         │         │
│         └─────────────────┬───────────────────────┘         │
│                           ▼                                 │
│                  ┌──────────────┐                          │
│                  │   ADMIN UI   │                          │
│                  │  (Bell Icon) │                          │
│                  └──────────────┘                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principales

#### 1. Base de Datos
- **`notifications`** - Tabla principal de notificaciones
- **`notification_preferences`** - Configuración por tipo
- **`push_subscriptions`** - Suscripciones Web Push
- **`notification_logs`** - Auditoría de envíos

#### 2. Triggers Automáticos
- `trigger_notify_new_order` - Nueva orden
- `trigger_notify_pending_transfer` - Transferencia pendiente
- `trigger_notify_artist_submission` - Propuesta de artista
- `trigger_notify_low_stock` - Stock bajo
- `trigger_notify_newsletter_subscription` - Nueva suscripción
- `trigger_notify_order_cancelled` - Orden cancelada

#### 3. API Endpoints
- `GET /api/notifications` - Listar notificaciones
- `PATCH /api/notifications` - Marcar todas como leídas
- `GET /api/notifications/[id]` - Obtener una notificación
- `PATCH /api/notifications/[id]` - Marcar como leída
- `DELETE /api/notifications/[id]` - Eliminar notificación
- `POST /api/notifications/subscribe` - Suscribirse a push
- `DELETE /api/notifications/subscribe` - Desuscribirse
- `GET /api/notifications/preferences` - Obtener preferencias
- `PATCH /api/notifications/preferences` - Actualizar preferencias
- `POST /api/notifications/test` - Enviar notificación de prueba

#### 4. UI Components
- `NotificationsBell` - Campana con badge de contador
- `NotificationItem` - Item individual de notificación
- `/admin/notifications` - Panel principal
- `/admin/notifications/preferences` - Configuración

---

## ⚙️ Instalación y Configuración

### Paso 1: Instalar Dependencias

```bash
pnpm add web-push date-fns
```

### Paso 2: Generar VAPID Keys

Ejecuta este script para generar las claves VAPID:

```typescript
// scripts/generate-vapid-keys.ts
import { generateVapidKeys } from '@/lib/notifications/server'

generateVapidKeys()
```

```bash
npx tsx scripts/generate-vapid-keys.ts
```

### Paso 3: Configurar Variables de Entorno

Agrega las claves generadas a tu `.env.local`:

```env
# VAPID Keys para Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BG...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@busy.com
```

### Paso 4: Ejecutar Migraciones SQL

Ejecuta el schema en Supabase:

```bash
# Conecta a tu base de datos y ejecuta:
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/schema/notifications.sql
```

O desde el dashboard de Supabase:
1. Ve a SQL Editor
2. Copia el contenido de `supabase/schema/notifications.sql`
3. Ejecuta

### Paso 5: Configurar Supabase Realtime

En el dashboard de Supabase:
1. Ve a **Database** → **Replication**
2. Habilita replicación para la tabla `notifications`
3. Selecciona eventos: `INSERT`, `UPDATE`, `DELETE`

### Paso 6: Verificar Service Worker

El archivo `public/sw.js` debe estar accesible en `/sw.js`.

Verifica en el navegador:
```
https://tu-dominio.com/sw.js
```

---

## 🚀 Uso del Sistema

### Para Desarrolladores

#### Crear Notificación Manual

```typescript
import { createNotification } from '@/lib/repo/notifications'

const notificationId = await createNotification({
  type: 'new_order',
  title: 'Nueva Orden #12345',
  message: 'Total: USD 150.00 - Canal: web',
  metadata: {
    order_id: '12345',
    total: 150.00,
    channel: 'web'
  },
  action_url: '/admin/sales/12345'
})
```

#### Enviar Push Notification

```typescript
import { sendPushNotification } from '@/lib/notifications/server'

await sendPushNotification({
  title: 'Nueva Orden',
  body: 'Tienes una nueva orden de $150',
  icon: '/icons/icon-192x192.png',
  data: {
    url: '/admin/sales/12345'
  }
})
```

#### Usar Hook de Notificaciones

```typescript
'use client'

import { useNotifications } from '@/hooks/use-notifications'

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications()

  return (
    <div>
      <h2>Tienes {unreadCount} notificaciones sin leer</h2>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id)}>
          {n.title}
        </div>
      ))}
    </div>
  )
}
```

#### Suscribirse a Push

```typescript
'use client'

import { usePushNotifications } from '@/hooks/use-push-notifications'

function PushSettings() {
  const { supported, subscribed, subscribe, unsubscribe } = usePushNotifications()

  if (!supported) return <p>Tu navegador no soporta push</p>

  return (
    <button onClick={subscribed ? unsubscribe : subscribe}>
      {subscribed ? 'Desactivar' : 'Activar'} notificaciones
    </button>
  )
}
```

### Para Administradores

#### Acceder al Panel

1. Ve a `/admin/notifications`
2. Verás todas las notificaciones con filtros
3. Haz clic en cualquier notificación para marcarla como leída
4. Usa el botón "Marcar todas como leídas"

#### Configurar Preferencias

1. Ve a `/admin/notifications/preferences`
2. Activa/desactiva cada tipo de notificación
3. Configura umbrales (ej: stock bajo = 5 unidades)
4. Habilita notificaciones push del navegador

#### Probar Notificaciones

En `/admin/notifications/preferences`:
1. Haz clic en el botón de prueba (🧪) junto a cada tipo
2. Verás la notificación en la campana
3. Si tienes push habilitado, también recibirás notificación del navegador

---

## 📚 API Reference

### Notification Types

```typescript
type NotificationType =
  | 'new_order'
  | 'pending_transfer'
  | 'artist_submission'
  | 'low_stock'
  | 'newsletter_subscription'
  | 'order_cancelled'
  | 'payment_error'
  | 'weekly_report'
  | 'monthly_report'
  | 'newsletter_reminder'
```

### Notification Priority

```typescript
type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'
```

### Notification Interface

```typescript
interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  metadata: Record<string, any>
  action_url?: string | null
  read: boolean
  read_at?: string | null
  created_at: string
  expires_at?: string | null
}
```

### Repository Functions

```typescript
// Obtener notificaciones
getNotifications(params?: {
  limit?: number
  offset?: number
  unreadOnly?: boolean
  type?: NotificationType
}): Promise<Notification[]>

// Obtener contador de no leídas
getUnreadCount(): Promise<number>

// Marcar como leída
markNotificationRead(id: string): Promise<boolean>

// Marcar todas como leídas
markAllNotificationsRead(): Promise<boolean>

// Eliminar notificación
deleteNotification(id: string): Promise<boolean>

// Crear notificación manual
createNotification(params: {
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, any>
  action_url?: string
}): Promise<string | null>
```

---

## 🔧 Troubleshooting

### Problema: No recibo notificaciones push

**Solución:**
1. Verifica que las VAPID keys estén configuradas correctamente
2. Comprueba que el service worker esté registrado: `navigator.serviceWorker.getRegistrations()`
3. Revisa los permisos del navegador: `Notification.permission`
4. Verifica que la suscripción esté guardada en la base de datos

### Problema: Los triggers no se ejecutan

**Solución:**
1. Verifica que los triggers estén creados: `SELECT * FROM pg_trigger`
2. Comprueba los logs de Supabase
3. Asegúrate de que las preferencias estén habilitadas
4. Revisa que la función `create_notification` exista

### Problema: Notificaciones no aparecen en tiempo real

**Solución:**
1. Verifica que Supabase Realtime esté habilitado para la tabla `notifications`
2. Comprueba la conexión del cliente: `supabase.channel('notifications').subscribe()`
3. Revisa la consola del navegador para errores
4. Asegúrate de que el componente esté montado cuando se crea la notificación

### Problema: Service worker no se registra

**Solución:**
1. Verifica que el archivo `public/sw.js` exista
2. Comprueba que esté accesible en `/sw.js`
3. Asegúrate de estar en HTTPS (o localhost)
4. Limpia la caché del navegador y vuelve a registrar

---

## 📊 Métricas y Monitoreo

### Queries Útiles

```sql
-- Notificaciones por tipo (últimos 7 días)
SELECT type, COUNT(*) as total
FROM notifications
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY type
ORDER BY total DESC;

-- Tasa de lectura
SELECT
  COUNT(*) FILTER (WHERE read = true) * 100.0 / COUNT(*) as read_rate
FROM notifications;

-- Notificaciones por prioridad
SELECT priority, COUNT(*) as total
FROM notifications
GROUP BY priority;

-- Suscripciones push activas
SELECT COUNT(*) FROM push_subscriptions;
```

### Limpieza Automática

Ejecuta periódicamente (ej: cron job diario):

```typescript
import { cleanupOldNotifications } from '@/lib/repo/notifications'

// Elimina notificaciones leídas > 30 días y expiradas
await cleanupOldNotifications()
```

---

## 🎨 Personalización

### Cambiar Iconos

Edita `types/notifications.ts`:

```typescript
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  new_order: '🛍️',  // Cambia aquí
  // ...
}
```

### Cambiar Colores

Edita `types/notifications.ts`:

```typescript
export const NOTIFICATION_COLORS: Record<NotificationPriority, string> = {
  critical: 'text-red-500',  // Cambia aquí
  // ...
}
```

### Agregar Nuevo Tipo de Notificación

1. **Actualiza el schema SQL:**
```sql
-- Agrega el nuevo tipo al check constraint
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (..., 'nuevo_tipo'));
```

2. **Actualiza los tipos TypeScript:**
```typescript
// types/notifications.ts
type NotificationType = ... | 'nuevo_tipo'
```

3. **Crea el trigger (si es automático):**
```sql
CREATE OR REPLACE FUNCTION notify_nuevo_tipo()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    'nuevo_tipo',
    'Título',
    'Mensaje',
    jsonb_build_object('data', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_nuevo_tipo
  AFTER INSERT ON tabla
  FOR EACH ROW
  EXECUTE FUNCTION notify_nuevo_tipo();
```

---

## 🚀 Próximos Pasos

### Mejoras Sugeridas

1. **Email Notifications** - Enviar también por email
2. **SMS Notifications** - Integrar Twilio/similar
3. **Slack Integration** - Notificar en canal de Slack
4. **Telegram Bot** - Bot de Telegram para notificaciones
5. **Notification Groups** - Agrupar notificaciones similares
6. **Snooze Feature** - Posponer notificaciones
7. **Priority Inbox** - Vista por prioridad
8. **Sound Alerts** - Sonidos personalizados
9. **Desktop App** - Electron app para notificaciones nativas
10. **Analytics Dashboard** - Métricas detalladas de notificaciones

---

## 📝 Notas Finales

- **Performance**: El sistema está optimizado para manejar miles de notificaciones
- **Escalabilidad**: Usa índices en la base de datos para queries rápidas
- **Seguridad**: RLS habilitado en todas las tablas
- **Privacidad**: Las notificaciones solo son visibles para admins
- **Mantenimiento**: Ejecuta cleanup periódicamente para evitar acumulación

---

**Creado por:** Cascade AI  
**Fecha:** 2025-10-10  
**Versión:** 1.0.0
