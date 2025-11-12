# Loading States y Skeletons - Blacktop

## 🎯 Objetivo

Implementar loaders y skeletons en todo el sistema de Blacktop para mejorar la UX durante las cargas y evitar que el usuario interactúe con elementos mientras se guardan datos.

## ✅ Implementaciones

### 1. **Loader al Seleccionar MVP** ✅

**Ubicación:** `live-scorekeeper-pro.tsx`

**Funcionamiento:**
```typescript
const [isSavingMatch, setIsSavingMatch] = useState(false);

const handleSelectMVP = async (playerId: number) => {
  setIsSavingMatch(true); // ✅ Activar loader
  setShowMVPModal(false);
  
  try {
    // Guardar score, finalizar, guardar stats
    await Promise.all([...]);
    
    setTimeout(() => {
      onClose();
      onSuccess();
    }, 1000);
  } catch (error) {
    // Manejar error
  }
};
```

**UI del Loader:**
```tsx
{isSavingMatch && (
  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-brand mb-4"></div>
    <p className="text-white text-xl font-heading">Guardando partido...</p>
    <p className="text-muted-foreground text-sm mt-2">Por favor espera</p>
  </div>
)}
```

**Características:**
- ✅ **Overlay completo** - Cubre toda la pantalla
- ✅ **Backdrop blur** - Efecto de desenfoque
- ✅ **z-50** - Sobre todo el contenido
- ✅ **Spinner animado** - Con colores del brand
- ✅ **Mensajes claros** - "Guardando partido..." + "Por favor espera"
- ✅ **No se puede interactuar** - Overlay bloquea clicks

### 2. **Skeleton para Fixture** ✅

**Archivo:** `components/admin/blacktop/fixture-skeleton.tsx`

**Componente:** `FixtureSkeleton`

```tsx
export function FixtureSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>

      {/* Groups Skeleton */}
      {[1, 2].map((group) => (
        <Card key={group}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((match) => (
              <div key={match} className="p-4 border rounded-lg">
                {/* Match skeleton structure */}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Uso:**
```tsx
// En tournament-fixture-v2.tsx
if (loading) {
  return <FixtureSkeleton />;
}
```

**Muestra:**
- ✅ Header con título y descripción
- ✅ Botones de acciones
- ✅ 2 grupos con 3 partidos cada uno
- ✅ Estructura similar al contenido real

### 3. **Skeleton para Standings** ✅

**Componente:** `StandingsSkeleton`

```tsx
export function StandingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((group) => (
        <Card key={group}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            {/* Table header */}
            <div className="flex gap-4 pb-2 border-b">
              <Skeleton className="h-4 w-12" /> {/* Pos */}
              <Skeleton className="h-4 w-32" /> {/* Equipo */}
              <Skeleton className="h-4 w-12" /> {/* PJ */}
              {/* ... más columnas */}
            </div>
            
            {/* Table rows */}
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="flex gap-4 py-3 border-b">
                {/* Row skeletons */}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Muestra:**
- ✅ 2 grupos
- ✅ Header de tabla con columnas
- ✅ 4 filas de equipos
- ✅ Estructura de tabla completa

### 4. **Skeleton para Lista de Torneos** ✅

**Archivo:** `components/admin/blacktop/tournament-list-skeleton.tsx`

```tsx
export function TournamentListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <Card key={item}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" /> {/* Nombre */}
                <Skeleton className="h-4 w-32" /> {/* Fecha */}
              </div>
              <Skeleton className="h-6 w-20" /> {/* Badge */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {/* Stats */}
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2 mt-4">
              {/* Buttons */}
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Muestra:**
- ✅ 3 tarjetas de torneos
- ✅ Nombre, fecha, badge de estado
- ✅ Estadísticas
- ✅ Botones de acción

## 🎨 Diseño de Skeletons

### Principios

1. **Estructura similar** - Mismo layout que el contenido real
2. **Animación pulse** - Efecto de carga suave
3. **Colores neutros** - Gris claro sobre fondo oscuro
4. **Cantidad realista** - Número similar de elementos

### Componente Base: Skeleton

```tsx
// components/ui/skeleton.tsx (shadcn/ui)
<Skeleton className="h-4 w-32" />
```

**Props comunes:**
- `h-4`, `h-6`, `h-8`, `h-10` - Altura
- `w-32`, `w-48`, `w-64`, `w-full` - Ancho
- `rounded-lg`, `rounded-full` - Bordes

## 📊 Estados de Carga

### Estado 1: Cargando Fixture
```
Usuario: [Entra a torneo]
Sistema: <FixtureSkeleton /> ⏳
Sistema: [Fetch datos]
Sistema: <Fixture real /> ✅
```

### Estado 2: Guardando Partido
```
Usuario: [Selecciona MVP]
Sistema: <Loader overlay> ⏳
Sistema: "Guardando partido..."
Sistema: [POST score, finish, stats]
Sistema: Cierra modal ✅
Sistema: Refresca fixture ✅
```

### Estado 3: Cargando Standings
```
Usuario: [Click tab Standings]
Sistema: <StandingsSkeleton /> ⏳
Sistema: [Calcula standings]
Sistema: <Standings real /> ✅
```

## 🔒 Protecciones Durante Carga

### 1. **Overlay Bloqueante**
```tsx
{isSavingMatch && (
  <div className="absolute inset-0 bg-black/80 z-50">
    {/* Usuario NO puede interactuar */}
  </div>
)}
```

### 2. **Deshabilitar Botones**
```tsx
<Button disabled={isSavingMatch}>
  Acción
</Button>
```

### 3. **Prevenir Cierre**
```tsx
<Dialog onOpenChange={(isOpen) => {
  if (isSavingMatch) return; // ❌ No permite cerrar
  onClose();
}}>
```

## 📝 Archivos Modificados

### 1. **live-scorekeeper-pro.tsx**
- Agregado estado `isSavingMatch`
- Agregado overlay de loading
- Activar loader en `handleSelectMVP`

### 2. **fixture-skeleton.tsx** (NUEVO)
- Componente `FixtureSkeleton`
- Componente `StandingsSkeleton`

### 3. **tournament-list-skeleton.tsx** (NUEVO)
- Componente `TournamentListSkeleton`

### 4. **tournament-fixture-v2.tsx**
- Importar `FixtureSkeleton`
- Usar skeleton en lugar de loader simple

## 🧪 Testing

### Test 1: Loader al Guardar
1. Finalizar partido
2. Seleccionar MVP
3. Verificar overlay aparece ✅
4. Verificar spinner animado ✅
5. Verificar mensaje "Guardando..." ✅
6. Verificar que NO se puede interactuar ✅
7. Esperar 1 segundo
8. Verificar que cierra automáticamente ✅

### Test 2: Skeleton Fixture
1. Entrar a torneo
2. Verificar skeleton aparece ✅
3. Verificar estructura similar ✅
4. Esperar carga
5. Verificar transición suave a contenido real ✅

### Test 3: Skeleton Standings
1. Click tab Standings
2. Verificar skeleton de tabla ✅
3. Verificar columnas y filas ✅
4. Esperar carga
5. Verificar datos reales ✅

## ✅ Beneficios

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Feedback visual** | Spinner simple | Skeleton estructurado ✅ |
| **UX durante guardado** | Puede interactuar | Bloqueado ✅ |
| **Claridad** | No se sabe qué carga | Estructura clara ✅ |
| **Profesionalismo** | Básico | Pulido ✅ |

## 🚀 Próximas Mejoras

- [ ] Skeleton para player stats
- [ ] Skeleton para team details
- [ ] Skeleton para analytics
- [ ] Loading states en forms
- [ ] Progress bar para operaciones largas
- [ ] Optimistic updates donde sea posible

## 📐 Guía de Uso

### Cuándo usar Skeleton
- ✅ Carga inicial de datos
- ✅ Cambio de tabs
- ✅ Filtros que recargan contenido
- ✅ Paginación

### Cuándo usar Loader/Spinner
- ✅ Guardando datos
- ✅ Procesando acciones
- ✅ Operaciones que bloquean UI
- ✅ Confirmaciones que tardan

### Cuándo usar Overlay
- ✅ Guardando partido
- ✅ Finalizando torneo
- ✅ Operaciones críticas
- ✅ Cuando NO se debe interrumpir
