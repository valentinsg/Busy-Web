# Sistema de Punto de Oro (Golden Point)

## 🎯 Objetivo

**NO permitir empates** - Si el partido termina empatado, se activa automáticamente el **Punto de Oro**: el próximo punto decide el ganador.

## ⚡ Funcionamiento

### 1. **Activación Automática**

El Punto de Oro se activa en dos situaciones:

#### A) Tiempo llega a 0 en el último período con empate
```typescript
const handleEndPeriod = () => {
  const isLastPeriod = match.current_period === tournament.periods_count;
  const isTied = scoreA === scoreB;

  if (isLastPeriod && isTied && tournament.golden_point_enabled) {
    setIsGoldenPoint(true); // ⚡ Activar Golden Point
    handleResume(); // Continuar partido
    showActionToast('⚡ EMPATE! Punto de Oro activado');
  }
};
```

#### B) Usuario intenta finalizar con empate
```typescript
const handleFinish = () => {
  const isTied = scoreA === scoreB;
  
  if (isTied && !isGoldenPoint && tournament.golden_point_enabled) {
    // ❌ NO permitir finalizar
    setIsGoldenPoint(true);
    handleResume();
    toast({
      title: '⚡ Punto de Oro',
      description: 'El partido está empatado. El próximo punto decide el ganador.'
    });
    return; // Bloquea finalización
  }
  
  // ✅ Permitir finalizar solo si NO hay empate o ya estamos en golden point
  handlePause();
  setShowMVPModal(true);
};
```

### 2. **Lógica de Finalización**

```typescript
// En timer-control-v2.tsx
const isTied = scoreA === scoreB;
const canFinish = status === 'live' 
  && timeRemaining === 0 
  && isLastPeriod 
  && (!isTied || isGoldenPoint); // ✅ Solo si NO hay empate O ya en golden point
```

### 3. **Detección de Ganador en Golden Point**

```typescript
const handleAddPoints = (side: 'A' | 'B', playerId: number, points: number) => {
  // Actualizar score local
  if (side === 'A') {
    setScoreA((prev) => prev + points);
  } else {
    setScoreB((prev) => prev + points);
  }

  // Si estamos en Golden Point y alguien anota
  if (isGoldenPoint && points > 0) {
    const winnerTeam = side === 'A' ? teamA?.name : teamB?.name;
    showActionToast(`🏆 ¡${winnerTeam} gana por Punto de Oro!`);
    
    setTimeout(async () => {
      await updateScore(); // Guardar score
      handleFinish(); // Finalizar partido
    }, 2000);
  }
};
```

## 🎨 UI del Golden Point

### Fondo Dorado
```tsx
<div className={`
  ${isGoldenPoint 
    ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30' 
    : 'bg-black'
  }
`}>
```

### Badge Animado
```tsx
{isGoldenPoint ? (
  <Badge className="bg-yellow-500/20 border-yellow-500 text-yellow-500 animate-pulse">
    ⚡ PUNTO DE ORO
  </Badge>
) : (
  <Badge>Q{currentPeriod}/{totalPeriods}</Badge>
)}
```

### Mensaje Claro
```
⚡ PUNTO DE ORO - Próximo punto gana
```

## 📊 Flujos Completos

### Flujo 1: Tiempo se acaba con empate
```
1. Último período, tiempo = 0
   ↓
2. scoreA === scoreB
   ↓
3. ⚡ Activar Golden Point automáticamente
   ↓
4. Fondo cambia a dorado
   ↓
5. Badge: "⚡ PUNTO DE ORO"
   ↓
6. Toast: "EMPATE! Punto de Oro activado"
   ↓
7. Partido continúa (sin tiempo)
   ↓
8. Primer equipo en anotar gana
   ↓
9. Toast: "🏆 [Equipo] gana por Punto de Oro!"
   ↓
10. Finaliza automáticamente
```

### Flujo 2: Usuario intenta finalizar con empate
```
1. Usuario click "Finalizar Partido"
   ↓
2. scoreA === scoreB
   ↓
3. ❌ Bloquear finalización
   ↓
4. ⚡ Activar Golden Point
   ↓
5. Toast grande: "Punto de Oro - Próximo punto decide"
   ↓
6. Partido continúa
   ↓
7. Primer equipo en anotar gana
```

### Flujo 3: Partido sin empate
```
1. Usuario click "Finalizar Partido"
   ↓
2. scoreA !== scoreB
   ↓
3. ✅ Permitir finalizar
   ↓
4. Modal MVP
   ↓
5. Guardar y cerrar
```

## 🔒 Protecciones

### 1. No se puede finalizar con empate
```typescript
if (isTied && !isGoldenPoint) {
  // ❌ Bloquear
  return;
}
```

### 2. Golden Point solo si está habilitado
```typescript
if (tournament.golden_point_enabled) {
  // ⚡ Activar
}
```

### 3. Finalización automática al anotar
```typescript
if (isGoldenPoint && points > 0) {
  setTimeout(() => handleFinish(), 2000);
}
```

## 🎮 Experiencia de Usuario

### Estados Visuales

| Estado | Fondo | Badge | Mensaje |
|--------|-------|-------|---------|
| **Normal** | Negro | Q3/4 | - |
| **Golden Point** | Dorado | ⚡ PUNTO DE ORO | Próximo punto gana |
| **Ganador GP** | Dorado | ⚡ PUNTO DE ORO | 🏆 [Equipo] gana! |

### Feedback

1. **Toast al activar:** "⚡ EMPATE! Punto de Oro activado"
2. **Toast grande:** Modal con descripción completa
3. **Toast al ganar:** "🏆 [Equipo] gana por Punto de Oro!"
4. **Animación:** Badge con `animate-pulse`

## 🧪 Testing

### Test 1: Empate al finalizar tiempo
1. Jugar hasta último período
2. Dejar que tiempo llegue a 0
3. Verificar scoreA === scoreB
4. Verificar que activa Golden Point ✅
5. Verificar fondo dorado ✅
6. Anotar punto
7. Verificar que finaliza automáticamente ✅

### Test 2: Intentar finalizar con empate
1. Durante partido, empatar
2. Click "Finalizar Partido"
3. Verificar que NO finaliza ✅
4. Verificar toast de Golden Point ✅
5. Verificar que partido continúa ✅
6. Anotar punto
7. Verificar finalización ✅

### Test 3: Finalizar sin empate
1. Durante partido, diferencia de puntos
2. Click "Finalizar Partido"
3. Verificar que SÍ finaliza ✅
4. Verificar modal MVP ✅

### Test 4: Golden Point deshabilitado
1. Tournament con `golden_point_enabled: false`
2. Empatar
3. Verificar que permite finalizar con empate ✅

## 📝 Configuración

El Golden Point se habilita a nivel de torneo:

```sql
-- En la tabla tournaments
golden_point_enabled BOOLEAN DEFAULT true
```

**Admin puede configurar:**
- ✅ Habilitar/deshabilitar Golden Point por torneo
- ✅ Todos los torneos nuevos tienen GP habilitado por defecto

## ✅ Resultado Final

- ✅ **NO se permiten empates** (si GP está habilitado)
- ✅ **Activación automática** al terminar tiempo o intentar finalizar
- ✅ **UI clara** con fondo dorado y badge animado
- ✅ **Finalización automática** al anotar en GP
- ✅ **Feedback visual** en cada paso
- ✅ **Sin loops infinitos** - Todo es local hasta finalizar
