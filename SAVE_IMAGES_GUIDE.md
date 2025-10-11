# 📸 Guía para Guardar las Imágenes de los Autores

## Imágenes que me pasaste

### Imagen 2: Agustín Molina (Chico de rojo)
- **Descripción**: Selfie con campera roja Adidas
- **Guardar como**: `public/authors/agustin-molina.jpg`

### Imagen 3: Valentín Sánchez Guevara (Chico con fondo blanco)
- **Descripción**: Foto profesional con fondo blanco, sonriendo
- **Guardar como**: `public/authors/valentin-sg.jpg`

## Pasos para guardar las imágenes

### Opción 1: Desde las imágenes que me pasaste

1. Abre las imágenes que me enviaste en la conversación
2. Haz click derecho en cada imagen
3. Selecciona "Guardar imagen como..."
4. Guárdalas en la carpeta `public/authors/` con los nombres exactos:
   - `agustin-molina.jpg`
   - `valentin-sg.jpg`

### Opción 2: Desde archivos locales

Si tienes las imágenes originales en tu computadora:

```bash
# Crea la carpeta si no existe
mkdir -p public/authors

# Copia las imágenes (ajusta las rutas según donde estén tus archivos)
# Ejemplo:
cp /ruta/a/imagen-agustin.jpg public/authors/agustin-molina.jpg
cp /ruta/a/imagen-valentin.jpg public/authors/valentin-sg.jpg
```

### Opción 3: Usando PowerShell (Windows)

```powershell
# Crea la carpeta si no existe
New-Item -ItemType Directory -Force -Path "public\authors"

# Copia las imágenes (ajusta las rutas)
Copy-Item "C:\ruta\a\imagen-agustin.jpg" -Destination "public\authors\agustin-molina.jpg"
Copy-Item "C:\ruta\a\imagen-valentin.jpg" -Destination "public\authors\valentin-sg.jpg"
```

## Verificación

Después de guardar las imágenes, verifica que estén en el lugar correcto:

```bash
# En Git Bash o terminal
ls -la public/authors/

# Deberías ver:
# agustin-molina.jpg
# valentin-sg.jpg
# README.md
```

O en PowerShell:
```powershell
Get-ChildItem public\authors\

# Deberías ver:
# agustin-molina.jpg
# valentin-sg.jpg
# README.md
```

## Optimización de imágenes (Opcional)

Si las imágenes son muy pesadas, puedes optimizarlas:

### Usando ImageMagick:
```bash
# Redimensionar a 400x400 y optimizar
magick public/authors/agustin-molina.jpg -resize 400x400^ -gravity center -extent 400x400 -quality 85 public/authors/agustin-molina-opt.jpg
magick public/authors/valentin-sg.jpg -resize 400x400^ -gravity center -extent 400x400 -quality 85 public/authors/valentin-sg-opt.jpg

# Reemplazar originales
mv public/authors/agustin-molina-opt.jpg public/authors/agustin-molina.jpg
mv public/authors/valentin-sg-opt.jpg public/authors/valentin-sg.jpg
```

### Usando herramientas online:
- [TinyPNG](https://tinypng.com/) - Compresión sin pérdida
- [Squoosh](https://squoosh.app/) - Optimización avanzada
- [ImageOptim](https://imageoptim.com/) - App para Mac

## Después de guardar las imágenes

Ejecuta el script de actualización:

```bash
npx tsx scripts/update-author-avatars.ts
```

Esto actualizará automáticamente el archivo `data/authors.json` con las rutas correctas.

## Nombres de archivo correctos

⚠️ **IMPORTANTE**: Los nombres deben ser exactamente:
- `agustin-molina.jpg` (todo en minúsculas, con guión)
- `valentin-sg.jpg` (todo en minúsculas, con guión)

❌ **NO uses**:
- `Agustin-Molina.jpg` (mayúsculas)
- `agustin_molina.jpg` (guión bajo)
- `agustin molina.jpg` (espacios)
- `agustin.jpg` (sin apellido)

## Troubleshooting

### Si las imágenes no aparecen:
1. Verifica que los nombres sean exactos (minúsculas, guiones)
2. Verifica que estén en `public/authors/` (no en `public/` o en otra carpeta)
3. Verifica que sean archivos `.jpg` válidos
4. Reinicia el servidor de desarrollo

### Si las imágenes son muy grandes:
- Redimensiona a 400x400px
- Comprime con calidad 85%
- Usa formato JPG (no PNG para fotos)

---

**Siguiente paso**: Después de guardar las imágenes, ve a `NEXT_STEPS.md` para continuar.
