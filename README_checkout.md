# Checkout con Mercado Pago (Checkout Pro)

Este módulo implementa el flujo completo con Next.js (App Router) + Supabase:

- Crear preferencia en backend y redirigir a Mercado Pago.
- Webhook idempotente y seguro.
- Actualización de orden y descuento de stock transaccional.
- Páginas de retorno (success/failure/pending).

## Variables de entorno

Configurar en `.env.local`:

```
MP_ACCESS_TOKEN=...         # Access Token de MP
BASE_URL=...                # https://dominio.com (o http://localhost:3000)
MP_WEBHOOK_SECRET_TOKEN=... # token para validar el webhook
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SITE_URL=...                # opcional, usado como fallback de BASE_URL
```

## Rutas

- `POST /api/mp/create-preference`
  - Body: `{ items: [{ product_id, quantity, variant_size? }], coupon_code?, shipping_cost? }`
  - Respuesta: `{ init_point, order_id }`.
- `POST /api/mp/webhook?token=...`
  - Recibe eventos de pago. Es idempotente.

## Esquema de BD

Se agregan/usan:
- `orders` con columnas `status (created|pending|paid|rejected|refunded|cancelled)`, `preference_id`, `payment_id`, `paid_at`, `currency='ARS'`.
- `order_items` (ya existente).
- `product_sizes` + función `decrement_product_stock(product_id, size, qty)`.
- `webhook_events` para idempotencia (unique payment_id + event_type).
- Función `process_order_paid(order_id, payment_id)` para procesar pago aprobado en transacción.

## Flujo

1. Frontend llama a `/api/mp/create-preference` con items del carrito.
2. Backend valida y recalcula precios, crea la orden (created), crea preferencia MP y guarda `preference_id`.
3. Usuario paga en MP. MP envía webhook `payment` a `/api/mp/webhook?token=...`.
4. Webhook obtiene el pago vía SDK, mapea estado y:
   - approved: llama `process_order_paid` (descuenta stock por talle y marca paid + `payment_id`).
   - rejected: `orders.status='rejected'`.
   - pending/in_process: `orders.status='pending'`.
5. Páginas `/checkout/success|failure|pending` muestran info básica desde query.

## Componentes UI

- `components/checkout/pay-with-mercadopago.tsx`
  - Props:
    - `items: { product_id: string; quantity: number; variant_size?: string | null }[]`
    - `couponCode?: string`
    - `shippingCost?: number`
  - Al hacer click, crea preferencia y redirige a `init_point`.

## Tests sugeridos

- Unit:
  - `calcOrderTotals` (descuentos, envío, totales).
  - mapeo de estado MP → interno.
  - validador de payload (cantidades > 0).
- Integración:
  - `POST /api/mp/create-preference` con carrito dummy.
  - Webhook `approved`: orden pasa a paid + stock decrementa.
  - Repetición del mismo evento (idempotente): sin efectos adicionales.
  - `rejected`: status rejected, stock intacto.

## Cómo correr

1. Instalar dependencias:
   - `npm i mercadopago` (o `pnpm add mercadopago`).
2. Asegurate de tener `.env.local` con las variables de entorno.
3. Aplicar SQL de `supabase/schema/` (si usás Supabase migrations, ejecutar los archivos nuevos):
   - `orders_mp_alter.sql`
   - `webhook_events.sql`
   - `functions_mp.sql`
4. Iniciar dev:
   - `npm run dev` (o `pnpm dev`).

## Notas

- Precios tratados en ARS. Si precisás conversión, agregar hook de FX.
- Cupón: validación básica (activo, no vencido, no excede usos). El descuento se aplica al subtotal. Puedes incrementar `used_count` al marcar la orden como pagada si lo querés.
- Envío: usar `shipping_cost` plano; integrar Andreani después.
- Notificaciones: agregar lógica en el webhook cuando `paid`.
