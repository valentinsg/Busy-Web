# Estructura de Pedidos en Admin

## Organización del Menú

La sección de **Ventas** en el panel de administración ahora tiene la siguiente estructura jerárquica:

```
📊 VENTAS
  ├── 📈 Inteligencia comercial (/admin/analytics)
  ├── 🛒 Pedidos (collapsible)
  │   ├── 📋 Lista de pedidos (/admin/orders)
  │   ├── ⏰ Transferencias pendientes (/admin/orders/pending)
  │   └── 💰 Ventas manuales (/admin/sales/manual)
  └── 👥 Ranking de clientes (/admin/customers/ranking)
```

## Páginas y Funcionalidades

### 1. Lista de Pedidos (`/admin/orders`)
**Archivo:** `app/admin/orders/page.tsx`

Muestra todos los pedidos del sistema con las siguientes características:

- **Estadísticas rápidas:**
  - Ingresos totales (suma de pedidos mostrados)
  - Cantidad de pedidos pagados
  - Cantidad de pedidos pendientes
  - Valor promedio por pedido

- **Filtros:**
  - **Por estado:** Todos, Pendientes, Pagados, Cancelados
  - **Por canal:** Web, Manual, MercadoPago, Instagram, Mercado Libre, Feria, Marketplace, WhatsApp, Otro
  - **Por método de pago:** Todos, Transferencias pendientes, Transferencia, Tarjeta, Efectivo, Otro

- **Información mostrada:**
  - ID del pedido (primeros 8 caracteres)
  - Estado (con badge colorizado)
  - Canal de venta (Web, Manual, MercadoPago)
  - Indicador de trueque (si aplica)
  - **Badge de transferencia pendiente** (con animación pulse para resaltar)
  - Badge de transferencia completada
  - Fecha y hora del pedido
  - Total del pedido
  - Detalles expandibles:
    - Información del cliente
    - Lista de productos con variantes
    - Resumen de totales (subtotal, descuento, envío, impuestos)
    - Notas adicionales

- **Colores de estado:**
  - 🟡 Pendiente: borde amarillo
  - 🟢 Pagado: borde verde
  - 🔴 Cancelado: borde rojo

### 2. Transferencias Pendientes (`/admin/orders/pending`)
**Archivo:** `app/admin/orders/pending/page.tsx`

Vista especializada para gestionar pedidos pendientes de confirmación de pago:

- Muestra solo pedidos con estado "pending"
- Permite confirmar o rechazar pagos
- Información de método de pago extraída de las notas
- Acciones:
  - ✅ Confirmar: marca como pagado y suma a ingresos
  - ❌ Rechazar: cancela el pedido sin sumar a ingresos

### 3. Ventas Manuales (`/admin/sales/manual`)
**Archivo:** `app/admin/sales/manual/page.tsx`

Formulario para registrar ventas realizadas fuera del sistema web:

- Selección de canal (Instagram, Feria, WhatsApp, etc.)
- Búsqueda de productos con autocompletado
- Gestión de stock en tiempo real
- Cálculo automático de totales
- Soporte para trueques
- Campos de cliente opcionales

## API Endpoints

### GET `/api/admin/orders`
**Archivo:** `app/api/admin/orders/route.ts`

Obtiene la lista de todos los pedidos con filtros opcionales.

**Query Parameters:**
- `status` (opcional): Filtra por estado (pending, paid, cancelled)
- `channel` (opcional): Filtra por canal (web, manual, mercadopago, etc.)
- `payment_method` (opcional): Filtra por método de pago (transfer, card, cash, other)
- `customer_id` (opcional): Filtra por cliente específico
- `limit` (opcional): Número de resultados (default: 50)
- `offset` (opcional): Offset para paginación (default: 0)

**Response:**
```json
{
  "orders": [...],
  "total": 123,
  "limit": 50,
  "offset": 0
}
```

### GET `/api/admin/orders/pending`
**Archivo:** `app/api/admin/orders/pending/route.ts`

Obtiene solo los pedidos pendientes de confirmación.

### POST `/api/admin/orders/confirm`
Confirma un pedido pendiente y lo marca como pagado.

### POST `/api/admin/orders/reject`
Rechaza un pedido pendiente y lo marca como cancelado.

## Componentes del Sidebar

**Archivo:** `components/admin/admin-sidebar-menu.tsx`

El menú lateral ahora incluye:
- Sección "Pedidos" collapsible dentro de "Ventas"
- Iconos específicos para cada tipo de pedido:
  - `List`: Lista de pedidos
  - `Clock`: Transferencias pendientes
  - `HandCoins`: Ventas manuales
- Indicador visual de ruta activa

## Tipos de Datos

### Order Type
```typescript
type Order = {
  id: string
  customer_id: string | null
  total: number
  subtotal: number
  shipping: number
  discount: number
  tax: number
  placed_at: string
  status: string // 'pending' | 'paid' | 'cancelled'
  channel: string // 'web' | 'manual' | 'mercadopago' | etc.
  notes: string | null
  is_barter?: boolean
  customer?: {
    full_name: string | null
    email: string | null
    phone: string | null
  }
  items?: Array<{
    product_name: string
    quantity: number
    unit_price: number
    variant_size: string | null
    variant_color: string | null
  }>
}
```

## Repositorio de Funciones

**Archivo:** `lib/repo/orders.ts`

Funciones reutilizables para gestión de pedidos:

- `getOrders(filters)`: Obtiene pedidos con filtros opcionales
- `getOrderById(orderId)`: Obtiene un pedido específico con todos sus detalles
- `getPendingOrders()`: Obtiene solo pedidos pendientes
- `createManualOrder(input)`: Crea un pedido manual

**Tipos exportados:**
- `OrderWithDetails`: Pedido con información de cliente e items
- `OrderFilters`: Filtros disponibles para consultas
- `CreateManualOrderInput`: Input para crear pedidos manuales

## Características Técnicas

- **Cache Control:** Todos los endpoints tienen `force-dynamic` y headers de no-cache
- **Paginación:** Soporte para paginación en lista de pedidos
- **Filtros:** Filtrado por estado y canal en tiempo real
- **Estadísticas:** Cálculo automático de métricas desde los pedidos mostrados
- **Expansión:** Cards expandibles para ver detalles completos
- **Parsing inteligente:** Extrae información de cliente desde las notas
- **Responsive:** Diseño adaptable a móviles y tablets
- **Repositorio:** Funciones centralizadas para reutilización de código

## Flujo de Trabajo

1. **Pedido Web:** Cliente compra → Estado "pending" → Admin confirma pago → Estado "paid"
2. **Venta Manual:** Admin crea pedido → Automáticamente "paid" → Descuenta stock
3. **Transferencia:** Cliente paga por transferencia → Admin verifica → Confirma o rechaza

## Mejoras Futuras

- [ ] Paginación en frontend para lista de pedidos
- [ ] Exportar pedidos a CSV/Excel
- [ ] Filtros avanzados (por fecha, cliente, monto)
- [ ] Búsqueda de pedidos por ID o cliente
- [ ] Edición de pedidos existentes
- [ ] Historial de cambios de estado
- [ ] Notificaciones automáticas al cliente
