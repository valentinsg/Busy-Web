# 🖼️ Especificaciones para Imagen OG - Busy Streetwear

**Archivo requerido:** `/public/busy-og-image.png`

---

## 📐 Especificaciones Técnicas

```yaml
Tamaño: 1200 x 630 píxeles
Formato: PNG o JPG
Peso máximo: 300 KB (recomendado < 200 KB)
Ratio: 1.91:1
Color mode: RGB
```

---

## 🎨 Diseño Recomendado

### Opción 1: Minimalista (Recomendada)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                    [Logo Busy Blanco]                   │
│                       (200x200px)                       │
│                                                         │
│              BUSY STREETWEAR                            │
│         Cultura urbana y comunidad real                 │
│                                                         │
│                                                         │
│  ─────────────────────────────────────────────────     │ ← Línea roja (#7a1f1f)
│                                                         │
└─────────────────────────────────────────────────────────┘

Fondo: Negro sólido (#000000)
Logo: Blanco, centrado, 200x200px
Título: "BUSY STREETWEAR" - Blanco, bold, 72px
Tagline: "Cultura urbana y comunidad real" - Gris claro (#d6d6d6), 36px
Acento: Línea horizontal roja (#7a1f1f), 4px grosor
```

---

### Opción 2: Con Textura

```
┌─────────────────────────────────────────────────────────┐
│  [Pattern sutil]                                        │
│                                                         │
│         [Logo Busy]        BUSY                         │
│         (150x150)          STREETWEAR                   │
│                                                         │
│                            Mar del Plata, Argentina     │
│                            Cultura · Moda · Comunidad   │
│                                                         │
│  ─────────────────────────────────────────────────────  │
└─────────────────────────────────────────────────────────┘

Fondo: Negro con pattern.png en opacity 0.1
Logo: Izquierda, 150x150px
Texto: Derecha, alineado a la izquierda
Pattern: /public/pattern.png con muy baja opacidad
```

---

### Opción 3: Fotográfica

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Foto de producto o showroom con overlay negro 60%]   │
│                                                         │
│                    BUSY STREETWEAR                      │
│              Cultura urbana desde Mar del Plata         │
│                                                         │
│                    [Logo pequeño]                       │
│                                                         │
└─────────────────────────────────────────────────────────┘

Fondo: Foto con overlay negro 60%
Texto: Blanco, centrado
Logo: Pequeño (80x80), abajo centro
```

---

## 🎨 Paleta de Colores

```css
/* Colores oficiales Busy */
Negro principal: #000000
Gris oscuro: #3b3b3b
Gris claro: #d6d6d6
Rojo oscuro (acento): #7a1f1f
Blanco: #ffffff
```

---

## 📝 Tipografías

**Opción 1: Usar fuentes del sitio**
- Heading: Space Grotesk (bold)
- Body: DM Sans (regular)

**Opción 2: Fuentes web-safe**
- Heading: Arial Black o Impact
- Body: Arial o Helvetica

**Opción 3: Fuentes Google (si usas Figma/Canva)**
- Heading: Montserrat Black
- Body: Inter Regular

---

## 🛠️ Herramientas Recomendadas

### Opción 1: Figma (Profesional)
```
1. Crear frame 1200x630
2. Fondo negro
3. Importar logo desde /public/logo-busy-white.png
4. Agregar textos con fuentes del sistema
5. Exportar como PNG
```

**Template Figma:**
- Crear cuenta gratis en figma.com
- Nuevo archivo → Frame → Custom 1200x630
- Diseñar según Opción 1
- Export → PNG → 2x quality

---

### Opción 2: Canva (Fácil)
```
1. Ir a canva.com
2. "Custom size" → 1200 x 630 px
3. Fondo negro
4. Subir logo-busy-white.png
5. Agregar textos
6. Descargar como PNG
```

**Plantilla Canva:**
- Buscar "Open Graph Image"
- Modificar con colores y logo de Busy
- Mantener diseño simple y legible

---

### Opción 3: Photopea (Gratis, sin registro)
```
1. Ir a photopea.com
2. File → New → 1200 x 630 px
3. Fondo negro (#000000)
4. Importar logo
5. Agregar textos con Text Tool
6. File → Export as → PNG
```

---

## ✅ Checklist de Calidad

Antes de guardar la imagen, verificar:

- [ ] Tamaño exacto: 1200 x 630 px
- [ ] Peso < 300 KB
- [ ] Formato PNG o JPG
- [ ] Logo visible y centrado
- [ ] Texto legible en móvil (probar en 400px width)
- [ ] Contraste suficiente (blanco sobre negro)
- [ ] Sin bordes o márgenes innecesarios
- [ ] Colores de marca correctos
- [ ] Sin errores de ortografía

---

## 📱 Testing

### Validar en diferentes plataformas:

**Facebook:**
```
1. Ir a: https://developers.facebook.com/tools/debug/
2. Pegar: https://busy.com.ar
3. Click "Scrape Again"
4. Verificar que imagen se muestra correctamente
```

**Twitter:**
```
1. Ir a: https://cards-dev.twitter.com/validator
2. Pegar: https://busy.com.ar
3. Verificar preview
```

**LinkedIn:**
```
1. Ir a: https://www.linkedin.com/post-inspector/
2. Pegar: https://busy.com.ar
3. Verificar preview
```

**WhatsApp:**
```
1. Enviar link https://busy.com.ar en chat de prueba
2. Verificar que preview se muestra
```

---

## 📂 Ubicación Final

Una vez creada la imagen:

```bash
# Guardar en:
/public/busy-og-image.png

# Verificar que existe:
https://busy.com.ar/busy-og-image.png
```

---

## 🎯 Ejemplos de Referencia

### Marcas similares con buen OG:
- Supreme: Logo centrado, fondo rojo
- Stüssy: Logo + tagline, fondo negro
- Palace: Minimalista, logo grande

### Principios de diseño:
1. **Menos es más** - No saturar con información
2. **Legibilidad** - Texto grande y claro
3. **Branding** - Logo siempre visible
4. **Contraste** - Blanco sobre negro funciona
5. **Coherencia** - Usar colores de marca

---

## 🚀 Variaciones Futuras

Considera crear variaciones para:

- `/busy-og-blog.png` - Para artículos del blog
- `/busy-og-products.png` - Para productos
- `/busy-og-about.png` - Para página About
- `/busy-og-events.png` - Para eventos futuros

Cada una con el mismo diseño base pero con texto específico.

---

## 💡 Tips Pro

1. **Safe zone:** Dejar 60px de margen en todos los lados
2. **Mobile preview:** Imagen se verá pequeña en móvil, usar texto grande
3. **Compresión:** Usar TinyPNG.com para reducir peso sin perder calidad
4. **Versiones:** Guardar .psd o .fig para futuras ediciones
5. **Consistencia:** Mantener mismo estilo en todas las variaciones

---

## 📊 Dimensiones por Plataforma

| Plataforma | Tamaño Óptimo | Ratio |
|------------|---------------|-------|
| Facebook | 1200 x 630 | 1.91:1 |
| Twitter | 1200 x 628 | 1.91:1 |
| LinkedIn | 1200 x 627 | 1.91:1 |
| WhatsApp | 1200 x 630 | 1.91:1 |
| Instagram | 1080 x 1080 | 1:1 |

**Conclusión:** 1200x630 funciona para todas las plataformas principales.

---

## ✨ Resultado Final Esperado

Cuando alguien comparta `https://busy.com.ar` en redes sociales, debería verse:

```
┌─────────────────────────────────────┐
│                                     │
│         [Imagen OG 1200x630]        │
│                                     │
│  BUSY STREETWEAR                    │
│  Cultura urbana y comunidad real    │
│                                     │
└─────────────────────────────────────┘
  Busy Streetwear | Cultura Urbana...
  Marca argentina de cultura urbana...
  busy.com.ar
```

---

**Tiempo estimado:** 15-30 minutos  
**Dificultad:** Fácil  
**Prioridad:** Alta

Una vez creada la imagen, validar en Facebook Debugger y Twitter Card Validator.
