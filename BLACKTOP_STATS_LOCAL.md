# Estadísticas 100% Locales - Live Scorekeeper

## 🎯 Problema Resuelto

**Antes:**
- ❌ Delay al actualizar estadísticas
- ❌ Posibles llamadas al servidor durante el partido
- ❌ Experiencia no fluida

**Después:**
- ✅ **100% local** durante el partido
- ✅ **Actualización instantánea** de stats
- ✅ **Guardado único** al finalizar partido
- ✅ **Feedback visual** con toasts

## 🔧 Implementación

### 1. Estadísticas Locales Durante el Partido

Todo se maneja en estado local de React:

```typescript
// Estado local - NO toca la DB
const [statsA, setStatsA] = useState<PlayerStats[]>([]);
const [statsB, setStatsB] = useState<PlayerStats[]>([]);
const [scoreA, setScoreA] = useState(0);
const [scoreB, setScoreB] = useState(0);
const [foulsA, setFoulsA] = useState(0);
const [foulsB, setFoulsB] = useState(0);
```

### 2. Actualización Instantánea

```typescript
const handleAddPoints = (side: 'A' | 'B', playerId: number, points: number) => {
  // Solo actualiza estado local - INSTANTÁNEO
  if (side === 'A') {
    setScoreA((prev) => prev + points);
    setStatsA((prev) =>
      prev.map((s) => 
        s.player_id === playerId 
          ? { ...s, points: s.points + points } 
          : s
      )
    );
  }
  // Toast feedback
  showActionToast(`+${points} puntos para ${playerName}`);
};

const handleAddStat = (side, playerId, stat, delta) => {
  // Solo actualiza estado local - INSTANTÁNEO
  if (side === 'A') {
    setStatsA((prev) =>
      prev.map((s) =>
        s.player_id === playerId 
          ? { ...s, [stat]: Math.max(0, s[stat] + delta) } 
          : s
      )
    );
  }
  // Toast feedback
  showActionToast(`+1 ${statLabels[stat]} para ${playerName}`);
};
```

### 3. Guardado al Finalizar Partido

Solo cuando se selecciona el MVP se guarda todo en la DB:

```typescript
const handleSelectMVP = async (playerId: number) => {
  try {
    // 1. Actualizar score y faltas
    await fetch(`/api/admin/blacktop/matches/${match.id}/score`, {
      method: 'PATCH',
      body: JSON.stringify({
        team_a_score: scoreA,
        team_b_score: scoreB,
        fouls_a: foulsA,
        fouls_b: foulsB,
      }),
    });

    // 2. Finalizar partido
    await fetch(`/api/admin/blacktop/matches/${match.id}/finish`, {
      method: 'POST',
    });

    // 3. Guardar estadísticas de jugadores
    const allStats = [...statsA, ...statsB].map(s => ({
      ...s,
      is_mvp: s.player_id === playerId
    }));

    await fetch(`/api/admin/blacktop/matches/${match.id}/player-stats`, {
      method: 'POST',
      body: JSON.stringify({ stats: allStats }),
    });

    showActionToast('🏁 Partido finalizado y guardado');
    onSuccess(); // Refrescar vista
  } catch (error) {
    toast({
      title: 'Error',
      description: 'No se pudo guardar el partido',
      variant: 'destructive'
    });
  }
};
```

## 📡 Nuevo Endpoint: Player Stats

**Archivo:** `app/api/admin/blacktop/matches/[id]/player-stats/route.ts`

```typescript
POST /api/admin/blacktop/matches/[id]/player-stats

Body: {
  stats: [
    {
      player_id: number,
      points: number,
      assists: number,
      rebounds: number,
      steals: number,
      blocks: number,
      turnovers: number,
      is_mvp: boolean
    }
  ]
}
```

**Funcionalidad:**
1. Borra stats anteriores del partido
2. Inserta nuevas stats
3. Invalida cache del torneo
4. Retorna cantidad de stats guardadas

## 🎨 Feedback Visual

### Toasts para Stats
```typescript
const statLabels = {
  assists: 'asistencia',
  rebounds: 'rebote',
  steals: 'robo',
  blocks: 'bloqueo',
  turnovers: 'pérdida'
};

// Al sumar stat
showActionToast(`+1 ${statLabels[stat]} para ${playerName}`);

// Al sumar puntos
showActionToast(`+${points} puntos para ${playerName}`);

// Al finalizar
showActionToast('🏁 Partido finalizado y guardado');
```

## 📊 Flujo Completo

```
1. Usuario inicia partido
   ↓
2. Durante el partido:
   - Sumar puntos → Estado local ✅ INSTANTÁNEO
   - Sumar stats → Estado local ✅ INSTANTÁNEO
   - Pausar/Reanudar → Estado local ✅
   - Ajustar tiempo → Estado local ✅
   ↓
3. Finalizar partido:
   - Pausar partido
   - Mostrar modal MVP
   ↓
4. Seleccionar MVP:
   - POST /score (actualizar marcador)
   - POST /finish (finalizar partido)
   - POST /player-stats (guardar todas las stats)
   - Invalidar cache
   - Refrescar vista
```

## ✅ Beneficios

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Actualización stats** | ~500ms | Instantáneo |
| **Llamadas durante partido** | Múltiples | 0 |
| **Llamadas al finalizar** | 0 | 3 (batch) |
| **UX** | Delay visible | Fluido |
| **Feedback** | Ninguno | Toasts |

## 🧪 Testing

### Durante el Partido
1. Sumar puntos → Verificar actualización instantánea
2. Sumar asistencia → Verificar toast y actualización
3. Sumar rebote → Verificar actualización
4. Verificar que NO hay llamadas al servidor (Network tab)

### Al Finalizar
1. Click "Finalizar"
2. Seleccionar MVP
3. Verificar 3 llamadas en Network:
   - PATCH /score
   - POST /finish
   - POST /player-stats
4. Verificar que se cierra modal
5. Verificar que aparece en fixture como finalizado

## 🔒 Manejo de Errores

Si falla el guardado al finalizar:
- ✅ Toast de error
- ✅ Modal NO se cierra
- ✅ Usuario puede reintentar
- ✅ Datos locales se mantienen

## 📝 Archivos Modificados

1. **live-scorekeeper-pro.tsx**
   - `handleAddStat`: Feedback toast agregado
   - `handleSelectMVP`: Guardado completo al finalizar
   - Manejo de errores con toast

2. **player-stats/route.ts** (NUEVO)
   - Endpoint para guardar stats de jugadores
   - Borra stats anteriores
   - Invalida cache

## 🚀 Próximas Mejoras

- [ ] Guardar estado en localStorage (recuperar si se cierra)
- [ ] Modo offline completo
- [ ] Sincronización automática al recuperar conexión
- [ ] Historial de cambios (undo/redo)
