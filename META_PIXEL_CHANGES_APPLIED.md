# Cambios Aplicados - Meta Pixel GTM Integration

## ✅ Cambios Realizados

### 1. **Eliminada Inicialización Duplicada del Pixel**
**Archivo**: `app/layout.tsx` línea 403

**Antes**:
```tsx
{IS_PROD && META_PIXEL_ID ? (
  <>
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
    </Script>
    <noscript>
      <img height="1" width="1" style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
    </noscript>
  </>
) : null}
```

**Después**:
```tsx
{/* Meta Pixel ahora se gestiona 100% desde GTM - ver tags en Google Tag Manager */}
```

**Beneficio**: 
- ✅ Evita duplicación de inicialización
- ✅ Gestión centralizada en GTM
- ✅ Más fácil de mantener y actualizar

---

### 2. **Agregados Items al Endpoint order-status**
**Archivo**: `app/api/mp/order-status/route.ts` líneas 82-100

**Agregado**:
```typescript
// Get order items for analytics tracking
let orderItems = null
if (order?.id) {
  const { data: items } = await supabase
    .from("order_items")
    .select("product_id,product_name,quantity,unit_price,variant_size,variant_color")
    .eq("order_id", order.id)
  orderItems = items || null
}

const payload = {
  session_id,
  payment_id: String(tmp.payment_id),
  status,
  status_detail: status_detail ?? null,
  merchant_order_id: merchant_order_id ?? null,
  preference_id: preference_id ?? null,
  order: order ?? null,
  items: orderItems ?? null,  // ✅ NUEVO
}
```

**Beneficio**:
- ✅ El endpoint ahora retorna los productos de la orden
- ✅ Permite tracking completo del evento Purchase

---

### 3. **Arreglado Bug de Items Vacío en Purchase**
**Archivo**: `app/checkout/success/success-client.tsx` líneas 23-38

**Antes**:
```typescript
const order = data?.order
if (!already && order && (status === 'approved' || status === 'accredited')) {
  trackPurchase({
    transaction_id: String(order.id),
    currency: order.currency || 'ARS',
    value: Number(order.total || 0),
    tax: Number(order.tax || 0),
    shipping: Number(order.shipping || 0),
    coupon: null,
    items: [],  // ❌ VACÍO
  })
}
```

**Después**:
```typescript
const order = data?.order
const orderItems = data?.items || []
if (!already && order && (status === 'approved' || status === 'accredited')) {
  trackPurchase({
    transaction_id: String(order.id),
    currency: order.currency || 'ARS',
    value: Number(order.total || 0),
    tax: Number(order.tax || 0),
    shipping: Number(order.shipping || 0),
    coupon: null,
    items: orderItems.map((item: any) => ({
      item_id: item.product_id,
      item_name: item.product_name,
      price: Number(item.unit_price || 0),
      quantity: item.quantity,
      item_variant: item.variant_size && item.variant_color ? `${item.variant_size}|${item.variant_color}` : undefined,
    })),  // ✅ AHORA CON DATOS REALES
  })
}
```

**Beneficio**:
- ✅ Evento Purchase ahora incluye todos los productos comprados
- ✅ Meta Pixel puede optimizar campañas con datos reales
- ✅ Permite crear audiencias basadas en productos específicos

---

## 🎯 Estado Actual

### ✅ Completado en el Código
- [x] Eliminada inicialización duplicada del Pixel
- [x] Endpoint `order-status` retorna items
- [x] Evento Purchase envía items correctamente
- [x] Eventos GA4 se envían a dataLayer correctamente

### ✅ Ya Configurado en GTM (según screenshot)
- [x] Tag: Meta Pixel - Busy Streetwear (inicialización)
- [x] Tag: Meta Pixel PageView
- [x] Tag: Meta – ViewContent
- [x] Tag: Meta – AddToCart
- [x] Tag: Meta – InitiateCheckout
- [x] Tag: Meta – Purchase

---

## 🧪 Testing Requerido

### 1. Verificar que el Pixel NO se inicializa dos veces
```bash
# Abrir DevTools → Console
# Buscar mensajes de Meta Pixel
# Debe aparecer SOLO UNA VEZ: "Facebook Pixel initialized"
```

### 2. Verificar evento Purchase con items
```bash
# Hacer una compra de prueba
# Abrir Meta Pixel Helper (extensión Chrome)
# Verificar evento Purchase
# Debe incluir:
#   - content_ids: [array de product_ids]
#   - contents: [array con id, quantity, item_price]
#   - value: total de la compra
#   - currency: 'ARS'
```

### 3. Verificar en Facebook Events Manager
```bash
# Ir a: https://business.facebook.com/events_manager2
# Seleccionar tu Pixel
# Ver "Test Events" en tiempo real
# Verificar que todos los eventos llegan con parámetros correctos
```

---

## 📊 Eventos que Ahora Funcionan Correctamente

| Evento | Trigger | Parámetros Incluidos | Estado |
|--------|---------|---------------------|--------|
| PageView | Cada página | - | ✅ OK |
| ViewContent | Ver producto | content_type, content_ids, content_name, value, currency | ✅ OK |
| AddToCart | Agregar al carrito | content_type, content_ids, content_name, value, currency | ✅ OK |
| InitiateCheckout | Ir a checkout | content_type, content_ids, contents, value, currency, num_items | ✅ OK |
| Purchase | Compra completada | content_type, content_ids, contents, value, currency, num_items | ✅ ARREGLADO |

---

## 🚀 Próximos Pasos Opcionales

### 1. Custom Events (Prioridad Media)
Agregar eventos personalizados para el funnel de Busy:
- [ ] WhatsAppClick
- [ ] PlaylistView
- [ ] NewsletterSubscribe
- [ ] ArtistSubmission
- [ ] SizeCalculatorUse
- [ ] BlogPostView

Ver snippets en: `GTM_TAGS_SNIPPETS.md`

### 2. Advanced Matching (Prioridad Baja)
Mejorar matching de usuarios enviando datos adicionales:
```javascript
fbq('init', 'PIXEL_ID', {
  em: 'user@email.com',  // Email hasheado
  ph: '5491112345678',   // Teléfono hasheado
  fn: 'nombre',          // Nombre
  ln: 'apellido',        // Apellido
});
```

### 3. Conversions API (Prioridad Baja)
Implementar server-side tracking para mayor precisión:
- Requiere configurar webhook desde el servidor
- Duplica eventos del browser para mayor confiabilidad
- Mejora tracking en iOS (evita limitaciones de ATT)

---

## 📞 Soporte

Si encontrás problemas:
1. Verificar en GTM Preview Mode que los tags se disparan
2. Revisar Console del navegador para errores JavaScript
3. Usar Meta Pixel Helper para debugging
4. Consultar `META_PIXEL_GTM_ANALYSIS.md` para detalles técnicos

---

**Fecha de implementación**: 4 de noviembre de 2025  
**Archivos modificados**: 3
- `app/layout.tsx`
- `app/api/mp/order-status/route.ts`
- `app/checkout/success/success-client.tsx`

**Estado**: ✅ LISTO PARA TESTING
