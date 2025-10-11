# Componente LoadingSpinner

## 📦 Ubicación
`components/ui/loading-spinner.tsx`

## 🎯 Propósito
Componente reutilizable para mostrar estados de carga consistentes en toda la aplicación admin, reemplazando los textos básicos de "Verificando acceso..." por spinners animados profesionales.

## 🎨 Características

### Props Disponibles

```typescript
interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg"      // Tamaño del spinner
  text?: string                        // Texto principal (default: "Cargando...")
  subtext?: string                     // Texto secundario opcional
  fullScreen?: boolean                 // Ocupa toda la pantalla (default: false)
  className?: string                   // Clases adicionales
}
```

### Tamaños
- **sm**: `h-5 w-5` - Para espacios pequeños
- **default**: `h-8 w-8` - Tamaño estándar (recomendado)
- **lg**: `h-12 w-12` - Para pantallas completas o énfasis

### Modos de Visualización

#### 1. **Inline** (default)
```tsx
<LoadingSpinner text="Cargando productos..." />
```
- Padding vertical de `py-12`
- Centrado horizontal y vertical
- Ideal para secciones dentro de una página

#### 2. **Full Screen**
```tsx
<LoadingSpinner 
  fullScreen 
  text="Cargando..." 
  subtext="Verificando acceso" 
/>
```
- Ocupa toda la pantalla (`min-h-screen`)
- Fondo `bg-muted/30`
- Centrado absoluto
- Ideal para guards y páginas completas

## 🎨 Diseño Visual

### Estructura
```
┌─────────────────────────┐
│    [Spinner Animado]    │  ← RefreshCw con animate-spin
│                         │
│      Texto Principal    │  ← text-sm font-medium text-foreground
│      Texto Secundario   │  ← text-xs text-muted-foreground (opcional)
└─────────────────────────┘
```

### Colores
- **Spinner**: `text-primary` - Negro en tema claro
- **Texto principal**: `text-foreground` - Alto contraste
- **Texto secundario**: `text-muted-foreground` - Menor contraste

## 📍 Implementaciones Actuales

### 1. **AdminGuard** (`components/admin/admin-guard.tsx`)
```tsx
if (isChecking) {
  return <LoadingSpinner fullScreen text="Cargando..." subtext="Verificando acceso" />
}
```
**Antes**: Texto simple "Verificando acceso..."  
**Ahora**: Spinner animado con texto descriptivo

### 2. **Órdenes Pendientes** (`app/admin/orders/pending/page.tsx`)
```tsx
{loading ? (
  <LoadingSpinner text="Cargando órdenes..." />
) : orders.length === 0 ? (
  // Empty state
)}
```
**Antes**: Spinner inline con RefreshCw manual  
**Ahora**: Componente reutilizable consistente

## 🚀 Uso Recomendado

### Para Guards/Autenticación
```tsx
<LoadingSpinner 
  fullScreen 
  text="Cargando..." 
  subtext="Verificando permisos" 
/>
```

### Para Listas/Tablas
```tsx
<LoadingSpinner text="Cargando productos..." />
```

### Para Acciones Específicas
```tsx
<LoadingSpinner 
  size="sm" 
  text="Guardando..." 
  className="my-4"
/>
```

### Con Texto Personalizado
```tsx
<LoadingSpinner 
  text="Procesando pago..." 
  subtext="Esto puede tomar unos segundos"
/>
```

## ✅ Beneficios

1. **Consistencia**: Mismo estilo en toda la app
2. **Reutilizable**: Un componente para todos los casos
3. **Flexible**: Props para diferentes contextos
4. **Profesional**: Animación suave con Lucide icons
5. **Accesible**: Textos descriptivos claros
6. **Responsive**: Funciona en mobile y desktop

## 🎯 Próximos Pasos

Reemplazar otros estados de carga en:
- `/admin/products/*`
- `/admin/customers/*`
- `/admin/analytics/*`
- `/admin/blog/*`
- Cualquier página con `loading` state

## 📝 Notas Técnicas

- Usa `RefreshCw` de `lucide-react`
- Animación CSS nativa (`animate-spin`)
- Sin dependencias externas
- TypeScript estricto
- Compatible con Tailwind CSS
- Sigue el design system de Busy (primary, foreground, muted)
