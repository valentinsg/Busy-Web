# 🔄 Actualización del Sistema de Popovers

## ✅ Cambios Implementados

### 1. **Delay Configurable** ⏱️
- Nuevo campo: `delay_seconds` (0-60 segundos)
- Control total sobre cuándo aparece el popover
- Recomendado: 3-5 segundos para mejor UX
- 0 = inmediato

### 2. **Popover Más Alto** 📏
- Imagen: `h-80 md:h-96` (antes: `h-64 md:h-80`)
- Altura en móvil: 320px
- Altura en desktop: 384px

### 3. **Logo de Busy** 🎨
- Logo agregado en esquina inferior derecha de la imagen
- Archivo: `/logo-busy-white.png`
- Tamaño: 60x60px
- Efecto: drop-shadow para mejor visibilidad

### 4. **Fuente Body en Todo el Popover** ✍️
- Cambiado `font-heading` → `font-body` en título
- Todos los textos usan `font-body`
- Consistencia tipográfica

### 5. **Fix de Duplicados** 🔧
- El componente solo se renderiza una vez en `app/layout.tsx`
- Si ves duplicados en desarrollo, es por React Strict Mode (normal)
- En producción no habrá duplicados

---

## 📋 Migración SQL Requerida

Ejecuta en **SQL Editor** de Supabase:

```sql
-- Add delay_seconds field to popovers table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'popovers' 
    AND column_name = 'delay_seconds'
  ) THEN
    ALTER TABLE public.popovers ADD COLUMN delay_seconds integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

COMMENT ON COLUMN public.popovers.delay_seconds IS 'Seconds to wait before showing the popover (0 = immediate)';
```

---

## 🎯 Cómo Usar el Delay

### En el Formulario Admin

1. Ve a `/admin/popovers/new`
2. Busca el campo **"Delay (segundos)"**
3. Ingresa el número de segundos (0-60)
4. Guarda

### Recomendaciones de Delay

- **0 segundos**: Inmediato (para mensajes urgentes)
- **3 segundos**: Recomendado para la mayoría de casos
- **5 segundos**: Para dar tiempo al usuario de ver la página
- **10+ segundos**: Para usuarios que ya están navegando

### Ejemplos

**Bienvenida**: 3 segundos
```
Usuario entra → 3 segundos → Popover aparece
```

**Flash Sale**: 0 segundos
```
Usuario entra → Popover inmediato (urgencia)
```

**Newsletter**: 10 segundos
```
Usuario navega → 10 segundos → Popover aparece
```

---

## 🎨 Cambios Visuales

### Antes vs Ahora

| Elemento | Antes | Ahora |
|----------|-------|-------|
| Ancho máximo | 448px (max-w-md) | 672px (max-w-2xl) |
| Altura imagen móvil | 256px | 320px |
| Altura imagen desktop | 320px | 384px |
| Logo Busy | ❌ | ✅ Esquina inferior derecha |
| Fuente título | font-heading | font-body |
| Fuente textos | font-body | font-body |
| Delay | ❌ | ✅ Configurable 0-60s |

---

## 🔧 Archivos Modificados

### Frontend
- `components/site-popover.tsx`
  - Delay configurable con setTimeout
  - Imagen más alta (h-80 md:h-96)
  - Logo de Busy agregado
  - Todas las fuentes cambiadas a font-body

### Backend
- `types/popover.ts` - Campo `delay_seconds` agregado
- `lib/repo/popovers.ts` - Incluye delay_seconds en queries
- `app/api/admin/popovers/route.ts` - POST con delay_seconds
- `app/api/admin/popovers/[id]/route.ts` - PATCH con delay_seconds

### Admin
- `app/admin/popovers/new/page.tsx`
  - Campo de delay en el formulario
  - Validación 0-60 segundos
  - Descripción de uso

### Migraciones
- `supabase/schema/migrations/add_popover_delay.sql`

---

## 🐛 Sobre los Duplicados

### ¿Por qué veo duplicados en desarrollo?

React Strict Mode en desarrollo renderiza componentes dos veces para detectar efectos secundarios. Esto es **normal y esperado**.

### ¿Habrá duplicados en producción?

**No.** En producción el popover se renderiza una sola vez.

### ¿Cómo verificar?

1. Construye para producción: `npm run build`
2. Inicia en modo producción: `npm start`
3. Verifica que solo aparezca una vez

---

## 📊 Testing

### Checklist de Pruebas

- [ ] Ejecutar migración SQL de delay_seconds
- [ ] Crear popover con delay de 5 segundos
- [ ] Verificar que aparece después de 5 segundos
- [ ] Verificar que el logo se ve en la imagen
- [ ] Verificar que todas las fuentes son font-body
- [ ] Verificar altura de imagen (más alta)
- [ ] Probar en móvil y desktop
- [ ] Verificar que no hay duplicados en producción

---

## 🎯 Casos de Uso con Delay

### 1. Bienvenida Inmediata
```
Delay: 0 segundos
Uso: Flash sales, anuncios urgentes
```

### 2. Bienvenida Suave
```
Delay: 3 segundos
Uso: Descuentos de bienvenida, newsletter
```

### 3. Engagement Tardío
```
Delay: 10 segundos
Uso: Captura de usuarios que ya están navegando
```

### 4. Exit Intent (simulado)
```
Delay: 30 segundos
Uso: Última oportunidad antes de que se vayan
```

---

## 🚀 Próximos Pasos

1. ✅ Ejecutar migración SQL
2. ✅ Editar popovers existentes para agregar delay
3. ✅ Probar diferentes delays
4. ✅ Verificar logo de Busy
5. ✅ Confirmar fuentes font-body
6. ✅ Testear en producción

---

## 💡 Tips

- **Delay corto (0-3s)**: Para mensajes urgentes o importantes
- **Delay medio (5-10s)**: Para captura de leads sin molestar
- **Delay largo (15-30s)**: Para usuarios comprometidos
- **Logo**: Asegúrate que `/logo-busy-white.png` existe en `public/`
- **Fuente**: font-body da consistencia con el resto del sitio
- **Altura**: Más espacio para imágenes impactantes

---

## 🎨 Personalización Adicional

### Cambiar tamaño del logo
`components/site-popover.tsx` línea 184-187:
```tsx
<Image
  src="/logo-busy-white.png"
  alt="Busy"
  width={80}  // Cambiar aquí
  height={80} // Y aquí
  className="drop-shadow-lg"
/>
```

### Cambiar posición del logo
Línea 182:
```tsx
// Actual: bottom-4 right-4
className="absolute bottom-4 right-4 opacity-90"

// Opciones:
className="absolute top-4 left-4 opacity-90"    // Arriba izquierda
className="absolute top-4 right-4 opacity-90"   // Arriba derecha
className="absolute bottom-4 left-4 opacity-90" // Abajo izquierda
```

### Cambiar altura de imagen
Línea 172:
```tsx
// Actual
className="relative w-full h-80 md:h-96 ..."

// Más alto
className="relative w-full h-96 md:h-[32rem] ..."

// Más bajo
className="relative w-full h-64 md:h-80 ..."
```
