# Feature: Identificación y Filtrado de Transferencias en Lista de Pedidos

## 🎯 Objetivo

Permitir identificar y filtrar fácilmente los pedidos realizados por transferencia bancaria, especialmente aquellos que están pendientes de confirmación, directamente desde la lista principal de pedidos.

## ✨ Características Implementadas

### 1. **Filtro de Método de Pago**

Se agregó un nuevo dropdown de filtro que permite:

- **Todos los métodos**: Ver todos los pedidos sin filtrar
- **Transferencias pendientes**: Vista rápida de transferencias que esperan confirmación (⭐ MÁS USADO)
- **Transferencia**: Todas las transferencias (pendientes y confirmadas)
- **Tarjeta**: Pagos con tarjeta (MercadoPago)
- **Efectivo**: Pagos en efectivo
- **Otro**: Otros métodos de pago

### 2. **Badges Visuales para Transferencias**

#### Transferencia Pendiente
- **Badge amarillo con animación pulse**
- Icono de reloj (Clock)
- Texto: "Transferencia pendiente"
- Se muestra solo cuando: `status = 'pending'` AND `payment_method = 'transfer'`

#### Transferencia Completada
- **Badge azul**
- Icono de billete (Banknote)
- Texto: "Transferencia"
- Se muestra cuando: `status = 'paid'` AND `payment_method = 'transfer'`

### 3. **Estadísticas Mejoradas**

La card de "Pendientes" ahora muestra:
- Número total de pedidos pendientes
- **Subtexto en amarillo**: Cantidad específica de transferencias pendientes
- Ejemplo: "3 transferencias" debajo del número principal

### 4. **Soporte en API y Base de Datos**

#### Campo en Base de Datos
```sql
payment_method text check (payment_method in ('card', 'transfer', 'cash', 'other'))
```

#### API Endpoint Actualizado
```
GET /api/admin/orders?payment_method=transfer&status=pending
```

## 📊 Flujo de Uso

### Caso 1: Ver solo transferencias pendientes
1. Ir a `/admin/orders`
2. Seleccionar "Transferencias pendientes" en el filtro de método de pago
3. Ver lista filtrada con badges amarillos pulsantes

### Caso 2: Ver todas las transferencias
1. Ir a `/admin/orders`
2. Seleccionar "Transferencia" en el filtro de método de pago
3. Ver todas las transferencias (pendientes y completadas)

### Caso 3: Identificar transferencias en vista general
1. Ir a `/admin/orders` sin filtros
2. Las transferencias pendientes se destacan con badge amarillo pulsante
3. Las transferencias completadas tienen badge azul

## 🎨 Diseño Visual

### Transferencia Pendiente
```
┌─────────────────────────────────────────┐
│ #A1B2C3D4  [Pendiente] [Web]           │
│            [⏰ Transferencia pendiente]  │ ← Amarillo + Pulse
│ 10/10/2025 15:30 • Hace 2 horas        │
└─────────────────────────────────────────┘
```

### Transferencia Completada
```
┌─────────────────────────────────────────┐
│ #E5F6G7H8  [Pagado] [Manual]           │
│            [💵 Transferencia]           │ ← Azul
│ 09/10/2025 10:15 • Hace 1 día          │
└─────────────────────────────────────────┘
```

## 🔧 Archivos Modificados

### 1. `app/admin/orders/page.tsx`
- Agregado estado `paymentFilter`
- Agregado filtro de método de pago en UI
- Agregados badges condicionales para transferencias
- Actualizada estadística de pendientes con contador de transferencias

### 2. `app/api/admin/orders/route.ts`
- Agregado parámetro `payment_method` en query
- Pasado a función `getOrders()`

### 3. `lib/repo/orders.ts`
- Agregado campo `payment_method` en tipo `OrderFilters`
- Agregado campo `payment_method` en query de Supabase
- Agregado filtro condicional para `payment_method`

### 4. Tipo `Order` en `page.tsx`
- Agregado campo opcional `payment_method?: string | null`

## 📈 Estadísticas

La card de "Pendientes" ahora muestra:

```typescript
{
  pendingCount: 15,           // Total de pendientes
  pendingTransfers: 8         // Solo transferencias pendientes
}
```

Visualización:
```
┌─────────────────────┐
│ PENDIENTES          │
│ 15                  │ ← Total
│ 8 transferencias    │ ← Subtexto en amarillo
│              ⏰     │
└─────────────────────┘
```

## 🎯 Beneficios

1. **Identificación rápida**: Las transferencias pendientes se destacan visualmente con animación
2. **Filtrado eficiente**: Un click para ver solo transferencias pendientes
3. **Contexto completo**: Se mantiene la vista general pero con información adicional
4. **Estadísticas claras**: Saber cuántas transferencias están pendientes de un vistazo
5. **Consistencia**: Los badges siguen el sistema de diseño existente

## 🔄 Integración con Página de Transferencias Pendientes

La página `/admin/orders/pending` sigue existiendo y funcionando independientemente. Ahora hay dos formas de acceder a transferencias pendientes:

1. **Página dedicada**: `/admin/orders/pending` (desde el menú)
   - Acciones: Confirmar/Rechazar
   - Vista especializada

2. **Lista general con filtro**: `/admin/orders` + filtro "Transferencias pendientes"
   - Vista integrada con todos los pedidos
   - Identificación visual rápida

## 🚀 Próximas Mejoras Sugeridas

- [ ] Agregar acciones rápidas (Confirmar/Rechazar) desde la lista principal
- [ ] Notificación visual cuando hay nuevas transferencias pendientes
- [ ] Ordenar transferencias pendientes al inicio de la lista
- [ ] Agregar tiempo transcurrido destacado para transferencias antiguas
- [ ] Filtro combinado: "Pendientes de cualquier tipo" vs "Solo transferencias pendientes"

## 📝 Notas Técnicas

- El campo `payment_method` debe estar poblado en la base de datos
- Si `payment_method` es `null`, no se mostrará ningún badge de pago
- La animación `pulse` es nativa de Tailwind CSS
- Los colores siguen la paleta de Busy (amarillo para pendiente, azul para info)
