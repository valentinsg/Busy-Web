# Modal MVP - No Se Puede Cerrar

## 🔒 Problema Resuelto

**Antes:** El modal de selección de MVP tenía un botón X que permitía cerrarlo sin elegir MVP.

**Después:** El modal NO se puede cerrar hasta que se elija un MVP.

## Implementación

### 1. **Bloquear Cierre Programático**

```typescript
// mvp-selection-modal.tsx
<Dialog open={open} onOpenChange={() => {}}>
  {/* onOpenChange vacío = no permite cerrar */}
</Dialog>
```

### 2. **Ocultar Botón X Visual**

```typescript
<DialogContent 
  className="max-w-2xl bg-[#0d0d0d] border border-white/10"
  hideCloseButton // ✅ Oculta el botón X
>
```

### 3. **Modificar DialogContent Base**

Actualizado `components/ui/dialog.tsx` para aceptar prop `hideCloseButton`:

```typescript
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideCloseButton?: boolean; // ✅ Nueva prop
  }
>(({ className, children, hideCloseButton, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content {...props}>
      {children}
      {!hideCloseButton && ( // ✅ Solo muestra X si NO está oculto
        <DialogPrimitive.Close>
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
```

## Protecciones Implementadas

### 1. **No se puede cerrar con X**
- ✅ Botón X completamente oculto
- ✅ No aparece en el DOM

### 2. **No se puede cerrar con ESC**
- ✅ `onOpenChange={() => {}}` bloquea todos los intentos de cierre
- ✅ Incluye: ESC, click fuera, X (si existiera)

### 3. **No se puede cerrar con click fuera**
- ✅ Overlay bloqueado por `onOpenChange`

### 4. **Mensaje Claro al Usuario**
```tsx
<p className="text-center text-sm text-yellow-500 mt-4">
  ⚠️ No podés cerrar sin elegir MVP
</p>
```

## UI del Modal

```
┌─────────────────────────────────────────────┐
│  🏆 Seleccioná el MVP del Partido           │
│  Elegí al jugador más valioso antes de      │
│  finalizar                                  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Trapper Mentiroso 🏆         15     │   │
│  │ Traperos Locos                      │   │
│  │ 15 PTS  0 AST  0 REB  0 STL  0 TOV  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Valentín Sánchez Guevara     14     │   │
│  │ Busy Team                           │   │
│  │ 14 PTS  0 AST  0 REB  0 STL  0 TOV  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ⚠️ No podés cerrar sin elegir MVP          │
└─────────────────────────────────────────────┘
```

**Sin botón X** - Usuario DEBE elegir un jugador

## Flujo Completo

```
1. Partido finaliza
   ↓
2. Modal MVP aparece
   ↓
3. Usuario intenta cerrar con X
   ↓
4. ❌ No hay botón X
   ↓
5. Usuario intenta ESC
   ↓
6. ❌ No funciona
   ↓
7. Usuario intenta click fuera
   ↓
8. ❌ No funciona
   ↓
9. Usuario lee: "⚠️ No podés cerrar sin elegir MVP"
   ↓
10. Usuario elige MVP
   ↓
11. ✅ Modal se cierra automáticamente
   ↓
12. Guarda datos y cierra scorekeeper
```

## Casos de Uso

### Caso 1: Usuario intenta cerrar sin elegir
```
Usuario: [Intenta ESC]
Sistema: ❌ (nada pasa)

Usuario: [Intenta click fuera]
Sistema: ❌ (nada pasa)

Usuario: [Busca botón X]
Sistema: ❌ (no existe)

Usuario: [Lee mensaje]
Sistema: "⚠️ No podés cerrar sin elegir MVP"

Usuario: [Elige MVP]
Sistema: ✅ Cierra automáticamente
```

### Caso 2: Usuario elige MVP directamente
```
Usuario: [Click en jugador]
Sistema: ✅ Cierra modal
Sistema: ✅ Guarda datos
Sistema: ✅ Cierra scorekeeper
Sistema: ✅ Refresca fixture
```

## Beneficios

1. ✅ **Datos consistentes** - Siempre hay MVP
2. ✅ **No hay estados inválidos** - No se puede finalizar sin MVP
3. ✅ **UX clara** - Usuario sabe que DEBE elegir
4. ✅ **Sin confusión** - No hay forma de "escapar"

## Archivos Modificados

1. **components/ui/dialog.tsx**
   - Agregada prop `hideCloseButton?: boolean`
   - Botón X condicional: `{!hideCloseButton && <Close />}`

2. **components/admin/blacktop/scorekeeper/mvp-selection-modal.tsx**
   - `onOpenChange={() => {}}` - Bloquea cierre
   - `hideCloseButton` - Oculta botón X
   - Mensaje de advertencia agregado

## Testing

### Test 1: Intentar cerrar con X
1. Finalizar partido
2. Modal MVP aparece
3. Buscar botón X
4. Verificar que NO existe ✅

### Test 2: Intentar cerrar con ESC
1. Modal MVP abierto
2. Presionar ESC
3. Verificar que NO cierra ✅

### Test 3: Intentar cerrar con click fuera
1. Modal MVP abierto
2. Click en overlay (fondo oscuro)
3. Verificar que NO cierra ✅

### Test 4: Elegir MVP
1. Modal MVP abierto
2. Click en jugador
3. Verificar que cierra ✅
4. Verificar que guarda datos ✅
5. Verificar que cierra scorekeeper ✅

## ✅ Resultado Final

- ✅ **No se puede cerrar** el modal MVP sin elegir
- ✅ **Sin botón X** visible
- ✅ **Sin ESC** para cerrar
- ✅ **Sin click fuera** para cerrar
- ✅ **Mensaje claro** de advertencia
- ✅ **Cierre automático** al elegir MVP
