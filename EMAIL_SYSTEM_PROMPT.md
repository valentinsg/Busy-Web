# 📧 Prompt para Sistema de Emails

## Contexto del Proyecto

Estoy trabajando en **Busy Streetwear**, un e-commerce de ropa urbana construido con:
- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + Realtime)
- **TypeScript**
- **Tailwind CSS**

## Sistema de Notificaciones Actual

Ya tengo implementado un **sistema completo de notificaciones** que funciona con:
- ✅ Notificaciones en tiempo real (Supabase Realtime)
- ✅ Campana con badge en el header del admin
- ✅ Triggers automáticos para eventos (nueva orden, stock bajo, etc.)
- ✅ Panel de preferencias en `/admin/notifications/preferences`
- ✅ Push notifications (preparado pero con problemas en localhost)

**Archivos clave:**
- `supabase/schema/notifications.sql` - Schema completo con triggers
- `lib/repo/notifications.ts` - Repositorio de notificaciones
- `types/notifications.ts` - Tipos TypeScript
- `components/admin/notifications-bell.tsx` - Campana con popover
- `hooks/use-notifications.ts` - Hook para notificaciones en tiempo real

## Lo que Necesito

Quiero **agregar envío de emails** al sistema de notificaciones existente para que cuando ocurra un evento importante (nueva orden, stock bajo, etc.), además de crear la notificación en la app, también se envíe un email.

## Requisitos

### 1. Integración con Resend
- Usar **Resend** como servicio de email (ya tengo cuenta)
- API Key en `.env.local`: `RESEND_API_KEY`
- Email remitente: `notifications@busystreetwe ar.com` (o el dominio que tengo verificado)

### 2. Templates de Email
Necesito templates HTML bonitos y responsive para:
- **Nueva Orden** - Notificar al admin cuando hay una nueva orden
- **Stock Bajo** - Alertar cuando un producto tiene poco stock
- **Transferencia Pendiente** - Recordar que hay una transferencia por confirmar
- **Propuesta de Artista** - Notificar cuando un artista envía una propuesta
- **Orden Cancelada** - Informar cuando se cancela una orden
- **Newsletter Subscription** - Confirmar suscripción al newsletter

### 3. Arquitectura
- Crear `lib/email/` con:
  - `resend.ts` - Cliente de Resend
  - `templates/` - Templates HTML de emails
  - `send.ts` - Funciones para enviar cada tipo de email
- Integrar con el sistema de notificaciones existente
- Respetar las preferencias: solo enviar si `email_enabled = true` en `notification_preferences`

### 4. Características
- **Templates responsive** con diseño moderno
- **Branding de Busy** (colores, logo, tipografía)
- **Links directos** a la acción (ver orden, ver producto, etc.)
- **Fallback a texto plano** para clientes de email antiguos
- **Logs de envío** (guardar en `notification_logs` si el email se envió correctamente)
- **Rate limiting** para evitar spam
- **Queue system** (opcional) para envíos masivos

### 5. Configuración de Preferencias
Agregar a `/admin/notifications/preferences`:
- Toggle para habilitar/deshabilitar emails por tipo de notificación
- Campo para configurar email de destino (por defecto: admin@busystreetwe ar.com)
- Opción para enviar emails de prueba

## Estructura Sugerida

```
lib/
  email/
    resend.ts          # Cliente de Resend
    send.ts            # Funciones de envío
    templates/
      base.tsx         # Template base con header/footer
      new-order.tsx    # Template de nueva orden
      low-stock.tsx    # Template de stock bajo
      ...
types/
  email.ts             # Tipos para emails
app/
  api/
    email/
      test/
        route.ts       # Endpoint para enviar email de prueba
```

## Ejemplo de Uso

```typescript
// En el trigger de nueva orden
await sendNewOrderEmail({
  orderId: order.id,
  total: order.total,
  customer: order.customer_name,
  items: order.items,
})
```

## Consideraciones

- **No bloquear** la creación de notificaciones si el email falla
- **Logs detallados** para debugging
- **Retry logic** para emails que fallan
- **Unsubscribe link** en todos los emails (cumplir con regulaciones)
- **Testing** fácil con endpoint `/api/email/test`

## Entregables

1. **Código completo** del sistema de emails
2. **Documentación** en `EMAIL_SYSTEM.md` con:
   - Cómo configurar Resend
   - Cómo crear nuevos templates
   - Cómo probar emails
   - Troubleshooting común
3. **Migración SQL** si es necesario (agregar campos a `notification_preferences`)
4. **Ejemplos** de cómo enviar emails desde cualquier parte del código

## Restricciones

- **No cambiar** el sistema de notificaciones existente (solo agregar emails)
- **Mantener** la arquitectura actual
- **Seguir** los patrones de código del proyecto
- **TypeScript estricto** (sin `any`)
- **Responsive** y compatible con todos los clientes de email

---

## Prompt Completo para Nueva Ventana

```
Necesito implementar un sistema de emails para mi e-commerce Busy Streetwear construido con Next.js 14 + Supabase.

Ya tengo un sistema de notificaciones funcionando con Realtime, triggers SQL y preferencias. Ahora quiero agregar envío de emails usando Resend.

Requisitos:
1. Integración con Resend (API key en .env.local)
2. Templates HTML responsive y bonitos para: nueva orden, stock bajo, transferencia pendiente, propuesta de artista, orden cancelada, newsletter
3. Respetar preferencias de email (email_enabled en notification_preferences)
4. Logs de envío en notification_logs
5. Endpoint /api/email/test para probar
6. Documentación completa

Estructura del proyecto:
- lib/email/ con resend.ts, send.ts y templates/
- types/email.ts para tipos
- Integración con sistema de notificaciones existente

Por favor, genera el código completo con templates bonitos, documentación y ejemplos de uso. Mantén la arquitectura actual y sigue los patrones del proyecto.
```

---

**Copia el prompt de arriba y úsalo en una nueva ventana de Cascade para implementar el sistema de emails sin afectar el trabajo actual.** 📧
