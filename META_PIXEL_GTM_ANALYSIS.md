# Análisis de Implementación Meta Pixel en GTM - Busy Streetwear

## 📊 Resumen Ejecutivo

**Estado General**: ⚠️ **IMPLEMENTACIÓN PARCIAL CON MEJORAS NECESARIAS**

La implementación actual del Meta Pixel está **dividida entre código directo y GTM**, lo que puede causar duplicación de eventos y falta de parámetros críticos para optimización de campañas.

---

## 🔍 Hallazgos Principales

### 1. **Inicialización del Pixel**

#### ✅ Implementación Actual (Código Directo)
**Ubicación**: `app/layout.tsx` líneas 403-417

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

**Variable de entorno**: `NEXT_PUBLIC_META_PIXEL_ID`

**Problema**: El script se carga directamente en el código, NO a través de GTM. Esto significa:
- ✅ El Pixel se inicializa correctamente UNA SOLA VEZ
- ⚠️ **NO está gestionado por GTM** (no aparece en el contenedor de GTM)
- ⚠️ Dificulta la gestión centralizada de tags

---

### 2. **Evento PageView**

#### ✅ Implementación Actual
**Ubicación**: `components/analytics/route-tracker.tsx` líneas 10-24

```tsx
function trackPageview(url: string, opts?: { skipFbq?: boolean }) {
  if (typeof window === "undefined") return
  if ((window as any).gtag && GA_ID) {
    ;(window as any).gtag("config", GA_ID, { page_path: url })
  }
  if (!opts?.skipFbq && (window as any).fbq && META_PIXEL_ID) {
    ;(window as any).fbq("track", "PageView")
  }
  if ((window as any).dataLayer) {
    ;(window as any).dataLayer.push({ event: "pageview", page_path: url })
  }
}
```

**Trigger**: Cada cambio de ruta (SPA navigation)

**Problema**: 
- ✅ Se dispara correctamente en navegación SPA
- ⚠️ **Duplicación potencial**: PageView se dispara en `layout.tsx` (línea 410) Y en `route-tracker.tsx`
- ⚠️ El primer PageView se salta con `skipFbq` pero puede haber confusión

---

### 3. **Evento ViewContent (view_item)**

#### ⚠️ Implementación Actual
**Ubicación**: `components/shop/product-detail.tsx` líneas 68-89

```tsx
React.useEffect(() => {
  try {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      ;(window as any).dataLayer.push({
        event: "view_item",
        ecommerce: {
          currency: product.currency || "ARS",
          value: Number((product.price).toFixed(2)),
          items: [
            {
              item_id: product.id,
              item_name: product.name,
              item_category: product.category,
              price: product.price,
              quantity: 1,
            },
          ],
        },
      })
    }
  } catch {}
}, [product.id, product.name, product.category, product.price, product.currency])
```

**Problemas**:
- ❌ **Evento incorrecto**: Se envía `view_item` (GA4) en lugar de `ViewContent` (Meta Pixel)
- ❌ **Falta conversión a Meta Pixel**: No hay tag en GTM que convierta `view_item` → `fbq('track', 'ViewContent', {...})`
- ❌ **Faltan parámetros Meta Pixel**:
  - `content_type`: 'product'
  - `content_ids`: [product.id]
  - `content_name`: product.name
  - `value`: product.price
  - `currency`: 'ARS'

---

### 4. **Evento AddToCart**

#### ⚠️ Implementación Actual
**Ubicación**: `components/shop/add-to-cart.tsx` líneas 34-54

```tsx
try {
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    ;(window as any).dataLayer.push({
      event: "add_to_cart",
      ecommerce: {
        currency: product.currency || "ARS",
        value: Number((product.price * quantity).toFixed(2)),
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price,
            quantity,
            item_variant: `${selectedSize}|${selectedColor}`,
          },
        ],
      },
    })
  }
} catch {}
```

**Problemas**:
- ❌ **Falta conversión a Meta Pixel**: No hay tag en GTM que convierta `add_to_cart` → `fbq('track', 'AddToCart', {...})`
- ❌ **Faltan parámetros Meta Pixel**:
  - `content_type`: 'product'
  - `content_ids`: [product.id]
  - `content_name`: product.name
  - `value`: product.price * quantity
  - `currency`: 'ARS'

---

### 5. **Evento InitiateCheckout (begin_checkout)**

#### ⚠️ Implementación Actual
**Ubicación**: `app/checkout/page.tsx` líneas 80-97

```tsx
React.useEffect(() => {
  try {
    if (items.length > 0) {
      const currency = "ARS"
      const value = discountedSubtotal + estimatedShipping + estimatedTax
      const mapped = items.map((it) => ({
        item_id: it.product.id,
        item_name: it.product.name,
        item_category: it.product.category,
        price: it.product.price,
        quantity: it.quantity,
        item_variant: `${it.selectedSize}|${it.selectedColor}`,
      }))
      trackBeginCheckout({ currency, value, items: mapped })
    }
  } catch {}
}, [items, discountedSubtotal, estimatedShipping, estimatedTax])
```

**Función**: `lib/analytics/ecommerce.ts` líneas 18-24

```tsx
export function trackBeginCheckout(params: {
  currency: string
  value: number
  items: EcommerceItem[]
}) {
  pushEvent({ event: 'begin_checkout', ecommerce: params })
}
```

**Problemas**:
- ❌ **Falta conversión a Meta Pixel**: No hay tag en GTM que convierta `begin_checkout` → `fbq('track', 'InitiateCheckout', {...})`
- ❌ **Faltan parámetros Meta Pixel**:
  - `content_type`: 'product'
  - `content_ids`: array de IDs de productos
  - `contents`: array con id y quantity de cada producto
  - `value`: total del carrito
  - `currency`: 'ARS'
  - `num_items`: cantidad total de productos

---

### 6. **Evento Purchase**

#### ⚠️ Implementación Actual
**Ubicación**: `app/checkout/success/success-client.tsx` líneas 24-32

```tsx
trackPurchase({
  transaction_id: String(order.id),
  currency: order.currency || 'ARS',
  value: Number(order.total || 0),
  tax: Number(order.tax || 0),
  shipping: Number(order.shipping || 0),
  coupon: null,
  items: [],  // ❌ VACÍO
})
```

**Función**: `lib/analytics/ecommerce.ts` líneas 26-37

```tsx
export function trackPurchase(params: {
  transaction_id: string
  affiliation?: string | null
  currency: string
  value: number
  tax?: number | null
  shipping?: number | null
  coupon?: string | null
  items: EcommerceItem[]
}) {
  pushEvent({ event: 'purchase', ecommerce: params })
}
```

**Problemas**:
- ❌ **Items vacío**: `items: []` no envía información de productos comprados
- ❌ **Falta conversión a Meta Pixel**: No hay tag en GTM que convierta `purchase` → `fbq('track', 'Purchase', {...})`
- ❌ **Faltan parámetros Meta Pixel**:
  - `content_type`: 'product'
  - `content_ids`: array de IDs de productos comprados
  - `contents`: array con id, quantity y item_price de cada producto
  - `value`: total de la compra
  - `currency`: 'ARS'
  - `num_items`: cantidad total de productos

---

## 🎯 Configuración Recomendada en GTM

### Tag 1: Meta Pixel - Base Code (Inicialización)
**Tipo**: HTML Personalizado  
**Nombre**: Meta Pixel - Base Code  
**Trigger**: All Pages  
**Código**:
```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '{{Meta Pixel ID}}');
</script>
<noscript>
<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id={{Meta Pixel ID}}&ev=PageView&noscript=1"/>
</noscript>
```

**Variable necesaria**: `{{Meta Pixel ID}}` (Variable de constante con tu Pixel ID)

---

### Tag 2: Meta Pixel - PageView
**Tipo**: HTML Personalizado  
**Nombre**: Meta – PageView  
**Trigger**: Custom Event = `pageview`  
**Código**:
```html
<script>
fbq('track', 'PageView');
</script>
```

---

### Tag 3: Meta Pixel - ViewContent
**Tipo**: HTML Personalizado  
**Nombre**: Meta – ViewContent  
**Trigger**: Custom Event = `view_item`  
**Código**:
```html
<script>
fbq('track', 'ViewContent', {
  content_type: 'product',
  content_ids: [{{DLV - Product ID}}],
  content_name: {{DLV - Product Name}},
  value: {{DLV - Product Price}},
  currency: 'ARS'
});
</script>
```

**Variables necesarias**:
- `{{DLV - Product ID}}` → `ecommerce.items.0.item_id`
- `{{DLV - Product Name}}` → `ecommerce.items.0.item_name`
- `{{DLV - Product Price}}` → `ecommerce.value`

---

### Tag 4: Meta Pixel - AddToCart
**Tipo**: HTML Personalizado  
**Nombre**: Meta – AddToCart  
**Trigger**: Custom Event = `add_to_cart`  
**Código**:
```html
<script>
fbq('track', 'AddToCart', {
  content_type: 'product',
  content_ids: [{{DLV - Product ID}}],
  content_name: {{DLV - Product Name}},
  value: {{DLV - Cart Value}},
  currency: 'ARS'
});
</script>
```

**Variables necesarias**:
- `{{DLV - Product ID}}` → `ecommerce.items.0.item_id`
- `{{DLV - Product Name}}` → `ecommerce.items.0.item_name`
- `{{DLV - Cart Value}}` → `ecommerce.value`

---

### Tag 5: Meta Pixel - InitiateCheckout
**Tipo**: HTML Personalizado  
**Nombre**: Meta – InitiateCheckout  
**Trigger**: Custom Event = `begin_checkout`  
**Código**:
```html
<script>
var items = {{DLV - Ecommerce Items}} || [];
var contentIds = items.map(function(item) { return item.item_id; });
var contents = items.map(function(item) { 
  return {
    id: item.item_id,
    quantity: item.quantity
  };
});

fbq('track', 'InitiateCheckout', {
  content_type: 'product',
  content_ids: contentIds,
  contents: contents,
  value: {{DLV - Checkout Value}},
  currency: 'ARS',
  num_items: items.length
});
</script>
```

**Variables necesarias**:
- `{{DLV - Ecommerce Items}}` → `ecommerce.items`
- `{{DLV - Checkout Value}}` → `ecommerce.value`

---

### Tag 6: Meta Pixel - Purchase
**Tipo**: HTML Personalizado  
**Nombre**: Meta – Purchase  
**Trigger**: Custom Event = `purchase`  
**Código**:
```html
<script>
var items = {{DLV - Ecommerce Items}} || [];
var contentIds = items.map(function(item) { return item.item_id; });
var contents = items.map(function(item) { 
  return {
    id: item.item_id,
    quantity: item.quantity,
    item_price: item.price
  };
});

fbq('track', 'Purchase', {
  content_type: 'product',
  content_ids: contentIds,
  contents: contents,
  value: {{DLV - Purchase Value}},
  currency: 'ARS',
  num_items: items.length
});
</script>
```

**Variables necesarias**:
- `{{DLV - Ecommerce Items}}` → `ecommerce.items`
- `{{DLV - Purchase Value}}` → `ecommerce.value`

---

## 🔧 Variables de Capa de Datos (Data Layer Variables)

Crear las siguientes variables en GTM:

| Nombre Variable | Tipo | Ruta de Capa de Datos |
|----------------|------|----------------------|
| DLV - Product ID | Data Layer Variable | `ecommerce.items.0.item_id` |
| DLV - Product Name | Data Layer Variable | `ecommerce.items.0.item_name` |
| DLV - Product Price | Data Layer Variable | `ecommerce.value` |
| DLV - Cart Value | Data Layer Variable | `ecommerce.value` |
| DLV - Checkout Value | Data Layer Variable | `ecommerce.value` |
| DLV - Purchase Value | Data Layer Variable | `ecommerce.value` |
| DLV - Ecommerce Items | Data Layer Variable | `ecommerce.items` |
| Meta Pixel ID | Constant | (Tu Pixel ID) |

---

## 🚨 Problemas Identificados

### 1. **Duplicación de Inicialización**
- ❌ El Pixel se inicializa en `layout.tsx` (código directo)
- ❌ Si se agrega en GTM, se inicializaría DOS VECES
- ✅ **Solución**: Eliminar inicialización de `layout.tsx` y moverla a GTM

### 2. **Duplicación de PageView**
- ❌ PageView se dispara en `layout.tsx` (línea 410)
- ❌ PageView se dispara en `route-tracker.tsx` (línea 16)
- ✅ **Solución**: Mantener solo en `route-tracker.tsx` con lógica `skipFbq`

### 3. **Eventos GA4 sin conversión a Meta Pixel**
- ❌ `view_item` no se convierte a `ViewContent`
- ❌ `add_to_cart` no se convierte a `AddToCart`
- ❌ `begin_checkout` no se convierte a `InitiateCheckout`
- ❌ `purchase` no se convierte a `Purchase`
- ✅ **Solución**: Crear tags en GTM que escuchen eventos GA4 y disparen eventos Meta Pixel

### 4. **Parámetros Faltantes**
- ❌ `content_type` no se envía en ningún evento
- ❌ `content_ids` no se envía en ningún evento
- ❌ `contents` no se envía en InitiateCheckout ni Purchase
- ❌ `num_items` no se envía
- ✅ **Solución**: Agregar parámetros en tags de GTM

### 5. **Items Vacío en Purchase**
- ❌ `items: []` en `success-client.tsx` línea 31
- ❌ No se envía información de productos comprados
- ✅ **Solución**: Recuperar items del pedido desde la API y enviarlos

---

## 🎨 Custom Events Recomendados para Busy Streetwear

### 1. **VideoView**
**Uso**: Cuando un usuario ve un video de producto o contenido cultural

```javascript
fbq('trackCustom', 'VideoView', {
  content_name: 'Busy Talks Ep. 1',
  content_category: 'Podcast',
  value: 0,
  currency: 'ARS'
});
```

**Implementar en**:
- Reproductor de YouTube embebido
- Videos de productos
- Contenido del blog con video

---

### 2. **WhatsAppClick**
**Uso**: Cuando un usuario hace clic en el botón de WhatsApp

```javascript
fbq('trackCustom', 'WhatsAppClick', {
  content_name: 'Contact Button',
  content_category: 'Customer Service',
  value: 0,
  currency: 'ARS'
});
```

**Implementar en**:
- Botón de contacto en footer
- Botón de WhatsApp flotante
- Links de WhatsApp en productos

---

### 3. **PlaylistView**
**Uso**: Cuando un usuario abre una playlist de Spotify

```javascript
fbq('trackCustom', 'PlaylistView', {
  content_name: playlist.name,
  content_category: 'Playlist',
  value: 0,
  currency: 'ARS'
});
```

**Implementar en**:
- `/playlists/[slug]` al cargar la página
- Click en "Abrir en Spotify"

---

### 4. **ArtistSubmission**
**Uso**: Cuando un artista envía su música para ser considerado

```javascript
fbq('trackCustom', 'ArtistSubmission', {
  content_name: 'Artist Submission Form',
  content_category: 'Lead Generation',
  value: 0,
  currency: 'ARS'
});
```

**Implementar en**:
- Formulario de propuestas de artistas
- Después de envío exitoso

---

### 5. **NewsletterSubscribe**
**Uso**: Cuando un usuario se suscribe al newsletter

```javascript
fbq('trackCustom', 'NewsletterSubscribe', {
  content_name: 'Newsletter Signup',
  content_category: 'Lead Generation',
  value: 0,
  currency: 'ARS'
});
```

**Implementar en**:
- Popover de newsletter
- Footer newsletter form

---

### 6. **SizeCalculatorUse**
**Uso**: Cuando un usuario usa la calculadora de talles

```javascript
fbq('trackCustom', 'SizeCalculatorUse', {
  content_name: 'Size Calculator',
  content_category: 'Product Discovery',
  value: 0,
  currency: 'ARS'
});
```

**Implementar en**:
- `/size-calculator` al completar el formulario

---

### 7. **BlogPostView**
**Uso**: Cuando un usuario lee un post del blog

```javascript
fbq('trackCustom', 'BlogPostView', {
  content_name: post.title,
  content_category: 'Blog',
  value: 0,
  currency: 'ARS'
});
```

**Implementar en**:
- `/blog/[slug]` al cargar la página

---

## 📋 Checklist de Implementación

### Fase 1: Limpieza (Prioridad Alta)
- [ ] Eliminar inicialización de Meta Pixel de `app/layout.tsx` líneas 403-417
- [ ] Mover inicialización a GTM (Tag: Meta Pixel - Base Code)
- [ ] Verificar que PageView no se duplique (mantener lógica `skipFbq`)
- [ ] Agregar items al evento Purchase en `success-client.tsx`

### Fase 2: Tags Estándar en GTM (Prioridad Alta)
- [ ] Crear variable `{{Meta Pixel ID}}` en GTM
- [ ] Crear Tag: Meta Pixel - Base Code (Trigger: All Pages)
- [ ] Crear Tag: Meta – PageView (Trigger: pageview)
- [ ] Crear Tag: Meta – ViewContent (Trigger: view_item)
- [ ] Crear Tag: Meta – AddToCart (Trigger: add_to_cart)
- [ ] Crear Tag: Meta – InitiateCheckout (Trigger: begin_checkout)
- [ ] Crear Tag: Meta – Purchase (Trigger: purchase)

### Fase 3: Variables de Capa de Datos (Prioridad Alta)
- [ ] Crear DLV - Product ID
- [ ] Crear DLV - Product Name
- [ ] Crear DLV - Product Price
- [ ] Crear DLV - Cart Value
- [ ] Crear DLV - Checkout Value
- [ ] Crear DLV - Purchase Value
- [ ] Crear DLV - Ecommerce Items

### Fase 4: Custom Events (Prioridad Media)
- [ ] Implementar VideoView
- [ ] Implementar WhatsAppClick
- [ ] Implementar PlaylistView
- [ ] Implementar ArtistSubmission
- [ ] Implementar NewsletterSubscribe
- [ ] Implementar SizeCalculatorUse
- [ ] Implementar BlogPostView

### Fase 5: Testing (Prioridad Alta)
- [ ] Instalar Meta Pixel Helper (extensión de Chrome)
- [ ] Verificar que Pixel se inicializa UNA SOLA VEZ
- [ ] Verificar PageView en cada cambio de ruta
- [ ] Verificar ViewContent al ver producto
- [ ] Verificar AddToCart al agregar producto
- [ ] Verificar InitiateCheckout al ir a checkout
- [ ] Verificar Purchase al completar compra
- [ ] Verificar que todos los parámetros se envían correctamente
- [ ] Verificar en Facebook Events Manager que eventos llegan

### Fase 6: Optimización (Prioridad Baja)
- [ ] Configurar Conversions API (CAPI) para server-side tracking
- [ ] Crear audiencias personalizadas en Facebook Ads Manager
- [ ] Configurar eventos de conversión en Facebook Ads
- [ ] Implementar Advanced Matching (email, phone, nombre)

---

## 🎯 Beneficios Esperados

### 1. **Tracking Completo**
- ✅ Todos los eventos de ecommerce rastreados correctamente
- ✅ Parámetros completos para optimización de campañas
- ✅ Sin duplicación de eventos

### 2. **Optimización de Campañas**
- ✅ Facebook puede optimizar para conversiones reales
- ✅ Audiencias más precisas (Lookalike Audiences)
- ✅ Retargeting efectivo (Dynamic Ads)

### 3. **Insights de Funnel**
- ✅ Ver dónde los usuarios abandonan el funnel
- ✅ Identificar productos con alta intención de compra
- ✅ Medir ROI de campañas de Facebook/Instagram

### 4. **Custom Events para Busy**
- ✅ Rastrear engagement con contenido cultural (playlists, blog, videos)
- ✅ Medir interés en artistas emergentes
- ✅ Optimizar para leads (newsletter, artistas)

---

## 📚 Recursos Adicionales

- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [Meta Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
- [Facebook Events Manager](https://business.facebook.com/events_manager2)
- [GTM Meta Pixel Setup Guide](https://www.analyticsmania.com/post/facebook-pixel-via-google-tag-manager/)
- [Meta Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)

---

## 🚀 Próximos Pasos

1. **Revisar este documento** con el equipo de marketing
2. **Priorizar implementación** según impacto en campañas actuales
3. **Asignar responsables** para cada fase del checklist
4. **Establecer timeline** (recomendado: 2-3 semanas)
5. **Coordinar con Facebook Ads Manager** para configurar conversiones
6. **Testing exhaustivo** antes de lanzar campañas
7. **Monitoreo continuo** en Events Manager

---

**Fecha de análisis**: 4 de noviembre de 2025  
**Analista**: Cascade AI  
**Proyecto**: Busy Streetwear - Meta Pixel GTM Implementation
