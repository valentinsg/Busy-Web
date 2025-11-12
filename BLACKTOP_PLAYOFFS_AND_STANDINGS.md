# Playoffs Time Config & NBA-Style Standings

## ✅ Implementaciones Completadas

### 1. **Tiempo Configurable para Playoffs**

Los partidos de playoffs ahora pueden tener una configuración de tiempo diferente a los de grupos.

#### Migración SQL
**Archivo:** `006_add_playoff_time_config.sql`

```sql
ALTER TABLE public.tournaments
  ADD COLUMN playoff_period_duration_minutes INTEGER,
  ADD COLUMN playoff_periods_count INTEGER;
```

**Comportamiento:**
- Si `playoff_period_duration_minutes` es NULL → usa `period_duration_minutes`
- Si `playoff_periods_count` es NULL → usa `periods_count`

#### Tipo Tournament Actualizado
```typescript
interface Tournament {
  // ... campos existentes
  period_duration_minutes: number; // Para grupos
  periods_count: number; // Para grupos
  playoff_period_duration_minutes?: number; // Para playoffs (opcional)
  playoff_periods_count?: number; // Para playoffs (opcional)
}
```

#### LiveScorekeeperPro Actualizado
```typescript
// Detectar si es partido de playoffs
const isPlayoffMatch = match.phase !== 'groups';

// Usar configuración específica
const periodDuration = isPlayoffMatch && tournament.playoff_period_duration_minutes 
  ? tournament.playoff_period_duration_minutes 
  : tournament.period_duration_minutes;

const periodsCount = isPlayoffMatch && tournament.playoff_periods_count
  ? tournament.playoff_periods_count
  : tournament.periods_count;
```

**Ejemplo de uso:**
- Grupos: 2 períodos de 8 minutos
- Playoffs: 4 períodos de 10 minutos (como NBA)

### 2. **Standings Estilo NBA**

Tabla de posiciones rediseñada al estilo NBA, sin "puntos de torneo" que confunden con fútbol.

#### Tipo StandingsRow Actualizado
```typescript
interface StandingsRow {
  team_id: number;
  team_name: string;
  played: number;
  won: number;
  lost: number;
  points_for: number;
  points_against: number;
  point_diff: number;
  tournament_points: number; // Mantener para compatibilidad pero NO mostrar
  win_pct: number; // ✅ NUEVO: Porcentaje de victorias (W/L)
  streak: number; // ✅ NUEVO: Racha actual (+ victorias, - derrotas)
  total_fouls: number; // ✅ NUEVO: Total de faltas
}
```

#### Cálculo de Standings Mejorado

**Win Percentage (Pct):**
```typescript
row.win_pct = row.played > 0 ? row.won / row.played : 0;
// Ejemplo: 9 victorias / 11 partidos = 0.818
```

**Streak (Racha):**
```typescript
// Rastrear resultados cronológicamente
const teamResults: Map<number, ('W' | 'L')[]> = new Map();

// Calcular racha desde el último partido
let streak = 0;
for (let i = results.length - 1; i >= 0; i--) {
  if (results[i] === 'W') {
    streak = streak >= 0 ? streak + 1 : 1;
  } else if (results[i] === 'L') {
    streak = streak <= 0 ? streak - 1 : -1;
  }
  if (i < results.length - 1 && results[i] !== results[i + 1]) break;
}
row.streak = streak;
```

**Ejemplos de Streak:**
- `W3` = 3 victorias consecutivas
- `L2` = 2 derrotas consecutivas
- `-` = Sin racha o sin partidos

**Total Fouls:**
```typescript
statsA.total_fouls += foulsA;
statsB.total_fouls += foulsB;
```

#### UI de Standings Estilo NBA

**Antes (estilo fútbol):**
```
Pos | Equipo | PJ | PG | PP | PF | PC | Dif | Pts
 1  | Pistons| 11 | 9  | 2  | 95 | 72 | +23 | 20
```

**Después (estilo NBA):**
```
#  | Team    | W  | L  | Pct   | PF | PA | Diff | Streak | Fouls
1  | Pistons | 9  | 2  | .818  | 95 | 72 | +23  | W3     | 12
```

**Columnas:**
- `#` - Posición
- `Team` - Nombre del equipo
- `W` - Victorias (verde)
- `L` - Derrotas (rojo)
- `Pct` - Porcentaje de victorias (formato .XXX)
- `PF` - Points For (puntos a favor)
- `PA` - Points Against (puntos en contra)
- `Diff` - Diferencia (verde si +, rojo si -)
- `Streak` - Racha (W# verde, L# rojo)
- `Fouls` - Total de faltas (amarillo)

**Colores:**
- ✅ Victorias: `text-green-500`
- ❌ Derrotas: `text-red-400`
- 📊 Pct: `font-mono` (monoespaciado)
- 🟢 Diff positivo: `text-green-500`
- 🔴 Diff negativo: `text-red-400`
- 🟡 Fouls: `text-yellow-500`
- ⚡ Streak W: `text-green-500`
- 💔 Streak L: `text-red-400`

**Hover Effect:**
```css
hover:bg-white/5 transition-colors
```

## 📊 Comparación Visual

### Standings Antes vs Después

#### Antes (Confuso - Parecía Fútbol)
```
┌─────────────────────────────────────────────────────┐
│ Pos  Equipo      PJ  PG  PP  PF  PC  Dif  Pts      │
│  1   Pistons    11   9   2  95  72  +23   20  ❌   │
│  2   Lakers     11   7   4  88  81   +7   18       │
└─────────────────────────────────────────────────────┘
                                          ↑
                              Puntos de torneo (confuso!)
```

#### Después (Claro - Estilo NBA)
```
┌──────────────────────────────────────────────────────────┐
│ #  Team      W   L   Pct    PF  PA  Diff  Streak  Fouls │
│ 1  Pistons   9   2   .818   95  72  +23   W3      12    │
│ 2  Lakers    7   4   .636   88  81   +7   L1      15    │
└──────────────────────────────────────────────────────────┘
```

## 🎯 Casos de Uso

### Caso 1: Torneo con Mismo Tiempo
```typescript
// Configuración del torneo
period_duration_minutes: 8
periods_count: 2
playoff_period_duration_minutes: null // Usa 8 minutos
playoff_periods_count: null // Usa 2 períodos

// Resultado: Todos los partidos 2x8min
```

### Caso 2: Playoffs con Más Tiempo
```typescript
// Configuración del torneo
period_duration_minutes: 8
periods_count: 2
playoff_period_duration_minutes: 10 // ✅ Playoffs más largos
playoff_periods_count: 4 // ✅ 4 períodos

// Resultado:
// - Grupos: 2x8min
// - Playoffs: 4x10min (40 min total vs 16 min grupos)
```

### Caso 3: Interpretar Standings

```
# | Team         | W  | L  | Pct   | Streak | Fouls
1 | Busy Team    | 9  | 2  | .818  | W3     | 12
2 | Traperos     | 7  | 4  | .636  | L1     | 15
3 | Gordos       | 5  | 6  | .455  | W2     | 18
```

**Interpretación:**
- **Busy Team:** 9-2 récord, 81.8% victorias, racha de 3 victorias, 12 faltas
- **Traperos:** 7-4 récord, 63.6% victorias, perdió último partido, 15 faltas
- **Gordos:** 5-6 récord, 45.5% victorias, ganó últimos 2, 18 faltas

## 📝 Archivos Modificados

### Nuevos
1. **006_add_playoff_time_config.sql** - Migración para tiempo de playoffs

### Modificados
1. **types/blacktop.ts**
   - Agregado `playoff_period_duration_minutes` y `playoff_periods_count` a `Tournament`
   - Agregado `win_pct`, `streak` y `total_fouls` a `StandingsRow`

2. **lib/blacktop/standings.ts**
   - Calcular `win_pct` (porcentaje de victorias)
   - Calcular `streak` (racha actual)
   - Acumular `total_fouls`
   - Ordenar partidos por fecha para racha correcta

3. **components/admin/blacktop/scorekeeper/live-scorekeeper-pro.tsx**
   - Detectar si es partido de playoffs
   - Usar configuración de playoffs si existe
   - Variables `periodDuration` y `periodsCount` dinámicas

4. **components/admin/blacktop/tournament-fixture-v2.tsx**
   - Tabla de standings rediseñada
   - Columnas estilo NBA (W, L, Pct, Streak, Fouls)
   - Eliminada columna "Pts" (puntos de torneo)
   - Colores y formato mejorados

## 🧪 Testing

### Test 1: Tiempo de Playoffs
1. Crear torneo con:
   - Grupos: 2x8min
   - Playoffs: 4x10min
2. Jugar partido de grupos
3. Verificar timer: 8:00 minutos ✅
4. Avanzar a playoffs
5. Jugar partido de playoffs
6. Verificar timer: 10:00 minutos ✅
7. Verificar 4 períodos ✅

### Test 2: Standings Estilo NBA
1. Finalizar varios partidos
2. Ir a tab Standings
3. Verificar columnas: W, L, Pct, Streak, Fouls ✅
4. Verificar NO hay columna "Pts" ✅
5. Verificar Pct formato .XXX ✅
6. Verificar Streak: W# o L# ✅
7. Verificar colores correctos ✅

### Test 3: Cálculo de Racha
1. Equipo gana 3 partidos seguidos
2. Verificar Streak: W3 (verde) ✅
3. Equipo pierde siguiente
4. Verificar Streak: L1 (rojo) ✅
5. Equipo pierde otro
6. Verificar Streak: L2 (rojo) ✅

## ✅ Beneficios

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Tiempo playoffs** | Igual que grupos | Configurable ✅ |
| **Standings** | Estilo fútbol | Estilo NBA ✅ |
| **Claridad** | Confuso (Pts) | Claro (W-L, Pct) ✅ |
| **Racha** | ❌ No existía | ✅ W# / L# |
| **Faltas** | ❌ No visible | ✅ Total acumulado |
| **Porcentaje** | ❌ No existía | ✅ .XXX formato |

## 🚀 Próximas Mejoras Posibles

- [ ] Configurar tiempo de playoffs desde admin UI
- [ ] Mostrar últimos 5 resultados (WWLWL)
- [ ] Gráfico de racha visual
- [ ] Comparar stats entre equipos
- [ ] Exportar standings a PDF
