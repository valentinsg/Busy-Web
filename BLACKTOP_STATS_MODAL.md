# Modal de Estadísticas de Partido - Blacktop

## ✅ Implementado

Modal fachero para ver las estadísticas de un partido finalizado al hacer click en él.

## 🎨 Diseño del Modal

### Header con Resultado
```
┌─────────────────────────────────────────────────────────┐
│  [Finalizado]                    [Ganador: Busy Team]   │
│                                                          │
│       Busy Team           VS          Traperos Locos    │
│          21                              19             │
│        ▬▬▬ (3)                          ▬▬▬▬ (4)        │
└─────────────────────────────────────────────────────────┘
```

**Características:**
- ✅ Fondo con gradiente accent-brand/purple
- ✅ Badge de "Finalizado" (verde)
- ✅ Badge de "Ganador" (amarillo con trofeo)
- ✅ Scores grandes (text-6xl)
- ✅ Faltas visuales con líneas (grises y rojas)

### Highlights
```
┌──────────────────────────┐  ┌──────────────────────────┐
│ 🏆 MVP del Partido       │  │ 🎯 Máximo Anotador       │
│ Valentín Sánchez Guevara │  │ Trapper Mentiroso        │
│ 14 PTS  3 AST  2 REB     │  │      15 PTS              │
└──────────────────────────┘  └──────────────────────────┘
```

**Características:**
- ✅ MVP con fondo amarillo/naranja
- ✅ Máximo anotador con fondo rojo/rosa
- ✅ Animación de entrada con Framer Motion
- ✅ Delay escalonado (0.1s)

### Stats por Equipo
```
┌─ Busy Team ────────────────────────────────────────┐
│  Valentín Sánchez Guevara                    🏆    │
│  14    3    2    1    0    0                       │
│  PTS  AST  REB  ROB  BLQ  PER                      │
├────────────────────────────────────────────────────┤
│  Tonk Zeke                                         │
│  7     2    1    0    0    1                       │
│  PTS  AST  REB  ROB  BLQ  PER                      │
└────────────────────────────────────────────────────┘
```

**Características:**
- ✅ Cards con hover effect
- ✅ Trofeo para MVP
- ✅ Grid de 6 columnas para stats
- ✅ Puntos destacados (accent-brand/purple)
- ✅ Pérdidas en rojo
- ✅ Animación de entrada por jugador (stagger)

## 🔧 Implementación

### 1. Componente Modal

**Archivo:** `components/admin/blacktop/match-stats-view-modal.tsx`

```tsx
<MatchStatsViewModal
  matchId={matchId}
  open={open}
  onClose={onClose}
/>
```

**Props:**
- `matchId: number` - ID del partido
- `open: boolean` - Estado del modal
- `onClose: () => void` - Callback al cerrar

### 2. Endpoint API

**Archivo:** `app/api/admin/blacktop/matches/[id]/stats/route.ts`

```typescript
GET /api/admin/blacktop/matches/[id]/stats

Response: {
  match: {
    id: number,
    team_a_score: number,
    team_b_score: number,
    fouls_a: number,
    fouls_b: number
  },
  teamA: { id: number, name: string },
  teamB: { id: number, name: string },
  statsA: PlayerStat[],
  statsB: PlayerStat[]
}
```

**Funcionalidad:**
1. Obtiene datos del partido
2. Obtiene estadísticas de jugadores
3. Separa stats por equipo
4. Retorna todo estructurado

### 3. MatchCard Clickeable

**Modificado:** `components/admin/blacktop/match-card.tsx`

```tsx
<MatchCard
  match={match}
  onManage={openScorekeeper}
  onViewStats={openStatsModal} // ✅ Nuevo
/>
```

**Comportamiento:**
- ✅ Si partido está **finalizado** → Click abre modal de stats
- ✅ Si partido **NO finalizado** → Botón "Gestionar" abre scorekeeper
- ✅ Click en botón "Gestionar" no propaga al card (`stopPropagation`)

### 4. Integración en Fixture

**Modificado:** `components/admin/blacktop/tournament-fixture-v2.tsx`

```tsx
const [statsModalOpen, setStatsModalOpen] = useState(false);
const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

const openStatsModal = (matchId: number) => {
  setSelectedMatchId(matchId);
  setStatsModalOpen(true);
};

// Todos los MatchCard ahora tienen onViewStats
<MatchCard 
  match={match} 
  onManage={openScorekeeper}
  onViewStats={openStatsModal}
/>
```

## 🎯 Flujo de Usuario

### Caso 1: Ver Stats de Partido Finalizado
```
1. Usuario ve fixture
   ↓
2. Ve partido finalizado (badge "Finalizado")
   ↓
3. Click en el card del partido
   ↓
4. ⏳ Modal aparece con skeleton
   ↓
5. Fetch stats del servidor
   ↓
6. ✅ Modal muestra:
   - Resultado final
   - MVP del partido
   - Máximo anotador
   - Stats de todos los jugadores
   - Faltas por equipo
```

### Caso 2: Gestionar Partido No Finalizado
```
1. Usuario ve partido pendiente/live
   ↓
2. Click en botón "Gestionar"
   ↓
3. Abre LiveScorekeeper (como antes)
```

## 🎨 Detalles Visuales

### Colores
- **Fondo:** `bg-gradient-to-br from-zinc-950 to-black`
- **Header:** `bg-gradient-to-r from-accent-brand/20 to-purple-600/20`
- **MVP:** `from-yellow-600/20 to-orange-600/20`
- **Top Scorer:** `from-red-600/20 to-pink-600/20`
- **Cards:** `bg-white/5 hover:bg-white/10`

### Animaciones
```tsx
// Entrada de highlights
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>

// Entrada de jugadores (stagger)
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: index * 0.05 }}
>
```

### Iconos
- 🏆 `Trophy` - MVP y ganador
- 🎯 `Target` - Máximo anotador
- 🛡️ `Shield` - Nombre de equipos
- ⚠️ `AlertCircle` - Error al cargar

## 📊 Datos Mostrados

### Por Partido
- ✅ Resultado final (scores)
- ✅ Ganador
- ✅ Faltas por equipo (visuales)
- ✅ MVP
- ✅ Máximo anotador

### Por Jugador
- ✅ Nombre
- ✅ Puntos (PTS) - Destacado
- ✅ Asistencias (AST)
- ✅ Rebotes (REB)
- ✅ Robos (ROB)
- ✅ Bloqueos (BLQ)
- ✅ Pérdidas (PER) - En rojo

## 🔒 Estados

### Loading
```tsx
{loading && (
  <div className="space-y-6 p-6">
    <Skeleton className="h-12 w-64" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
)}
```

### Error
```tsx
<div className="flex flex-col items-center justify-center py-12">
  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
  <p>No se pudieron cargar las estadísticas</p>
</div>
```

### Datos Cargados
- Header con resultado
- Highlights (MVP + Top Scorer)
- Stats por equipo en grid

## 📝 Archivos Creados/Modificados

### Nuevos
1. **match-stats-view-modal.tsx** - Modal de visualización
2. **app/api/admin/blacktop/matches/[id]/stats/route.ts** - Endpoint

### Modificados
1. **match-card.tsx**
   - Prop `onViewStats` opcional
   - Click en card si está finalizado
   - `stopPropagation` en botón Gestionar

2. **tournament-fixture-v2.tsx**
   - Estados para modal de stats
   - Función `openStatsModal`
   - Pasar `onViewStats` a todos los MatchCard
   - Renderizar `MatchStatsViewModal`

## 🧪 Testing

### Test 1: Abrir Stats de Partido Finalizado
1. Ir a fixture
2. Ver partido finalizado
3. Click en card
4. Verificar modal aparece ✅
5. Verificar skeleton mientras carga ✅
6. Verificar datos se muestran ✅
7. Verificar MVP destacado ✅
8. Verificar máximo anotador ✅

### Test 2: Gestionar Partido No Finalizado
1. Ver partido pendiente
2. Click "Gestionar"
3. Verificar que NO abre modal de stats ✅
4. Verificar que abre scorekeeper ✅

### Test 3: Cerrar Modal
1. Abrir modal de stats
2. Click fuera del modal
3. Verificar que cierra ✅
4. Click en X
5. Verificar que cierra ✅

## ✅ Resultado Final

- ✅ **Modal fachero** con gradientes y animaciones
- ✅ **Click en partido finalizado** abre stats
- ✅ **MVP y Top Scorer** destacados
- ✅ **Stats completas** de todos los jugadores
- ✅ **Faltas visuales** con líneas
- ✅ **Skeleton** mientras carga
- ✅ **Responsive** y profesional
