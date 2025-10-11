# 📧 Sistema de Emails - Busy Streetwear

Sistema completo de envío de emails usando **Resend** integrado con el sistema de notificaciones existente.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Configuración](#configuración)
- [Arquitectura](#arquitectura)
- [Templates Disponibles](#templates-disponibles)
- [Uso Básico](#uso-básico)
- [Integración con Notificaciones](#integración-con-notificaciones)
- [API Endpoints](#api-endpoints)
- [Preferencias de Email](#preferencias-de-email)
- [Logs y Monitoreo](#logs-y-monitoreo)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

- ✅ **6 Templates HTML Responsive** - Diseñados con la identidad visual de Busy
- ✅ **Integración con Resend** - Servicio confiable de envío de emails
- ✅ **Respeta Preferencias** - Sistema de opt-in/opt-out por tipo de notificación
- ✅ **Logs Automáticos** - Registro en `notification_logs` para auditoría
- ✅ **Endpoint de Testing** - `/api/email/test` para verificar configuración
- ✅ **TypeScript Completo** - Tipos seguros para todos los datos
- ✅ **Hooks de Integración** - Envío automático al crear notificaciones

---

## 🔧 Configuración

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```bash
# Resend API Key (REQUERIDO)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration
EMAIL_FROM="Busy Streetwear <no-reply@busy.com.ar>"
EMAIL_REPLY_TO="hola@busy.com.ar"
ADMIN_EMAIL="admin@busy.com.ar"

# Optional: BCC para copias ocultas (comma-separated)
EMAIL_BCC="backup@busy.com.ar,analytics@busy.com.ar"

# Site URL (para links en emails)
NEXT_PUBLIC_SITE_URL="https://busy.com.ar"
```

### 2. Obtener API Key de Resend

1. Crea una cuenta en [resend.com](https://resend.com)
2. Verifica tu dominio (busy.com.ar)
3. Genera una API Key en el dashboard
4. Copia la key a `RESEND_API_KEY`

### 3. Verificar Instalación

El paquete `resend` ya está instalado en tu `package.json`. Si no:

```bash
pnpm add resend
```

### 4. Habilitar Emails por Tipo

Por defecto, los emails están **deshabilitados**. Para habilitarlos:

```sql
-- Habilitar emails para nuevas órdenes
UPDATE notification_preferences 
SET email_enabled = true 
WHERE notification_type = 'new_order';

-- Habilitar emails para stock bajo
UPDATE notification_preferences 
SET email_enabled = true 
WHERE notification_type = 'low_stock';

-- Ver estado actual
SELECT notification_type, email_enabled, push_enabled 
FROM notification_preferences;
```

---

## 🏗️ Arquitectura

```
lib/email/
├── index.ts                    # Exportaciones principales
├── resend.ts                   # Cliente Resend y configuración
├── send.ts                     # Lógica de envío de emails
├── hooks.ts                    # Integración con notificaciones
├── examples.ts                 # Ejemplos de uso
└── templates/
    ├── base.ts                 # Layout base y utilidades
    ├── new-order.ts            # Template: Nueva orden
    ├── pending-transfer.ts     # Template: Transferencia pendiente
    ├── artist-submission.ts    # Template: Propuesta de artista
    ├── low-stock.ts            # Template: Stock bajo
    ├── order-cancelled.ts      # Template: Orden cancelada
    ├── newsletter-welcome.ts   # Template: Bienvenida newsletter
    └── test.ts                 # Template: Email de prueba

types/
└── email.ts                    # Tipos TypeScript

app/api/email/
└── test/
    └── route.ts                # Endpoint de testing
```

---

## 📧 Templates Disponibles

### 1. **New Order** (`new_order`)
Notifica al admin cuando se recibe una nueva orden.

**Incluye:**
- Información del cliente
- Lista de productos con cantidades y precios
- Total de la orden
- Botón para ver orden completa
- Badge del canal de venta

### 2. **Pending Transfer** (`pending_transfer`)
Alerta sobre órdenes con transferencia bancaria pendiente.

**Incluye:**
- Datos de la orden
- Monto a verificar
- Checklist de pasos a seguir
- Recordatorio de tiempos de procesamiento

### 3. **Artist Submission** (`artist_submission`)
Notifica propuestas de artistas para playlists.

**Incluye:**
- Información del artista
- Enlaces a Spotify, Instagram, YouTube
- Mensaje del artista
- Botón para revisar propuesta

### 4. **Low Stock** (`low_stock`)
Alerta cuando un producto está por agotarse.

**Incluye:**
- Nombre del producto y SKU
- Stock actual con barra de progreso
- Nivel de urgencia visual
- Acciones recomendadas

### 5. **Order Cancelled** (`order_cancelled`)
Notifica cuando se cancela una orden.

**Incluye:**
- Detalles de la orden cancelada
- Motivo de cancelación (si existe)
- Checklist de acciones (reembolso, inventario, etc.)

### 6. **Newsletter Welcome** (`newsletter_welcome`)
Email de bienvenida para nuevos suscriptores.

**Incluye:**
- Código de descuento WELCOME15
- Beneficios de la suscripción
- Links a colecciones
- Redes sociales

### 7. **Test** (`test`)
Email simple para verificar que el sistema funciona.

---

## 🚀 Uso Básico

### Enviar Email de Prueba

```typescript
import { sendTestEmail } from '@/lib/email'

// Enviar a admin por defecto
await sendTestEmail()

// Enviar a email específico
await sendTestEmail('test@example.com')
```

### Enviar Email Manual

```typescript
import { sendAdminEmail } from '@/lib/email'
import type { NewOrderEmailData } from '@/types/email'

const orderData: NewOrderEmailData = {
  orderId: 'uuid-here',
  orderNumber: '12345678',
  customerName: 'Juan Pérez',
  customerEmail: 'juan@example.com',
  total: 15000,
  currency: 'ARS',
  channel: 'online',
  items: [
    {
      product_name: 'Hoodie Busy Black',
      quantity: 2,
      unit_price: 6000,
      total: 12000,
    },
  ],
  actionUrl: 'https://busy.com.ar/admin/orders/uuid-here',
}

const result = await sendAdminEmail({
  template: 'new_order',
  data: orderData,
  notificationType: 'new_order',
})

if (result.success) {
  console.log('✅ Email enviado:', result.messageId)
} else {
  console.error('❌ Error:', result.error)
}
```

### Enviar a Email Personalizado

```typescript
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: 'custom@example.com',
  template: 'newsletter_welcome',
  data: {
    email: 'custom@example.com',
    firstName: 'María',
  },
  notificationType: 'newsletter_subscription',
})
```

---

## 🔗 Integración con Notificaciones

### Opción 1: Automática con Hooks

Usa `handleNotificationEmail` para enviar emails automáticamente:

```typescript
import { handleNotificationEmail } from '@/lib/email'

// Después de crear una notificación
const notificationId = await createNotification({
  type: 'new_order',
  title: 'Nueva Orden',
  message: 'Orden recibida',
  metadata: {
    order_id: 'uuid',
    total: 15000,
    channel: 'online',
    customer_name: 'Juan Pérez',
  },
})

// Enviar email automáticamente
await handleNotificationEmail({
  notificationId,
  notificationType: 'new_order',
  metadata: {
    order_id: 'uuid',
    total: 15000,
    channel: 'online',
    customer_name: 'Juan Pérez',
  },
})
```

### Opción 2: Hooks Específicos

```typescript
import { sendNewOrderEmail, sendLowStockEmail } from '@/lib/email'

// Nueva orden
await sendNewOrderEmail({
  notificationId: 'uuid',
  metadata: {
    order_id: 'order-uuid',
    total: 15000,
    channel: 'online',
    customer_name: 'Juan Pérez',
  },
})

// Stock bajo
await sendLowStockEmail({
  notificationId: 'uuid',
  metadata: {
    product_id: 'product-uuid',
    product_name: 'Hoodie Black',
    stock: 3,
    sku: 'BUSY-HOOD-001',
  },
  threshold: 5,
})
```

### Opción 3: Integración en API Routes

```typescript
// app/api/orders/route.ts
import { handleNotificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  // ... crear orden ...

  // Crear notificación (trigger SQL lo hace automáticamente)
  // Luego enviar email
  await handleNotificationEmail({
    notificationId: notification.id,
    notificationType: 'new_order',
    metadata: {
      order_id: order.id,
      total: order.total,
      channel: order.channel,
      customer_name: customer.full_name,
    },
  })

  return Response.json({ success: true })
}
```

---

## 🌐 API Endpoints

### GET `/api/email/test`

Envía un email de prueba al admin.

**Query Params:**
- `to` (opcional): Email destinatario

**Ejemplo:**
```bash
# Enviar a admin
curl https://busy.com.ar/api/email/test

# Enviar a email específico
curl https://busy.com.ar/api/email/test?to=test@example.com
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "abc123",
  "recipient": "admin",
  "stats": {
    "total": 42,
    "sent": 40,
    "failed": 2
  }
}
```

### POST `/api/email/test`

Envía email de prueba a destinatario personalizado.

**Body:**
```json
{
  "to": "test@example.com"
}
```

**Ejemplo:**
```bash
curl -X POST https://busy.com.ar/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com"}'
```

---

## ⚙️ Preferencias de Email

### Ver Preferencias Actuales

```sql
SELECT 
  notification_type,
  enabled,
  push_enabled,
  email_enabled,
  priority
FROM notification_preferences
ORDER BY notification_type;
```

### Habilitar/Deshabilitar Emails

```sql
-- Habilitar emails para un tipo específico
UPDATE notification_preferences 
SET email_enabled = true 
WHERE notification_type = 'new_order';

-- Deshabilitar todos los emails
UPDATE notification_preferences 
SET email_enabled = false;

-- Habilitar solo emails críticos
UPDATE notification_preferences 
SET email_enabled = true 
WHERE priority IN ('high', 'critical');
```

### Desde el Código

```typescript
import { isEmailEnabledForType } from '@/lib/email'

// Verificar si emails están habilitados
const enabled = await isEmailEnabledForType('new_order')
if (enabled) {
  // Enviar email
}
```

---

## 📊 Logs y Monitoreo

### Ver Logs de Emails

```sql
-- Últimos 50 emails enviados
SELECT 
  nl.created_at,
  nl.channel,
  nl.status,
  nl.error_message,
  n.type,
  n.title
FROM notification_logs nl
JOIN notifications n ON nl.notification_id = n.id
WHERE nl.channel = 'email'
ORDER BY nl.created_at DESC
LIMIT 50;

-- Estadísticas de envío
SELECT 
  status,
  COUNT(*) as count
FROM notification_logs
WHERE channel = 'email'
GROUP BY status;
```

### Desde el Código

```typescript
import { getEmailStats } from '@/lib/email'

const stats = await getEmailStats()
console.log(`Total: ${stats.total}`)
console.log(`Enviados: ${stats.sent}`)
console.log(`Fallidos: ${stats.failed}`)
```

---

## 🎨 Personalizar Templates

### Colores de la Marca

Los templates usan los colores de Busy definidos en `lib/email/templates/base.ts`:

```typescript
export const BUSY_COLORS = {
  primary: '#000000',      // Negro
  accent: '#FF6B00',       // Naranja accent-brand
  background: '#FFFFFF',
  text: '#1a1a1a',
  textMuted: '#666666',
  border: '#e5e5e5',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
}
```

### Crear Template Personalizado

1. Crea archivo en `lib/email/templates/mi-template.ts`
2. Usa las utilidades de `base.ts`:

```typescript
import { createEmailLayout, createButton, createInfoBox } from './base'
import type { MiTemplateData } from '@/types/email'

export function createMiTemplate(data: MiTemplateData): string {
  const content = `
    <h1 class="email-title">Mi Template</h1>
    <p class="email-text">${data.message}</p>
    
    ${createInfoBox(`
      <p><strong>Info:</strong> ${data.info}</p>
    `)}
    
    ${createButton({
      text: 'Ver Más',
      url: data.actionUrl,
      accent: true,
    })}
  `

  return createEmailLayout({
    title: 'Mi Template',
    preheader: 'Preheader text',
    content,
  })
}
```

3. Agrega tipo en `types/email.ts`
4. Registra en `lib/email/send.ts`

---

## 🐛 Troubleshooting

### Email no se envía

**1. Verificar configuración:**
```typescript
import { isEmailConfigured } from '@/lib/email'

if (!isEmailConfigured()) {
  console.log('❌ RESEND_API_KEY no está configurado')
}
```

**2. Verificar preferencias:**
```sql
SELECT email_enabled 
FROM notification_preferences 
WHERE notification_type = 'new_order';
```

**3. Revisar logs:**
```sql
SELECT * FROM notification_logs 
WHERE channel = 'email' 
AND status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Emails van a spam

1. **Verifica dominio en Resend:** Debe estar verificado con DNS
2. **Configura SPF/DKIM:** Sigue guía de Resend
3. **Usa EMAIL_FROM correcto:** Debe ser del dominio verificado
4. **Evita palabras spam:** "GRATIS", "URGENTE", etc.

### Error: "Invalid API Key"

```bash
# Verifica que la key esté en .env.local
cat .env.local | grep RESEND_API_KEY

# Reinicia el servidor de desarrollo
pnpm dev
```

### Template no se renderiza

1. Verifica que el tipo esté en `EMAIL_SUBJECTS` en `send.ts`
2. Verifica que el template esté importado
3. Revisa errores en consola del servidor

---

## 📚 Recursos Adicionales

- [Documentación de Resend](https://resend.com/docs)
- [Sistema de Notificaciones](./NOTIFICATIONS_SETUP.md)
- [Ejemplos de Uso](./lib/email/examples.ts)
- [Tipos TypeScript](./types/email.ts)

---

## 🎯 Próximos Pasos

1. **Configurar Resend** y verificar dominio
2. **Agregar RESEND_API_KEY** a `.env.local`
3. **Probar sistema** con `GET /api/email/test`
4. **Habilitar emails** para tipos deseados en DB
5. **Integrar hooks** en tu código existente
6. **Monitorear logs** para verificar envíos

---

## 💡 Tips

- **Testing:** Usa `/api/email/test` antes de producción
- **Staging:** Usa email de prueba en desarrollo
- **Logs:** Revisa `notification_logs` regularmente
- **Preferencias:** Empieza con pocos tipos habilitados
- **Templates:** Personaliza según tu marca
- **Monitoreo:** Configura alertas para emails fallidos

---

**¡Sistema de emails listo para usar! 🚀**

Para soporte: hola@busy.com.ar
