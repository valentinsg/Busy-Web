# 🎯 Ejemplos de Uso - Sistema de Popovers

## 📋 Casos de Uso Comunes

### 1. 🎉 Bienvenida con Descuento (Email-Gate)

**Objetivo**: Capturar emails de nuevos visitantes ofreciendo descuento

**Configuración**:
- **Título**: "¡Bienvenido a Busy! 🎉"
- **Contenido**: "Obtén 15% OFF en tu primera compra. Ingresa tu email para desbloquear el código."
- **Imagen**: Banner con productos destacados
- **Tipo**: Email-Gate
- **Código de descuento**: `BIENVENIDA15`
- ✅ **Requiere email para ver código**
- **Prioridad**: 10
- **Rutas**: `/` (solo homepage)
- **Ventana**: Sin límite (siempre activo)

**Resultado**: El usuario ve el popover en la home, ingresa su email, y luego se revela el código.

---

### 2. 📧 Crecimiento de Newsletter

**Objetivo**: Aumentar suscriptores al newsletter

**Configuración**:
- **Título**: "No te pierdas nuestras ofertas exclusivas"
- **Contenido**: "Suscríbete a nuestro newsletter y recibe descuentos especiales cada semana"
- **Tipo**: Newsletter
- ✅ **Mostrar formulario de newsletter**
- **Prioridad**: 5
- **Rutas**: (vacío - todas las páginas)

**Resultado**: Formulario simple de suscripción sin código de descuento.

---

### 3. ⚡ Flash Sale Urgente

**Objetivo**: Crear urgencia para una venta relámpago

**Configuración**:
- **Título**: "⚡ FLASH SALE - Solo por 24 horas"
- **Contenido**: "50% OFF en productos seleccionados. ¡No te lo pierdas!"
- **Imagen**: Banner llamativo con reloj
- **Tipo**: Discount
- **Código de descuento**: `FLASH50`
- **Prioridad**: 100 (máxima - se muestra sobre otros)
- **Ventana**: 
  - Inicio: Hoy 00:00
  - Fin: Hoy 23:59
- **CTA Texto**: "Ver Productos en Oferta"
- **CTA URL**: `/products?sale=true`

**Resultado**: Código visible inmediatamente con botón para ir a productos en oferta.

---

### 4. 🆕 Lanzamiento de Colección

**Objetivo**: Promocionar nueva colección

**Configuración**:
- **Título**: "Nueva Colección Primavera 2025 🌸"
- **Contenido**: "Descubre los nuevos diseños exclusivos que acabamos de lanzar"
- **Imagen**: Foto hero de la colección
- **Tipo**: Custom
- **CTA Texto**: "Explorar Colección"
- **CTA URL**: `/products?collection=primavera-2025`
- **Prioridad**: 8
- **Ventana**: 
  - Inicio: 01/03/2025 00:00
  - Fin: 31/03/2025 23:59

**Resultado**: Popover grande con imagen impactante y botón directo a la colección.

---

### 5. 🎁 Envío Gratis por Categoría

**Objetivo**: Impulsar ventas en categoría específica

**Configuración**:
- **Título**: "Envío Gratis en Hoodies 🚚"
- **Contenido**: "Compra cualquier hoodie y el envío es completamente gratis"
- **Tipo**: Discount
- **Código de descuento**: `HOODIEFREE`
- **Prioridad**: 7
- **Rutas**: `/products/hoodies`
- **Secciones**: `products`

**Resultado**: Solo se muestra cuando el usuario visita la página de hoodies.

---

### 6. 💎 Programa de Lealtad (Email + Newsletter)

**Objetivo**: Capturar emails y suscribir al programa VIP

**Configuración**:
- **Título**: "Únete al Club VIP de Busy 💎"
- **Contenido**: "Accede a descuentos exclusivos, early access y envío gratis en todas tus compras"
- **Imagen**: Badge VIP o beneficios visuales
- **Tipo**: Custom
- **Código de descuento**: `VIP20`
- ✅ **Requiere email para ver código**
- ✅ **Mostrar formulario de newsletter**
- **CTA Texto**: "Ver Beneficios VIP"
- **CTA URL**: `/vip-club`
- **Prioridad**: 6

**Resultado**: Captura email, suscribe al newsletter, muestra código VIP y botón a página de beneficios.

---

### 7. 🎄 Campaña Estacional

**Objetivo**: Promoción de temporada (Navidad, Black Friday, etc.)

**Configuración**:
- **Título**: "🎄 Especial Navidad - Hasta 40% OFF"
- **Contenido**: "Encuentra el regalo perfecto con descuentos increíbles"
- **Imagen**: Banner navideño
- **Tipo**: Email-Gate
- **Código de descuento**: `NAVIDAD40`
- ✅ **Requiere email para ver código**
- **Prioridad**: 15
- **Ventana**: 
  - Inicio: 01/12/2025 00:00
  - Fin: 25/12/2025 23:59
- **CTA Texto**: "Ver Regalos"
- **CTA URL**: `/products?tag=regalos`

**Resultado**: Campaña limitada por tiempo con captura de email.

---

### 8. 📱 Descarga de App Móvil

**Objetivo**: Promocionar app móvil

**Configuración**:
- **Título**: "Descarga la App de Busy 📱"
- **Contenido**: "Compra más rápido y recibe notificaciones de ofertas exclusivas"
- **Imagen**: Screenshots de la app
- **Tipo**: Simple
- **CTA Texto**: "Descargar App"
- **CTA URL**: "https://apps.apple.com/..."
- **Prioridad**: 3
- **Rutas**: (vacío - todas las páginas)

**Resultado**: Popover informativo con link directo a la app store.

---

### 9. 🎓 Descuento para Estudiantes

**Objetivo**: Segmento específico con verificación

**Configuración**:
- **Título**: "Descuento Estudiante 🎓"
- **Contenido**: "Verifica tu email .edu y obtén 20% OFF permanente"
- **Tipo**: Email-Gate
- **Código de descuento**: `ESTUDIANTE20`
- ✅ **Requiere email para ver código**
- **Prioridad**: 4
- **Rutas**: `/estudiantes`

**Resultado**: Solo visible en página de estudiantes, requiere email (idealmente .edu).

---

### 10. 🔥 Carrito Abandonado (Simulado)

**Objetivo**: Recuperar ventas perdidas

**Configuración**:
- **Título**: "¡Espera! No te vayas sin tu descuento 🔥"
- **Contenido**: "Completa tu compra ahora y obtén 10% OFF adicional"
- **Tipo**: Discount
- **Código de descuento**: `VUELVE10`
- **Prioridad**: 12
- **Rutas**: `/cart`

**Resultado**: Se muestra solo en la página del carrito.

---

## 🎨 Tips de Diseño

### Imágenes Recomendadas
- **Tamaño**: 1200x800px (ratio 3:2)
- **Formato**: WebP o JPG optimizado
- **Peso**: Máximo 200KB
- **Contenido**: Productos, beneficios visuales, o diseño abstracto

### Textos Efectivos
- **Título**: Corto y directo (máx 50 caracteres)
- **Contenido**: Claro y conciso (máx 150 caracteres)
- **CTA**: Verbo de acción + beneficio ("Ver Ofertas", "Desbloquear Código")

### Timing
- **Flash Sales**: Ventanas cortas (24-48 horas)
- **Campañas**: 1-4 semanas
- **Permanentes**: Sin ventana de tiempo

### Prioridades Sugeridas
- **100**: Urgente (Flash sales, errores críticos)
- **50-99**: Alta (Campañas principales)
- **20-49**: Media (Promociones regulares)
- **1-19**: Baja (Anuncios generales)
- **0**: Muy baja (Información no urgente)

---

## 📊 Métricas a Seguir

Para cada popover, monitorea:
1. **Impresiones**: Cuántas veces se mostró
2. **Emails capturados**: Si usa email-gate o newsletter
3. **Códigos usados**: Conversión del código de descuento
4. **CTR del CTA**: Clicks en el botón personalizado
5. **Tasa de descarte**: Cuántos lo cierran sin interactuar

---

## 🚀 Mejores Prácticas

1. **No abuses**: Máximo 1 popover activo por página
2. **Segmenta bien**: Usa rutas/secciones para relevancia
3. **Testea**: Prueba diferentes mensajes y diseños
4. **Rota**: Cambia popovers cada 2-4 semanas
5. **Mide**: Usa los códigos únicos para trackear conversión
6. **Respeta**: Si el usuario cierra, no lo molestes (localStorage)
7. **Mobile-first**: Asegúrate que se vea bien en móvil
8. **Carga rápida**: Optimiza imágenes

---

## 🔄 Flujos Recomendados

### Flujo 1: Nuevo Visitante
1. **Primera visita**: Popover de bienvenida con email-gate
2. **Segunda visita**: Newsletter (si no se suscribió)
3. **Tercera visita**: Promoción específica por categoría

### Flujo 2: Cliente Recurrente
1. **Visita 1-3**: Promociones generales
2. **Visita 4+**: Programa VIP o beneficios de lealtad

### Flujo 3: Campaña Estacional
1. **Semana 1**: Anuncio de campaña (simple)
2. **Semana 2-3**: Email-gate con código
3. **Última semana**: Flash sale urgente (prioridad alta)
