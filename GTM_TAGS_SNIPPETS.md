# Snippets de Tags HTML para GTM - Meta Pixel

Este documento contiene los snippets listos para copiar y pegar en Google Tag Manager.

---

## 📋 Variables de GTM a Crear Primero

### 1. Variable de Constante: Meta Pixel ID
- **Nombre**: `Meta Pixel ID`
- **Tipo**: Constant
- **Valor**: Tu Pixel ID (ejemplo: `123456789012345`)

### 2. Variables de Capa de Datos (Data Layer Variables)

| Nombre | Tipo | Ruta |
|--------|------|------|
| `DLV - Product ID` | Data Layer Variable | `ecommerce.items.0.item_id` |
| `DLV - Product Name` | Data Layer Variable | `ecommerce.items.0.item_name` |
| `DLV - Ecommerce Value` | Data Layer Variable | `ecommerce.value` |
| `DLV - Ecommerce Items` | Data Layer Variable | `ecommerce.items` |

---

## 🏷️ TAG 1: Meta Pixel - Base Code

**Configuración**:
- **Tipo de tag**: HTML personalizado
- **Nombre**: `Meta Pixel - Base Code`
- **Activación**: All Pages (Todas las páginas)
- **Prioridad de activación**: 100 (para que se cargue primero)

**Código HTML**:
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

**Notas**:
- ⚠️ **NO incluye** `fbq('track', 'PageView')` porque se maneja por separado
- ✅ Solo inicializa el Pixel una vez

---

## 🏷️ TAG 2: Meta – PageView

**Configuración**:
- **Tipo de tag**: HTML personalizado
- **Nombre**: `Meta – PageView`
- **Activación**: Evento personalizado = `pageview`

**Código HTML**:
```html
<script>
if (typeof fbq !== 'undefined') {
  fbq('track', 'PageView');
}
</script>
```

**Notas**:
- ✅ Se dispara en cada cambio de ruta (SPA)
- ✅ Incluye validación de que `fbq` existe

---

## 🏷️ TAG 3: Meta – ViewContent

**Configuración**:
- **Tipo de tag**: HTML personalizado
- **Nombre**: `Meta – ViewContent`
- **Activación**: Evento personalizado = `view_item`

**Código HTML**:
```html
<script>
if (typeof fbq !== 'undefined') {
  var productId = {{DLV - Product ID}};
  var productName = {{DLV - Product Name}};
  var productPrice = {{DLV - Ecommerce Value}};
  
  if (productId && productName && productPrice) {
    fbq('track', 'ViewContent', {
      content_type: 'product',
      content_ids: [productId],
      content_name: productName,
      value: parseFloat(productPrice),
      currency: 'ARS'
    });
  }
}
</script>
```

**Notas**:
- ✅ Incluye validación de parámetros
- ✅ Convierte value a número con `parseFloat()`

---

## 🏷️ TAG 4: Meta – AddToCart

**Configuración**:
- **Tipo de tag**: HTML personalizado
- **Nombre**: `Meta – AddToCart`
- **Activación**: Evento personalizado = `add_to_cart`

**Código HTML**:
```html
<script>
if (typeof fbq !== 'undefined') {
  var productId = {{DLV - Product ID}};
  var productName = {{DLV - Product Name}};
  var cartValue = {{DLV - Ecommerce Value}};
  
  if (productId && productName && cartValue) {
    fbq('track', 'AddToCart', {
      content_type: 'product',
      content_ids: [productId],
      content_name: productName,
      value: parseFloat(cartValue),
      currency: 'ARS'
    });
  }
}
</script>
```

**Notas**:
- ✅ Captura el valor total del carrito (precio × cantidad)
- ✅ Incluye validación de parámetros

---

## 🏷️ TAG 5: Meta – InitiateCheckout

**Configuración**:
- **Tipo de tag**: HTML personalizado
- **Nombre**: `Meta – InitiateCheckout`
- **Activación**: Evento personalizado = `begin_checkout`

**Código HTML**:
```html
<script>
if (typeof fbq !== 'undefined') {
  var items = {{DLV - Ecommerce Items}} || [];
  var checkoutValue = {{DLV - Ecommerce Value}};
  
  if (items.length > 0 && checkoutValue) {
    var contentIds = items.map(function(item) { 
      return item.item_id; 
    });
    
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
      value: parseFloat(checkoutValue),
      currency: 'ARS',
      num_items: items.length
    });
  }
}
</script>
```

**Notas**:
- ✅ Mapea todos los productos del carrito
- ✅ Incluye `contents` con id y quantity de cada producto
- ✅ Cuenta total de items con `num_items`

---

## 🏷️ TAG 6: Meta – Purchase

**Configuración**:
- **Tipo de tag**: HTML personalizado
- **Nombre**: `Meta – Purchase`
- **Activación**: Evento personalizado = `purchase`

**Código HTML**:
```html
<script>
if (typeof fbq !== 'undefined') {
  var items = {{DLV - Ecommerce Items}} || [];
  var purchaseValue = {{DLV - Ecommerce Value}};
  
  if (purchaseValue) {
    var contentIds = [];
    var contents = [];
    
    if (items.length > 0) {
      contentIds = items.map(function(item) { 
        return item.item_id; 
      });
      
      contents = items.map(function(item) { 
        return {
          id: item.item_id,
          quantity: item.quantity,
          item_price: item.price
        };
      });
    }
    
    fbq('track', 'Purchase', {
      content_type: 'product',
      content_ids: contentIds,
      contents: contents,
      value: parseFloat(purchaseValue),
      currency: 'ARS',
      num_items: items.length
    });
  }
}
</script>
```

**Notas**:
- ✅ Funciona incluso si `items` está vacío (fallback)
- ✅ Incluye `item_price` en cada producto
- ⚠️ **IMPORTANTE**: Asegurarse de que el código envíe items en el evento purchase

---

## 🎨 CUSTOM EVENTS - Tags Adicionales

### TAG 7: Meta – WhatsAppClick

**Configuración**:
- **Tipo de tag**: HTML personalizado
- **Nombre**: `Meta – WhatsAppClick`
- **Activación**: Click en elemento con clase `.whatsapp-button` o link que contenga `wa.me`

**Código HTML**:
```html
<script>
if (typeof fbq !== 'undefined') {
  fbq('trackCustom', 'WhatsAppClick', {
    content_name: 'Contact Button',
    content_category: 'Customer Service',
    value: 0,
    currency: 'ARS'
  });
}
</script>
```

---

### TAG 8: Meta – PlaylistView

**Configuración**:
- **Tipo de tag**: HTML personalizado
- **Nombre**: `Meta – PlaylistView`
- **Activación**: Page View en URL que contenga `/playlists/`

**Código HTML**:
```html
<script>
if (typeof fbq !== 'undefined') {
  var playlistName = document.querySelector('h1')?.textContent || 'Unknown Playlist';
  
  fbq('trackCustom', 'PlaylistView', {
    content_name: playlistName,
    content_category: 'Playlist',
    value: 0,
    currency: 'ARS'
  });
}
</script>
```

---

### TAG 9: Meta – NewsletterSubscribe

**Configuración**:
- **Tipo de tag**: HTML personalizado
- **Nombre**: `Meta – NewsletterSubscribe`
- **Activación**: Evento personalizado = `newsletter_subscribe`

**Código HTML**:
```html
<script>
if (typeof fbq !== 'undefined') {
  fbq('trackCustom', 'NewsletterSubscribe', {
    content_name: 'Newsletter Signup',
    content_category: 'Lead Generation',
    value: 0,
    currency: 'ARS'
  });
}
</script>
```

**Nota**: Necesitas agregar este evento en el código:
```javascript
// En el componente de newsletter después de suscripción exitosa
if (typeof window !== 'undefined' && (window as any).dataLayer) {
  (window as any).dataLayer.push({ event: 'newsletter_subscribe' });
}
```

---

### TAG 10: Meta – ArtistSubmission

**Configuración**:
- **Tipo de tag**: HTML personalizado
- **Nombre**: `Meta – ArtistSubmission`
- **Activación**: Evento personalizado = `artist_submission`

**Código HTML**:
```html
<script>
if (typeof fbq !== 'undefined') {
  fbq('trackCustom', 'ArtistSubmission', {
    content_name: 'Artist Submission Form',
    content_category: 'Lead Generation',
    value: 0,
    currency: 'ARS'
  });
}
</script>
```

**Nota**: Necesitas agregar este evento en el código:
```javascript
// En el formulario de artistas después de envío exitoso
if (typeof window !== 'undefined' && (window as any).dataLayer) {
  (window as any).dataLayer.push({ event: 'artist_submission' });
}
```

---

## 🔧 Triggers (Activadores) a Crear

### 1. Evento Personalizado: pageview
- **Tipo**: Evento personalizado
- **Nombre del evento**: `pageview`

### 2. Evento Personalizado: view_item
- **Tipo**: Evento personalizado
- **Nombre del evento**: `view_item`

### 3. Evento Personalizado: add_to_cart
- **Tipo**: Evento personalizado
- **Nombre del evento**: `add_to_cart`

### 4. Evento Personalizado: begin_checkout
- **Tipo**: Evento personalizado
- **Nombre del evento**: `begin_checkout`

### 5. Evento Personalizado: purchase
- **Tipo**: Evento personalizado
- **Nombre del evento**: `purchase`

### 6. Evento Personalizado: newsletter_subscribe
- **Tipo**: Evento personalizado
- **Nombre del evento**: `newsletter_subscribe`

### 7. Evento Personalizado: artist_submission
- **Tipo**: Evento personalizado
- **Nombre del evento**: `artist_submission`

### 8. Click en WhatsApp
- **Tipo**: Clic - Todos los elementos
- **Condición**: Click URL contiene `wa.me` O Click Classes contiene `whatsapp`

### 9. Page View - Playlists
- **Tipo**: Vista de página
- **Condición**: Page Path contiene `/playlists/`

---

## ✅ Checklist de Implementación en GTM

### Paso 1: Variables
- [ ] Crear variable `Meta Pixel ID` (Constant)
- [ ] Crear variable `DLV - Product ID`
- [ ] Crear variable `DLV - Product Name`
- [ ] Crear variable `DLV - Ecommerce Value`
- [ ] Crear variable `DLV - Ecommerce Items`

### Paso 2: Triggers
- [ ] Crear trigger `All Pages`
- [ ] Crear trigger `pageview`
- [ ] Crear trigger `view_item`
- [ ] Crear trigger `add_to_cart`
- [ ] Crear trigger `begin_checkout`
- [ ] Crear trigger `purchase`

### Paso 3: Tags Estándar
- [ ] Crear tag `Meta Pixel - Base Code`
- [ ] Crear tag `Meta – PageView`
- [ ] Crear tag `Meta – ViewContent`
- [ ] Crear tag `Meta – AddToCart`
- [ ] Crear tag `Meta – InitiateCheckout`
- [ ] Crear tag `Meta – Purchase`

### Paso 4: Tags Custom (Opcional)
- [ ] Crear tag `Meta – WhatsAppClick`
- [ ] Crear tag `Meta – PlaylistView`
- [ ] Crear tag `Meta – NewsletterSubscribe`
- [ ] Crear tag `Meta – ArtistSubmission`

### Paso 5: Testing
- [ ] Activar modo Preview en GTM
- [ ] Probar cada evento en el sitio
- [ ] Verificar con Meta Pixel Helper
- [ ] Verificar en Facebook Events Manager
- [ ] Publicar contenedor de GTM

---

## 🧪 Testing con Meta Pixel Helper

1. **Instalar extensión**: [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)

2. **Verificar cada evento**:
   - ✅ Pixel se carga (ícono verde)
   - ✅ PageView se dispara en cada página
   - ✅ ViewContent al ver producto
   - ✅ AddToCart al agregar producto
   - ✅ InitiateCheckout al ir a checkout
   - ✅ Purchase al completar compra

3. **Verificar parámetros**:
   - ✅ `content_type: 'product'`
   - ✅ `content_ids: [...]`
   - ✅ `value: número`
   - ✅ `currency: 'ARS'`

4. **Verificar en Facebook Events Manager**:
   - Ir a: https://business.facebook.com/events_manager2
   - Seleccionar tu Pixel
   - Ver eventos en tiempo real en "Test Events"

---

## 📞 Soporte

Si tienes problemas con la implementación:
1. Verificar que las variables de GTM están correctamente configuradas
2. Revisar la consola del navegador para errores JavaScript
3. Usar el modo Preview de GTM para debugging
4. Consultar la documentación oficial de Meta Pixel

---

**Última actualización**: 4 de noviembre de 2025
