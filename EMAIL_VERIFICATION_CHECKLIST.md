# ✅ Email System - Checklist de Verificación

Guía paso a paso para verificar que todos los emails funcionen correctamente.

---

## 📋 Paso 1: Habilitar Emails en la Base de Datos

Ejecuta este SQL en Supabase:

```sql
-- Ejecutar el script de actualización
-- Archivo: supabase/scripts/update_triggers_with_payment_info.sql
```

O ejecuta directamente:

```sql
-- Habilitar emails para todos los tipos importantes
UPDATE notification_preferences 
SET email_enabled = true 
WHERE notification_type IN (
  'new_order',
  'pending_transfer',
  'artist_submission',
  'low_stock',
  'order_cancelled',
  'newsletter_subscription'
);

-- Verificar estado
SELECT 
  notification_type,
  enabled,
  push_enabled,
  email_enabled,
  priority
FROM notification_preferences
ORDER BY priority DESC, notification_type;
```

**Resultado esperado:** Deberías ver `email_enabled = true` para los 6 tipos.

---

## 🧪 Paso 2: Probar TODOS los Emails de una vez

### Opción A: Desde el navegador

Abre en tu navegador:
```
http://localhost:3000/api/email/test-all
```

### Opción B: Desde terminal

```bash
curl http://localhost:3000/api/email/test-all
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Enviados 6 de 6 emails",
  "recipient": "busystreetwear@gmail.com",
  "summary": {
    "total": 6,
    "successful": 6,
    "failed": 0
  }
}
```

---

## 📬 Paso 3: Verificar tu Bandeja de Entrada

Deberías recibir **6 emails** en `busystreetwear@gmail.com`:

### ✅ Email 1: Nueva Orden
- **Asunto:** `🛍️ Nueva Orden #123e4567 - ARS 25000.00`
- **Contenido:**
  - Cliente: Juan Pérez
  - Canal: ONLINE
  - **Método de Pago: MERCADOPAGO** ⭐
  - **Estado: PAGADO** ⭐
  - Total: ARS 25,000.00
  - Botón: "Ver Orden Completa"

### ✅ Email 2: Transferencia Pendiente
- **Asunto:** `💳 Transferencia Pendiente - Orden #789e0123`
- **Contenido:**
  - Cliente: María García
  - Monto: ARS 18,500.00
  - Checklist de pasos a seguir
  - Advertencia de tiempos de procesamiento

### ✅ Email 3: Propuesta de Artista
- **Asunto:** `🎵 Nueva Propuesta: DJ Flow`
- **Contenido:**
  - Artista: DJ Flow
  - Género: Trap
  - Enlaces a Spotify, Instagram, YouTube
  - Mensaje del artista
  - Botón: "Revisar Propuesta"

### ✅ Email 4: Stock Bajo
- **Asunto:** `⚠️ Stock Bajo: Hoodie Busy Black - Talle M (2 unidades)`
- **Contenido:**
  - Producto: Hoodie Busy Black - Talle M
  - SKU: BUSY-HOOD-001-M
  - Stock actual: 2 unidades (URGENTE en rojo)
  - Barra de progreso visual
  - Acciones recomendadas

### ✅ Email 5: Orden Cancelada
- **Asunto:** `❌ Orden Cancelada #cancelled-`
- **Contenido:**
  - Cliente: Pedro Rodríguez
  - Monto: ARS 12,000.00
  - Motivo: "Cliente solicitó cancelación por cambio de talla"
  - Checklist de acciones (reembolso, inventario)

### ✅ Email 6: Bienvenida Newsletter
- **Asunto:** `🎉 ¡Bienvenido a Busy Streetwear!`
- **Contenido:**
  - Saludo personalizado: "Hola Ana"
  - Código de descuento: WELCOME15
  - Beneficios de la suscripción
  - Botón: "Explorar Colección"

---

## 🔍 Paso 4: Verificar Detalles Específicos

### ✅ Email de Nueva Orden debe mostrar:
- [x] Método de pago (MercadoPago, Transferencia, etc.)
- [x] Estado de la orden (Pagado, Pendiente)
- [x] Badge de color según el método (verde para pagado, amarillo para transferencia)
- [x] Nombre del cliente
- [x] Canal de venta

### ✅ Email de Transferencia debe mostrar:
- [x] Advertencia visual (box amarillo)
- [x] Pasos a seguir numerados
- [x] Recordatorio de tiempos de procesamiento

### ✅ Email de Artista debe mostrar:
- [x] Todos los enlaces (Spotify, Instagram, YouTube)
- [x] Mensaje del artista
- [x] Información de contacto

### ✅ Email de Stock Bajo debe mostrar:
- [x] Nivel de urgencia (rojo si ≤2, amarillo si >2)
- [x] Barra de progreso visual
- [x] Acciones recomendadas

---

## 🎯 Paso 5: Probar Emails Individuales

Si quieres probar un tipo específico:

### Nueva Orden
```bash
curl -X POST http://localhost:3000/api/email/test-all
```

O usa el endpoint de test individual (crear si necesario).

---

## 📊 Paso 6: Verificar Logs en Supabase

```sql
-- Ver últimos emails enviados
SELECT 
  nl.created_at,
  nl.status,
  n.type,
  n.title,
  nl.error_message
FROM notification_logs nl
JOIN notifications n ON nl.notification_id = n.id
WHERE nl.channel = 'email'
ORDER BY nl.created_at DESC
LIMIT 20;

-- Estadísticas
SELECT 
  status,
  COUNT(*) as count
FROM notification_logs
WHERE channel = 'email'
GROUP BY status;
```

**Resultado esperado:**
- Todos los emails con `status = 'sent'`
- Sin errores en `error_message`

---

## 🔧 Paso 7: Verificar Triggers SQL

Los triggers deben incluir `payment_method` y `status` en el metadata.

Ejecuta el script de actualización:

```bash
# En Supabase SQL Editor, ejecuta:
# supabase/scripts/update_triggers_with_payment_info.sql
```

---

## ✅ Checklist Final

- [ ] Emails habilitados en `notification_preferences`
- [ ] Endpoint `/api/email/test-all` devuelve success
- [ ] Recibiste los 6 emails en tu bandeja
- [ ] Email de Nueva Orden muestra método de pago
- [ ] Email de Nueva Orden muestra estado
- [ ] Email de Transferencia tiene advertencia visual
- [ ] Email de Artista muestra todos los enlaces
- [ ] Email de Stock Bajo muestra nivel de urgencia
- [ ] Email de Orden Cancelada muestra motivo
- [ ] Email de Newsletter tiene código WELCOME15
- [ ] Logs en Supabase muestran todos como 'sent'
- [ ] No hay errores en `notification_logs`

---

## 🚀 Paso 8: Probar en Producción (Cuando esté listo)

### Antes de producción:

1. **Verificar dominio en Resend**
   - Ve a [resend.com/domains](https://resend.com/domains)
   - Agrega `busy.com.ar`
   - Configura DNS (SPF, DKIM)
   - Espera verificación

2. **Actualizar EMAIL_FROM**
   ```bash
   EMAIL_FROM="Busy Streetwear <no-reply@busy.com.ar>"
   ```

3. **Configurar EMAIL_BCC** (opcional)
   ```bash
   EMAIL_BCC="backup@busy.com.ar"
   ```

4. **Probar con orden real**
   - Crea una orden de prueba
   - Verifica que llegue el email
   - Revisa que todos los datos sean correctos

---

## 🐛 Troubleshooting

### Email no llega
1. Verifica `email_enabled = true` en DB
2. Revisa logs en Supabase
3. Verifica dashboard de Resend
4. Revisa carpeta de spam

### Email llega pero sin datos
1. Verifica que los triggers incluyan todos los campos
2. Ejecuta `update_triggers_with_payment_info.sql`
3. Crea una nueva orden para probar

### Error 403 en Resend
1. Verifica API key
2. Genera nueva API key
3. Verifica permisos de "Sending access"

---

## 📝 Notas Importantes

- **Cuenta gratuita de Resend:** 100 emails/día, 3,000/mes
- **Dominio de prueba:** `onboarding@resend.dev` (no requiere verificación)
- **Dominio propio:** Requiere verificación DNS
- **Logs:** Se guardan en `notification_logs` por 30 días
- **Preferencias:** Se pueden cambiar desde `/admin/notifications/preferences`

---

## ✅ ¡Todo Listo!

Si todos los checks están ✅, tu sistema de emails está **100% funcional** y listo para producción.

**Próximos pasos:**
1. Verificar dominio en Resend (producción)
2. Configurar alertas para emails fallidos
3. Monitorear métricas de entrega
4. Personalizar templates según feedback

---

**¿Algún problema?** Revisa `EMAIL_SYSTEM_DOCUMENTATION.md` para más detalles.
