# 🚀 Email System - Quick Start Guide

Guía rápida para poner en marcha el sistema de emails en **5 minutos**.

---

## ⚡ Setup Rápido

### 1. Obtener API Key de Resend (2 min)

1. Ve a [resend.com/signup](https://resend.com/signup)
2. Crea cuenta gratuita (100 emails/día)
3. Dashboard → API Keys → Create API Key
4. Copia la key (empieza con `re_`)

### 2. Configurar Variables de Entorno (1 min)

Agrega a `.env.local`:

```bash
# REQUERIDO
RESEND_API_KEY=re_tu_api_key_aqui

# OPCIONAL (usa defaults si no los defines)
EMAIL_FROM="Busy Streetwear <no-reply@busy.com.ar>"
ADMIN_EMAIL="admin@busy.com.ar"
NEXT_PUBLIC_SITE_URL="https://busy.com.ar"
```

### 3. Probar Sistema (1 min)

```bash
# Reinicia el servidor
pnpm dev

# Abre en navegador o curl
curl http://localhost:3000/api/email/test
```

Si ves `"success": true` → **¡Funciona! ✅**

### 4. Habilitar Emails en DB (1 min)

```sql
-- Conecta a tu Supabase y ejecuta:
UPDATE notification_preferences 
SET email_enabled = true 
WHERE notification_type IN ('new_order', 'low_stock', 'pending_transfer');
```

---

## 📧 Uso Inmediato

### Enviar Email de Prueba

```typescript
import { sendTestEmail } from '@/lib/email'

await sendTestEmail() // Envía a ADMIN_EMAIL
```

### Enviar Email de Nueva Orden

```typescript
import { handleNotificationEmail } from '@/lib/email'

// Después de crear una orden
await handleNotificationEmail({
  notificationId: notification.id,
  notificationType: 'new_order',
  metadata: {
    order_id: order.id,
    total: order.total,
    channel: 'online',
    customer_name: customer.name,
  },
})
```

---

## ✅ Checklist de Verificación

- [ ] RESEND_API_KEY configurado en `.env.local`
- [ ] Servidor reiniciado (`pnpm dev`)
- [ ] Test endpoint funciona (`/api/email/test`)
- [ ] Email recibido en bandeja de entrada
- [ ] Preferencias habilitadas en DB
- [ ] Logs visibles en `notification_logs`

---

## 🎯 Templates Disponibles

| Template | Tipo | Cuándo se envía |
|----------|------|-----------------|
| **New Order** | `new_order` | Nueva orden pagada |
| **Pending Transfer** | `pending_transfer` | Orden con transferencia |
| **Artist Submission** | `artist_submission` | Propuesta de artista |
| **Low Stock** | `low_stock` | Producto con stock bajo |
| **Order Cancelled** | `order_cancelled` | Orden cancelada |
| **Newsletter Welcome** | `newsletter_welcome` | Nueva suscripción |

---

## 🔧 Comandos Útiles

```bash
# Test email desde terminal
curl http://localhost:3000/api/email/test

# Test con email personalizado
curl "http://localhost:3000/api/email/test?to=test@example.com"

# Ver logs en Supabase
# SQL Editor → Ejecutar:
SELECT * FROM notification_logs 
WHERE channel = 'email' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🐛 Problemas Comunes

### "Email system not configured"
→ Falta `RESEND_API_KEY` en `.env.local`

### "Invalid API Key"
→ Verifica que la key sea correcta y reinicia servidor

### Email no llega
→ Verifica `email_enabled = true` en `notification_preferences`

### Email va a spam
→ Verifica dominio en Resend (gratis: usa `onboarding@resend.dev`)

---

## 📚 Más Info

- **Documentación completa:** `EMAIL_SYSTEM_DOCUMENTATION.md`
- **Ejemplos de código:** `lib/email/examples.ts`
- **Tipos TypeScript:** `types/email.ts`

---

**¡Listo para enviar emails! 🎉**
