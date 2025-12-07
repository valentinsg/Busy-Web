# Integración Envia.com - Busy Streetwear

## Variables de Entorno Requeridas

Agregar las siguientes variables a tu archivo `.env.local`:

```env
# ===== ENVIA.COM API =====
ENVIA_API_KEY=tu_api_key_de_envia
ENVIA_API_URL=https://api.envia.com

# ===== DIRECCIÓN DE ORIGEN (Showroom Busy) =====
ENVIA_ORIGIN_NAME=Busy Streetwear
ENVIA_ORIGIN_COMPANY=Busy Streetwear
ENVIA_ORIGIN_EMAIL=contacto@busystreetwear.com
ENVIA_ORIGIN_PHONE=2235000000
ENVIA_ORIGIN_ADDRESS=María Curie 5457
ENVIA_ORIGIN_NUMBER=
ENVIA_ORIGIN_DISTRICT=
ENVIA_ORIGIN_CITY=Mar del Plata
ENVIA_ORIGIN_STATE=Buenos Aires
ENVIA_ORIGIN_COUNTRY=AR
ENVIA_ORIGIN_POSTAL_CODE=7600

# ===== CONFIGURACIÓN OPCIONAL =====
# Desactivar generación automática de etiquetas (default: true)
# ENVIA_AUTO_LABEL=false
```

## Obtener API Key de Envia.com

1. Crear cuenta en [envia.com](https://envia.com)
2. Ir a **Configuración** > **API**
3. Generar una nueva API Key
4. Copiar la key y pegarla en `ENVIA_API_KEY`

## Migraciones SQL Requeridas

Ejecutar las siguientes migraciones en Supabase:

```bash
# 1. Agregar campos de shipping a orders
psql -f supabase/schema/orders_shipping.sql

# 2. Mejorar funciones de stock (atómicas)
psql -f supabase/schema/stock_atomic.sql
```

O desde el Dashboard de Supabase:
1. Ir a **SQL Editor**
2. Copiar y ejecutar el contenido de `supabase/schema/orders_shipping.sql`
3. Copiar y ejecutar el contenido de `supabase/schema/stock_atomic.sql`

## Endpoints Disponibles

### `POST /api/shipping/rates`
Obtiene tarifas de envío de Envia.com.

**Request:**
```json
{
  "destination": {
    "name": "Juan Pérez",
    "phone": "1155551234",
    "street": "Av. Corrientes 1234",
    "city": "Buenos Aires",
    "state": "Buenos Aires",
    "postalCode": "1043"
  },
  "items": [{ "product_id": "xxx", "quantity": 1 }],
  "totalValue": 50000,
  "itemCount": 1
}
```

**Response:**
```json
{
  "success": true,
  "options": [
    {
      "carrier": "andreani",
      "service": "standard",
      "serviceName": "Andreani Estándar",
      "price": 3500,
      "currency": "ARS",
      "estimatedDelivery": "3-5 días hábiles"
    }
  ],
  "source": "envia"
}
```

### `POST /api/shipping/label`
Genera etiqueta de envío.

**Request:**
```json
{
  "order_id": "uuid-de-la-orden",
  "carrier": "andreani",
  "service": "standard"
}
```

**Response:**
```json
{
  "success": true,
  "label_url": "https://...",
  "tracking_number": "ABC123456",
  "carrier": "andreani",
  "shipment_id": "ENV123"
}
```

### `GET /api/shipping/tracking?order_id=xxx`
Obtiene información de tracking.

### `POST /api/shipping/tracking`
Actualiza manualmente el estado de envío.

## Flujo Automático

1. **Cliente completa checkout** → Se guarda `shipping_address` en la orden
2. **Pago aprobado (MP webhook)** → Se genera etiqueta automáticamente
3. **Transferencia confirmada (admin)** → Se genera etiqueta automáticamente
4. **Admin puede**:
   - Ver tracking en detalle de orden
   - Descargar etiqueta PDF
   - Actualizar estado manualmente
   - Refrescar tracking desde Envia

## Fallback sin Envia

Si `ENVIA_API_KEY` no está configurado:
- `/api/shipping/rates` retorna tarifa flat rate de `shop_settings`
- La generación de etiquetas se omite
- El sistema sigue funcionando con envío manual

## Archivos Creados/Modificados

### Nuevos:
- `lib/envia/client.ts` - Cliente API de Envia
- `lib/envia/index.ts` - Exports
- `lib/shipping/auto-label.ts` - Generación automática
- `lib/shipping/index.ts` - Exports
- `app/api/shipping/rates/route.ts` - Endpoint tarifas
- `app/api/shipping/label/route.ts` - Endpoint etiquetas
- `app/api/shipping/tracking/route.ts` - Endpoint tracking
- `supabase/schema/orders_shipping.sql` - Migración campos
- `supabase/schema/stock_atomic.sql` - Funciones mejoradas

### Modificados:
- `types/commerce.ts` - Tipos Order con campos shipping
- `types/index.ts` - Exports nuevos tipos
- `app/api/mp/webhook/route.ts` - Guarda dirección + auto-label
- `app/api/orders/transfer/route.ts` - Guarda dirección
- `app/api/admin/orders/confirm/route.ts` - Auto-label en confirmación
- `app/admin/orders/[id]/page.tsx` - UI de shipping en admin

## Testing

1. **Sin Envia configurado:**
   - Verificar que checkout funciona con flat rate
   - Verificar que órdenes se crean correctamente

2. **Con Envia configurado:**
   - Crear orden de prueba
   - Verificar que se genera etiqueta automáticamente
   - Verificar tracking en admin
   - Descargar PDF de etiqueta

## Sistema de Pesos de Productos (PASO 3)

### Migración SQL
```bash
psql -f supabase/schema/products_weight.sql
```

### Pesos por Defecto (en gramos)
| Categoría | Peso |
|-----------|------|
| remera/remeras | 220g |
| hoodie/buzo | 750g |
| pantalon/jogger | 500g |
| gorra | 200g |
| accesorio | 50g |
| default | 300g |

### Flujo de Cálculo de Peso

```
1. Usuario agrega productos al carrito
2. En checkout, se llama a /api/shipping/rates
3. El endpoint:
   a. Busca los productos en la DB
   b. Para cada producto:
      - Si tiene weight explícito → usa ese valor
      - Si no → usa peso por defecto según categoría
   c. Suma todos los pesos × cantidad
   d. Envía el peso total a Envia.com
4. Envia retorna tarifas basadas en peso real
```

### Archivos del Sistema de Pesos

| Archivo | Función |
|---------|---------|
| `supabase/schema/products_weight.sql` | Migración SQL |
| `lib/shipping/weights.ts` | Helpers de peso |
| `types/product.ts` | Tipo Product con weight |
| `lib/repo/products.ts` | Mapeo de weight desde DB |
| `app/admin/products/[id]/page.tsx` | Campo editable en admin |
| `app/api/shipping/rates/route.ts` | Cálculo de peso para tarifas |
| `lib/shipping/auto-label.ts` | Cálculo de peso para etiquetas |

### Admin: Editar Peso de Producto

1. Ir a `/admin/products/[id]`
2. Buscar el campo **"Peso (gramos)"**
3. Ingresar el peso en gramos (ej: 220 para una remera)
4. Si se deja vacío, se usa el peso por defecto según categoría
5. Guardar cambios

### Validaciones

- El peso debe ser un número entero positivo
- Si es 0 o vacío, se usa el peso por defecto
- El peso se muestra en el admin con indicador visual:
  - ✓ Peso configurado: XXXg
  - ⚠️ Sin peso → se usará XXXg (categoría)

## Notas Importantes

- **Mar del Plata**: Sigue teniendo tarifa especial de $10.000 (hardcoded)
- **Envío gratis**: Se respeta el umbral de `shop_settings`
- **Peso mínimo**: 100g (Envia no acepta menos)
- **Peso máximo por paquete**: Depende del carrier
