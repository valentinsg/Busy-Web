# Fix: Live Scorekeeper - Jugadores y Puntos

## 🐛 Problema

El Live Scorekeeper no mostraba:
- ❌ Lista de jugadores
- ❌ Botones para sumar puntos
- ❌ Estadísticas de jugadores

## 🔍 Causa Raíz

El componente tenía **dos funciones** para cargar equipos:

1. **`useEffect` (línea 77)** - Se ejecutaba correctamente
   - ✅ Cargaba `teamA` y `teamB`
   - ❌ NO inicializaba `statsA` y `statsB`

2. **`loadTeams()` (línea 118)** - Nunca se llamaba
   - ✅ Cargaba equipos
   - ✅ Inicializaba stats
   - ❌ Función huérfana, nunca invocada

**Resultado:** `playersA` y `playersB` eran arrays vacíos porque dependían de `statsA` y `statsB` que nunca se inicializaban.

```typescript
// playersA y playersB se crean a partir de statsA/statsB
const playersA = statsA.map((s) => ({ ... })); // statsA = [] ❌
const playersB = statsB.map((s) => ({ ... })); // statsB = [] ❌

// Estos arrays vacíos se pasaban al TeamScoreboard
<TeamScoreboard players={playersA} /> // players = [] ❌
```

## ✅ Solución

### 1. Consolidar inicialización en `useEffect`

Movida la inicialización de `statsA` y `statsB` al `useEffect` que ya cargaba los equipos:

```typescript
useEffect(() => {
  // ... fetch teams ...
  const [teamAData, teamBData] = await Promise.all([...]);
  setTeamA(teamAData);
  setTeamB(teamBData);
  
  // ✅ NUEVO: Inicializar stats aquí
  setStatsA(
    teamAData.players.map((p: Player) => ({
      player_id: p.id,
      player_name: p.full_name,
      team_name: teamAData.name,
      points: 0,
      assists: 0,
      rebounds: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      is_mvp: false,
    }))
  );
  
  setStatsB(/* mismo patrón */);
}, [open, match.id, match.team_a_id, match.team_b_id]);
```

### 2. Eliminar función duplicada

Removida `loadTeams()` que nunca se usaba (47 líneas de código muerto).

### 3. Agregar debugging

```typescript
console.log('🏀 Teams loaded:', { teamA: teamAData, teamB: teamBData });
console.log('👥 Initializing player stats...');
```

## 📊 Flujo Correcto

```
1. Usuario abre scorekeeper
   ↓
2. useEffect detecta open=true
   ↓
3. Fetch /api/blacktop/teams/[id] (ambos equipos)
   ↓
4. setTeamA/setTeamB (datos del equipo)
   ↓
5. setStatsA/setStatsB (inicializar stats en 0) ✅ NUEVO
   ↓
6. playersA/playersB se calculan (ya no vacíos) ✅
   ↓
7. TeamScoreboard renderiza jugadores ✅
```

## 🧪 Testing

1. Abrir scorekeeper de cualquier partido
2. Verificar que aparecen jugadores de ambos equipos
3. Click en un jugador
4. Verificar que abre el sheet de acciones
5. Sumar puntos/stats
6. Verificar que se actualizan en el scoreboard

## 📝 Archivos Modificados

- `components/admin/blacktop/scorekeeper/live-scorekeeper-pro.tsx`
  - Inicialización de stats movida a useEffect (líneas 96-124)
  - Función loadTeams eliminada (47 líneas)
  - Console.logs agregados para debugging

## 🚀 Próximas Mejoras

- [ ] Persistir stats en DB durante el partido (no solo al finalizar)
- [ ] Agregar loading state mientras cargan equipos
- [ ] Mostrar mensaje si equipo no tiene jugadores
- [ ] Cache de equipos para evitar refetch innecesarios
