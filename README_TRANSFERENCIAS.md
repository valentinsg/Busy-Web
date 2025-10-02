# Sistema de Pago con Transferencia Bancaria

## 📋 Resumen

Se implementó un sistema completo de pago con transferencia bancaria como alternativa a Mercado Pago, con las siguientes características:

### ✅ Características Implementadas

1. **Dos métodos de pago en checkout:**
   - 💳 **Tarjeta (Mercado Pago)**: Con impuesto online del 10%
   - 🏦 **Transferencia bancaria**: SIN impuesto online (10% de ahorro)

2. **Cálculo de totales diferenciado:**
   - Transferencia: Subtotal + Envío (sin impuesto)
   - Tarjeta: Subtotal + Envío + Impuesto 10%

3. **Flujo de transferencia:**
   - Cliente completa datos en checkout
   - Selecciona "Transferencia bancaria"
   - Se crea orden con estado "pending"
   - Redirige a página con datos bancarios
   - Cliente transfiere y envía comprobante
   - Admin verifica y confirma pedido

## 🗂️ Archivos Creados/Modificados

### Nuevos Archivos

#### Frontend
1. **`components/checkout/pay-with-transfer.tsx`**
   - Componente para confirmar pedido con transferencia
   - Valida datos del cliente
   - Crea orden pendiente vía API

2. **`app/order/transfer/page.tsx`**
   - Página de confirmación post-pedido
   - Muestra datos bancarios para transferir
   - Botones para enviar comprobante (WhatsApp/Email)
   - Instrucciones claras para el cliente

3. **`app/admin/orders/pending/page.tsx`**
   - Panel de administración para órdenes pendientes
   - Vista de todas las transferencias por confirmar
   - Botones para confirmar/rechazar
   - Modal con detalles completos

#### Backend (API)
4. **`app/api/orders/transfer/route.ts`**
   - API endpoint para crear órdenes de transferencia
   - Calcula totales SIN impuesto online
   - Crea orden con estado "pending"
   - Maneja clientes nuevos y existentes

5. **`app/api/admin/orders/pending/route.ts`**
   - API para listar órdenes pendientes
   - Incluye datos de cliente y productos

6. **`app/api/admin/orders/confirm/route.ts`**
   - API para confirmar pago de transferencia
   - Cambia estado de "pending" a "paid"

7. **`app/api/admin/orders/reject/route.ts`**
   - API para rechazar/cancelar orden
   - Restaura stock automáticamente

#### Base de Datos
8. **`supabase/schema/orders_payment_method.sql`**
   - Migración para agregar campo `payment_method`
   - Valores: 'card', 'transfer', 'cash', 'other'

9. **`supabase/schema/functions_stock.sql`**
   - Función SQL para incrementar stock
   - Usada al cancelar órdenes

### Archivos Modificados

1. **`app/checkout/page.tsx`**
   - Radio buttons para elegir método de pago
   - Cálculo condicional de impuesto (solo tarjeta)
   - Renderizado condicional de componentes de pago
   - UI mejorada con descripciones claras

2. **`components/admin/admin-sidebar-menu.tsx`**
   - Agregado enlace a "Transferencias pendientes"
   - Ubicado en sección "Ventas & Clientes"

## 🔧 Configuración Requerida

### 1. Ejecutar Migraciones de Base de Datos

Ejecutá estos archivos SQL en Supabase SQL Editor (en orden):

#### a) Agregar campo payment_method
```sql
-- Copiar y pegar contenido de: supabase/schema/orders_payment_method.sql
```

#### b) Crear función para restaurar stock
```sql
-- Copiar y pegar contenido de: supabase/schema/functions_stock.sql
```

O via CLI:
```bash
psql -h <host> -U <user> -d <database> -f supabase/schema/orders_payment_method.sql
psql -h <host> -U <user> -d <database> -f supabase/schema/functions_stock.sql
```

### 2. Actualizar Datos Bancarios

Editar `app/order/transfer/page.tsx` línea 22-29:

```typescript
const bankData = {
  bank: "TU BANCO",
  accountType: "Cuenta Corriente/Caja de Ahorro",
  accountNumber: "XXXX-XXXX-X/X",
  cbu: "XXXXXXXXXXXXXXXXXXXXXXXX",
  alias: "TU.ALIAS.CVU",
  holder: "NOMBRE TITULAR",
  cuit: "XX-XXXXXXXX-X",
}
```

### 3. Actualizar Contacto para Comprobantes

Editar `app/order/transfer/page.tsx` línea 176-177:

```typescript
// WhatsApp
href={`https://wa.me/54XXXXXXXXXX?text=...`}

// Email
href="mailto:TU-EMAIL@ejemplo.com?subject=Comprobante de transferencia"
```

## 📊 Flujo de Usuario

### Opción 1: Pago con Tarjeta (Mercado Pago)
```
Checkout → Selecciona "Tarjeta" → 
Total incluye impuesto 10% → 
Click "Pagar con Mercado Pago" → 
Redirige a MP → Paga → 
Orden confirmada automáticamente
```

### Opción 2: Pago con Transferencia
```
Checkout → Selecciona "Transferencia" → 
Total SIN impuesto (10% menos) → 
Click "Confirmar pedido" → 
Página con datos bancarios → 
Cliente transfiere → 
Envía comprobante → 
Admin verifica → 
Confirma orden manualmente
```

## 🔐 Gestión de Órdenes Pendientes

### Panel de Administración

Accedé al panel de admin para gestionar transferencias pendientes:

**URL:** `/admin/orders/pending`

**Funcionalidades:**
- ✅ Ver todas las órdenes pendientes de transferencia
- ✅ Ver detalles completos (cliente, productos, totales)
- ✅ Confirmar pago (cambia estado a "paid")
- ✅ Rechazar orden (cancela y restaura stock)
- ✅ Actualización en tiempo real
- ✅ Indicador de tiempo transcurrido

### Confirmar Transferencia (Manual)

Si preferís hacerlo por SQL:

```sql
-- Actualizar estado a 'paid' después de verificar
UPDATE orders
SET 
  status = 'paid',
  updated_at = NOW()
WHERE id = 'ORDER_ID_AQUI';
```

### Ver Órdenes Pendientes (SQL)

```sql
SELECT 
  id,
  customer_id,
  total,
  status,
  payment_method,
  placed_at,
  notes
FROM orders
WHERE status = 'pending' 
  AND payment_method = 'transfer'
ORDER BY placed_at DESC;
```

## 💡 Ventajas del Sistema

### Para el Cliente
- ✅ Ahorro del 10% (sin impuesto online)
- ✅ Pago con transferencia bancaria familiar
- ✅ Instrucciones claras y datos copiables
- ✅ Múltiples canales para enviar comprobante

### Para el Negocio
- ✅ Evita comisiones de Mercado Pago en transferencias
- ✅ Mayor flexibilidad de pago
- ✅ Órdenes registradas desde el inicio
- ✅ Control manual de verificación

## 🚀 Próximos Pasos Recomendados

1. **Panel de Admin para Transferencias**
   - Vista de órdenes pendientes
   - Botón para confirmar/rechazar
   - Upload de comprobante

2. **Notificaciones Automáticas**
   - Email al cliente con datos bancarios
   - Email al admin cuando hay nueva orden
   - Recordatorio si no se recibe comprobante en 48hs

3. **Integración con WhatsApp Business API**
   - Envío automático de datos bancarios
   - Recepción de comprobantes
   - Confirmación automática

4. **Dashboard de Métricas**
   - % de clientes que eligen transferencia vs tarjeta
   - Tiempo promedio de confirmación
   - Tasa de abandono

## 📝 Notas Importantes

- Las órdenes de transferencia se crean con estado `pending`
- El stock se descuenta al crear la orden (considera implementar reserva temporal)
- Los datos bancarios están hardcodeados (considera moverlos a settings)
- No hay email automático (el cliente debe guardar/copiar los datos)

## 🐛 Troubleshooting

### Error: "payment_method column doesn't exist"
**Solución:** Ejecutar la migración SQL en `supabase/schema/orders_payment_method.sql`

### Las órdenes no se crean
**Solución:** Verificar logs en `/api/orders/transfer` y permisos de Supabase

### El impuesto se sigue cobrando en transferencias
**Solución:** Verificar que `paymentMethod === "transfer"` en el cálculo de `estimatedTax`

---

**Desarrollado para Busy Streetwear** 🛍️
