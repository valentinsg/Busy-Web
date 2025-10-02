# 📦 Gestión de Stock - Busy Streetwear

## 🎯 Estrategia Implementada

### Sistema de Descuento Automático al Crear Orden

Hemos implementado la **mejor práctica de e-commerce**: descontar el stock automáticamente cuando se crea una orden, independientemente del método de pago.

## ✅ Cómo Funciona

### 1. **Cliente Completa el Checkout**
```
Cliente → Llena formulario → Elige método de pago → Confirma
```

### 2. **Se Crea la Orden**
- **Transferencia**: Estado `pending`
- **Mercado Pago**: Estado `pending` (hasta que se confirme el pago)

### 3. **Stock se Descuenta Automáticamente** 🔄
```sql
-- Se ejecuta automáticamente al crear la orden
UPDATE products SET stock = stock - quantity WHERE id = product_id;
UPDATE product_variants SET stock = stock - quantity WHERE product_id = product_id AND size = variant_size;
```

### 4. **Carrito se Limpia** 🧹
- El carrito del cliente se vacía automáticamente
- Esto evita confusiones y compras duplicadas

## 🔧 Gestión de Órdenes Pendientes

### Panel de Admin: `/admin/orders/pending`

#### ✅ Confirmar Orden (Pago Verificado)
```
Admin verifica transferencia → Click "Confirmar pago" → 
Orden cambia a estado "paid" → 
Stock ya está descontado ✓
```

#### ❌ Rechazar Orden (Pago No Recibido)
```
Admin rechaza orden → Click "Rechazar" → 
Orden cambia a estado "cancelled" → 
Stock se RESTAURA automáticamente ✓
```

**Función de Restauración:**
```sql
-- Se ejecuta automáticamente al rechazar
UPDATE products SET stock = stock + quantity WHERE id = product_id;
UPDATE product_variants SET stock = stock + quantity WHERE product_id = product_id AND size = variant_size;
```

## 💡 Ventajas de Este Sistema

### ✅ Previene Sobreventa
- Dos clientes NO pueden comprar el último producto disponible
- El stock refleja la realidad en tiempo real

### ✅ Automatizado
- No requiere intervención manual para descontar
- Solo necesitas confirmar/rechazar el pago

### ✅ Reversible
- Si rechazás una orden, el stock vuelve automáticamente
- No hay riesgo de perder stock

### ✅ Transparente
- Siempre sabés cuánto stock real tenés disponible
- El stock mostrado en la web es el stock real

## 📊 Flujos Completos

### Flujo Exitoso (Cliente Paga)
```
1. Cliente hace pedido → Stock: 10 → 9 ✓
2. Orden creada (pending)
3. Cliente transfiere
4. Admin confirma → Orden: paid ✓
5. Stock final: 9 ✓
```

### Flujo Cancelado (Cliente No Paga)
```
1. Cliente hace pedido → Stock: 10 → 9 ✓
2. Orden creada (pending)
3. Cliente NO transfiere
4. Admin rechaza → Orden: cancelled
5. Stock restaurado: 9 → 10 ✓
```

## 🚨 Casos Especiales

### ¿Qué pasa si un cliente pide más de lo disponible?
- El sistema valida el stock ANTES de crear la orden
- Si no hay stock suficiente, la orden no se crea

### ¿Puedo ajustar el stock manualmente?
- Sí, desde `/admin/stock`
- Los ajustes manuales se reflejan inmediatamente

### ¿Qué pasa si rechazo una orden por error?
- El stock se restaura automáticamente
- Podés crear una nueva orden manualmente desde `/admin/sales/manual`

## 📈 Métricas Importantes

### Monitorear en Admin
- **Órdenes Pendientes**: `/admin/orders/pending`
- **Stock Actual**: `/admin/stock`
- **Ventas**: `/admin/analytics`

### Alertas Recomendadas
- ⚠️ Revisar órdenes pendientes mayores a 48hs
- ⚠️ Productos con stock bajo (< 3 unidades)
- ⚠️ Órdenes sin comprobante después de 72hs

## 🔄 Proceso Recomendado

### Revisión Diaria
1. Entrar a `/admin/orders/pending`
2. Revisar WhatsApp/Email por comprobantes
3. Confirmar pagos verificados
4. Rechazar órdenes sin pago después de 48-72hs

### Revisión Semanal
1. Verificar stock en `/admin/stock`
2. Reponer productos con stock bajo
3. Analizar productos más vendidos

---

**Sistema implementado:** ✅ Completo y funcional
**Última actualización:** Octubre 2025
**Desarrollado para:** Busy Streetwear
