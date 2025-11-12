# Fix: Estadísticas en Tiempo Real

## 🐛 Problemas Resueltos

### 1. **Estadísticas No Se Actualizaban en Tiempo Real** ✅

**Problema:** Al sumar/restar stats en el PlayerActionSheet, el header mostraba siempre los valores iniciales.

**Causa:** El objeto `sheetPlayer` se creaba a partir de `selectedPlayer` que tenía valores estáticos (snapshot del momento en que se abrió el sheet).

**Antes:**
```typescript
const sheetPlayer = selectedPlayer
  ? {
      points: (selectedPlayer as any).points ?? 0, // ❌ Valor estático
      assists: (selectedPlayer as any).assists ?? 0,
      // ...
    }
  : null;
```

**Después:**
```typescript
// Buscar stats actualizadas en tiempo real desde statsA/statsB
const currentStats = side === 'A' 
  ? statsA.find(s => s.player_id === pid)
  : statsB.find(s => s.player_id === pid);

const sheetPlayer = currentStats
  ? {
      points: currentStats.points, // ✅ Valor en tiempo real
      assists: currentStats.assists,
      // ...
    }
  : null;
```

**Resultado:**
- ✅ Header se actualiza instantáneamente al sumar/restar stats
- ✅ Valores siempre sincronizados con el estado global
- ✅ Re-render automático cuando cambian statsA o statsB

### 2. **Dos Botones X en el Header** ✅

**Problema:** El Sheet mostraba dos botones X (uno del Sheet de shadcn/ui y otro que agregamos manualmente).

**Solución:** Eliminado el botón X personalizado ya que el Sheet ya incluye uno por defecto.

**Antes:**
```tsx
<div className="relative pb-4">
  <button onClick={onClose} className="absolute right-0 top-0">
    <X className="h-5 w-5" /> {/* ❌ Duplicado */}
  </button>
  <SheetTitle className="pr-10">...</SheetTitle>
</div>
```

**Después:**
```tsx
<div className="pb-4">
  <SheetTitle>...</SheetTitle> {/* ✅ Solo la X del Sheet */}
</div>
```

## 🔄 Flujo de Actualización

```
1. Usuario suma 1 asistencia
   ↓
2. handleAddStat actualiza statsA/statsB
   ↓
3. React detecta cambio en statsA/statsB
   ↓
4. PlayerActionSheet se re-renderiza
   ↓
5. Busca currentStats actualizado
   ↓
6. Header muestra nuevo valor ✅ INSTANTÁNEO
```

## 📝 Archivos Modificados

1. **player-action-sheet.tsx**
   - Eliminado botón X duplicado
   - Eliminado import de X de lucide-react
   - Eliminado padding-right innecesario

2. **live-scorekeeper-pro.tsx**
   - Buscar stats en tiempo real desde statsA/statsB
   - Simplificado callbacks de onAddPoints y onAddStat

## 🧪 Testing

1. Abrir player sheet
2. Sumar 1 asistencia
3. Verificar que header se actualiza instantáneamente ✅
4. Sumar 2 puntos
5. Verificar que header muestra nuevo total ✅
6. Verificar que solo hay 1 botón X ✅

## ✅ Resultado Final

- ✅ Estadísticas se actualizan en tiempo real
- ✅ Solo un botón X en el header
- ✅ UI más limpia y consistente
- ✅ Código más simple y mantenible
