# 🚀 SEO Quick Start - Busy Streetwear

Guía rápida para validar y mantener el ecosistema SEO de Busy.

---

## ✅ Checklist de Implementación

### 1. Validar Schemas (5 min)

**Google Rich Results Test:**
```
https://search.google.com/test/rich-results
```

Páginas a validar:
- [ ] `https://busy.com.ar` - Brand, Organization, WebSite
- [ ] `https://busy.com.ar/about` - AboutPage, FAQPage
- [ ] `https://busy.com.ar/blog` - Blog listing
- [ ] `https://busy.com.ar/products` - Product listing

**Resultado esperado:** ✅ "Page is eligible for rich results"

---

### 2. Validar Open Graph (3 min)

**Facebook Debugger:**
```
https://developers.facebook.com/tools/debug/
```

Verificar:
- [ ] Imagen OG se muestra (1200x630)
- [ ] Título correcto
- [ ] Descripción completa
- [ ] URL canónica correcta

**Twitter Card Validator:**
```
https://cards-dev.twitter.com/validator
```

---

### 3. Crear Imagen OG (10 min)

**Especificaciones:**
- Tamaño: 1200x630px
- Formato: PNG o JPG
- Peso: < 300KB
- Ubicación: `/public/busy-og-image.png`

**Contenido sugerido:**
```
Fondo: Negro (#000000)
Logo: Busy blanco centrado
Tagline: "Cultura urbana y comunidad real"
Acento: Línea roja (#7a1f1f) decorativa
```

**Herramientas:**
- Figma: https://figma.com
- Canva: https://canva.com
- Photopea: https://photopea.com (gratis)

---

### 4. Google Search Console (15 min)

**Setup inicial:**

1. Ir a: https://search.google.com/search-console
2. Agregar propiedad: `https://busy.com.ar`
3. Verificar dominio (DNS o HTML tag)
4. Enviar sitemap: `https://busy.com.ar/sitemap.xml`

**Monitorear:**
- Cobertura de índice
- Rendimiento de búsqueda
- Experiencia de página
- Problemas de usabilidad móvil

---

### 5. Google My Business (20 min)

**Crear perfil:**

1. Ir a: https://business.google.com
2. Crear perfil para "Busy Streetwear"
3. Completar información:
   ```
   Nombre: Busy Streetwear
   Categoría: Tienda de ropa
   Dirección: María Curie 5457, Mar del Plata, Buenos Aires
   Teléfono: +54 9 22 3668 0041
   Sitio web: https://busy.com.ar
   Horario: Lun-Sáb 10:00-20:00
   ```
4. Subir fotos del showroom
5. Verificar ubicación (postal o teléfono)

**Resultado:** Knowledge Panel en Google

---

## 📊 Monitoreo Semanal

### Métricas Clave

**Google Search Console:**
- Impresiones totales
- Clics totales
- CTR promedio
- Posición promedio

**Google Analytics:**
- Tráfico orgánico
- Páginas más visitadas
- Tasa de rebote
- Tiempo en sitio

**Objetivos:**
- 📈 Incrementar impresiones 10% mensual
- 📈 Mejorar posición promedio
- 📈 Aumentar CTR orgánico

---

## 🎯 Keywords Objetivo

### Primarias (Alta Prioridad)
```
- "busy streetwear"
- "streetwear mar del plata"
- "ropa urbana argentina"
- "cultura urbana argentina"
```

### Secundarias (Media Prioridad)
```
- "tienda streetwear argentina"
- "hoodies oversize argentina"
- "remeras oversize"
- "marcas streetwear argentinas"
- "busy talks"
```

### Long-tail (Baja Prioridad)
```
- "qué significa ser busy"
- "historia busy streetwear"
- "fundadores busy streetwear"
- "showroom streetwear mar del plata"
- "podcast cultura urbana argentina"
```

---

## 📝 Contenido Mensual Recomendado

### Calendario Editorial

**Semana 1:** Artículo de cultura urbana
- Ejemplo: "Básquet y streetwear: la nueva cultura argentina"
- Longitud: 800-1200 palabras
- Imágenes: 3-5 fotos propias
- Schema: Article

**Semana 2:** Guía de estilo
- Ejemplo: "Cómo combinar hoodies oversize"
- Longitud: 600-800 palabras
- Imágenes: Lookbook propio
- Schema: HowTo

**Semana 3:** Entrevista o spotlight
- Ejemplo: "Artista del mes: [nombre]"
- Longitud: 500-700 palabras
- Imágenes: Fotos del artista
- Schema: Person

**Semana 4:** Update de marca
- Ejemplo: "Novedades Busy: nuevos drops y eventos"
- Longitud: 400-600 palabras
- Imágenes: Productos nuevos
- Schema: BlogPosting

---

## 🔧 Mantenimiento Técnico

### Mensual
- [ ] Verificar schemas en Rich Results Test
- [ ] Revisar enlaces rotos (Screaming Frog)
- [ ] Actualizar sitemap.xml
- [ ] Verificar velocidad de carga (PageSpeed Insights)
- [ ] Revisar errores en Search Console

### Trimestral
- [ ] Auditoría SEO completa
- [ ] Actualizar metadatos si es necesario
- [ ] Revisar competencia
- [ ] Analizar keywords nuevas
- [ ] Optimizar imágenes

### Anual
- [ ] Revisar y actualizar toda la documentación
- [ ] Evaluar nuevos rich snippets disponibles
- [ ] Actualizar roadmap en /about
- [ ] Planificar contenido del próximo año

---

## 🚨 Troubleshooting

### Schema no valida
**Problema:** Rich Results Test muestra errores

**Solución:**
1. Copiar JSON-LD del código fuente
2. Pegar en https://validator.schema.org/
3. Corregir errores señalados
4. Volver a validar

### Open Graph no funciona
**Problema:** Imagen no se muestra en redes sociales

**Solución:**
1. Verificar que `/busy-og-image.png` existe
2. Verificar tamaño: 1200x630px
3. Limpiar caché en Facebook Debugger
4. Esperar 24-48 horas para propagación

### Página no indexada
**Problema:** Página no aparece en Google

**Solución:**
1. Verificar en Search Console
2. Solicitar indexación manual
3. Verificar que no esté en robots.txt
4. Verificar que no tenga `noindex` tag
5. Esperar 1-2 semanas

### CTR bajo
**Problema:** Muchas impresiones, pocos clics

**Solución:**
1. Mejorar meta description
2. Agregar emojis al título (con moderación)
3. Incluir año actual en título
4. Agregar call-to-action en description
5. Implementar más rich snippets

---

## 📞 Recursos Útiles

### Herramientas Gratuitas
- **Google Search Console:** https://search.google.com/search-console
- **Google Analytics:** https://analytics.google.com
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **Schema Validator:** https://validator.schema.org/
- **Rich Results Test:** https://search.google.com/test/rich-results
- **Mobile-Friendly Test:** https://search.google.com/test/mobile-friendly

### Herramientas de Pago (Opcionales)
- **Ahrefs:** Análisis de keywords y backlinks
- **SEMrush:** Auditoría SEO completa
- **Screaming Frog:** Crawling y análisis técnico
- **Moz:** Seguimiento de rankings

### Documentación
- **Schema.org:** https://schema.org/
- **Google Search Central:** https://developers.google.com/search
- **MDN Web Docs:** https://developer.mozilla.org/

---

## 🎓 Aprendizaje Continuo

### Recursos Recomendados
- Google Search Central Blog
- Moz Blog
- Search Engine Journal
- Ahrefs Blog (español disponible)

### Comunidades
- r/SEO (Reddit)
- SEO en Español (Facebook)
- Google Search Central Community

---

## ✨ Tips Pro

1. **Consistencia > Perfección**
   - Mejor publicar 1 artículo semanal que 4 mensuales

2. **Contenido original siempre**
   - Google premia la originalidad
   - Evitar copiar de otras marcas

3. **Mobile-first**
   - 70%+ del tráfico es móvil
   - Probar siempre en celular

4. **Velocidad importa**
   - Optimizar imágenes (WebP)
   - Lazy loading
   - Minimizar JavaScript

5. **User intent**
   - Pensar qué busca el usuario
   - Responder preguntas reales
   - Evitar keyword stuffing

6. **Local SEO**
   - Aprovechar "Mar del Plata" en contenido
   - Google My Business actualizado
   - Reseñas de clientes

7. **Link building natural**
   - Colaboraciones con otras marcas
   - Menciones en medios locales
   - Guest posts en blogs de cultura

---

**Última actualización:** Noviembre 2024  
**Mantenido por:** Equipo Busy Streetwear

Para más información, consultar: `BUSY_SEO_ECOSYSTEM.md`
