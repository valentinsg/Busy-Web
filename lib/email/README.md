# 📧 Email System

Sistema completo de envío de emails para Busy Streetwear usando **Resend**.

## 🎯 Características

- ✅ 6 templates HTML responsive con diseño de Busy
- ✅ Integración con sistema de notificaciones
- ✅ Respeta preferencias de usuario (opt-in/opt-out)
- ✅ Logs automáticos en Supabase
- ✅ TypeScript completo
- ✅ Endpoint de testing

## 📁 Estructura

```
lib/email/
├── index.ts                    # Exportaciones principales
├── resend.ts                   # Cliente y configuración
├── send.ts                     # Lógica de envío
├── hooks.ts                    # Integración con notificaciones
├── examples.ts                 # Ejemplos de uso
├── README.md                   # Este archivo
└── templates/
    ├── base.ts                 # Layout base
    ├── new-order.ts
    ├── pending-transfer.ts
    ├── artist-submission.ts
    ├── low-stock.ts
    ├── order-cancelled.ts
    ├── newsletter-welcome.ts
    └── test.ts
```

## 🚀 Quick Start

### 1. Configurar

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM="Busy Streetwear <no-reply@busy.com.ar>"
ADMIN_EMAIL="admin@busy.com.ar"
```

### 2. Probar

```typescript
import { sendTestEmail } from '@/lib/email'

await sendTestEmail()
```

### 3. Usar

```typescript
import { handleNotificationEmail } from '@/lib/email'

await handleNotificationEmail({
  notificationId: 'uuid',
  notificationType: 'new_order',
  metadata: { order_id: 'uuid', total: 15000 },
})
```

## 📧 Templates

| Template | Archivo | Uso |
|----------|---------|-----|
| New Order | `new-order.ts` | Nueva orden pagada |
| Pending Transfer | `pending-transfer.ts` | Transferencia pendiente |
| Artist Submission | `artist-submission.ts` | Propuesta de artista |
| Low Stock | `low-stock.ts` | Stock bajo |
| Order Cancelled | `order-cancelled.ts` | Orden cancelada |
| Newsletter Welcome | `newsletter-welcome.ts` | Bienvenida newsletter |
| Test | `test.ts` | Testing del sistema |

## 🔧 API

### Core Functions

```typescript
// Enviar email genérico
sendEmail(params: {
  to: string
  template: EmailTemplate
  data: any
  notificationId?: string
  notificationType?: NotificationType
}): Promise<EmailSendResult>

// Enviar a admin (respeta preferencias)
sendAdminEmail(params: {
  template: EmailTemplate
  data: any
  notificationId?: string
  notificationType: NotificationType
}): Promise<EmailSendResult>

// Test
sendTestEmail(to?: string): Promise<EmailSendResult>
```

### Integration Hooks

```typescript
// Handler automático
handleNotificationEmail(params: {
  notificationId: string
  notificationType: string
  metadata: any
}): Promise<void>

// Hooks específicos
sendNewOrderEmail(params)
sendPendingTransferEmail(params)
sendArtistSubmissionEmail(params)
sendLowStockEmail(params)
sendOrderCancelledEmail(params)
```

### Utilities

```typescript
// Verificar configuración
isEmailConfigured(): boolean

// Verificar si tipo tiene emails habilitados
isEmailEnabledForType(type: NotificationType): Promise<boolean>

// Obtener estadísticas
getEmailStats(): Promise<{ total, sent, failed }>
```

## 🎨 Personalizar Templates

### Usar utilidades base

```typescript
import { 
  createEmailLayout, 
  createButton, 
  createInfoBox,
  createBadge,
  BUSY_COLORS 
} from './templates/base'

export function createMiTemplate(data: MiData): string {
  const content = `
    <h1 class="email-title">Título</h1>
    <p class="email-text">Contenido</p>
    
    ${createInfoBox('Información importante')}
    
    ${createButton({
      text: 'Ver Más',
      url: 'https://busy.com.ar',
      accent: true
    })}
  `

  return createEmailLayout({
    title: 'Mi Template',
    preheader: 'Texto preview',
    content
  })
}
```

## 📊 Monitoreo

### Ver logs

```sql
SELECT * FROM notification_logs 
WHERE channel = 'email' 
ORDER BY created_at DESC;
```

### Estadísticas

```typescript
import { getEmailStats } from '@/lib/email'

const stats = await getEmailStats()
// { total: 100, sent: 95, failed: 5 }
```

## 🔐 Preferencias

### Habilitar/Deshabilitar

```sql
-- Habilitar para un tipo
UPDATE notification_preferences 
SET email_enabled = true 
WHERE notification_type = 'new_order';

-- Ver estado
SELECT notification_type, email_enabled 
FROM notification_preferences;
```

## 🧪 Testing

### Endpoint de test

```bash
# GET
curl http://localhost:3000/api/email/test

# POST con destinatario
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com"}'
```

### Desde código

```typescript
import { sendTestEmail } from '@/lib/email'

// Admin por defecto
await sendTestEmail()

// Email específico
await sendTestEmail('test@example.com')
```

## 📚 Documentación

- **Guía completa:** `/EMAIL_SYSTEM_DOCUMENTATION.md`
- **Quick Start:** `/EMAIL_QUICKSTART.md`
- **Ejemplos:** `./examples.ts`
- **Tipos:** `/types/email.ts`

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| "Email system not configured" | Agregar `RESEND_API_KEY` a `.env.local` |
| "Invalid API Key" | Verificar key en Resend dashboard |
| Email no llega | Verificar `email_enabled = true` en DB |
| Va a spam | Verificar dominio en Resend |

## 💡 Tips

- Usa `/api/email/test` antes de producción
- Empieza con pocos tipos habilitados
- Monitorea logs regularmente
- Personaliza templates según tu marca
- Configura alertas para emails fallidos

---

**Desarrollado para Busy Streetwear** 🔥
