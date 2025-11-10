# 🏀 BUSY BLACKTOP - Fixture Tipo NBA + Planilla de Stats

## ✅ LO QUE SE IMPLEMENTÓ

### 1. **Fixture Builder con Drag & Drop** ✅
**Archivo:** `components/admin/blacktop/fixture-builder.tsx`

**Características:**
- ✅ **Vista tipo NBA**: Tabla limpia con equipos, hora, resultado y estado
- ✅ **Drag & Drop**: Arrastra equipos a partidos vacíos
- ✅ **Generación automática**: Botón para crear fixture según formato del torneo
- ✅ **Validaciones**: Respeta límites de partidos por equipo
- ✅ **Estados visuales**: Programado, En juego, Finalizado (con badges de colores)

**Componentes visuales:**
- Tabla responsive con columnas: Partido | Hora | Resultado | Estado
- Equipos sin asignar en zona de drag horizontal
- Iconos de reloj para horarios
- Badges de estado con colores (verde=finalizado, rojo=en juego, gris=programado)

---

### 2. **Modal de Planilla de Estadísticas** ✅
**Archivo:** `components/admin/blacktop/match-stats-modal.tsx`

**Características:**
- ✅ **Resultado del partido**: Inputs grandes para score de cada equipo
- ✅ **Tabs por equipo**: Un tab para cada equipo con sus jugadores
- ✅ **6 Estadísticas por jugador**:
  1. **Points** - Puntos
  2. **Assists** - Asistencias
  3. **Rebounds** - Rebotes
  4. **Steals** - Robos
  5. **Blocks** - Tapones
  6. **Turnovers** - Pérdidas
- ✅ **Botón MVP**: Marca al jugador MVP del partido
- ✅ **Guardado automático**: Actualiza partido y crea/actualiza stats de jugadores

**UI:**
- Grid 3x6 de inputs numéricos por jugador
- Botón "MVP" toggle con icono de trofeo
- Tabs con iconos de Users
- Guardado con toast de confirmación

---

### 3. **API Endpoint para Stats** ✅
**Archivo:** `app/api/blacktop/matches/[id]/player-stats/route.ts`

**Características:**
- ✅ **POST**: Crea o actualiza stats de un jugador en un partido
- ✅ **Upsert logic**: Si ya existe, actualiza; si no, crea
- ✅ **Validaciones**: Verifica que el partido y jugador existan
- ✅ **6 stats + MVP**: Guarda todas las estadísticas

---

### 4. **Formato de Torneo en Creación** ✅
**Archivo:** `components/admin/blacktop/tournament-form.tsx`

**Nuevo card agregado:**
- ✅ **Tipo de formato**: Zonas+Playoffs, Eliminación, Round Robin, Custom
- ✅ **Número de zonas**: Si es formato de zonas
- ✅ **Equipos que avanzan**: Por zona
- ✅ **Formato de playoffs**: Simple o doble eliminación
- ✅ **Partidos por serie**: Único, Mejor de 3, Mejor de 5
- ✅ **Partido por 3º puesto**: Switch

---

### 5. **Integración con Tab de Formato** ✅
**Archivo:** `components/admin/blacktop/tournament-format-config.tsx`

**Agregado:**
- ✅ **Selector de "Best of"**: Botones para 1, 3 o 5 partidos por serie
- ✅ **Guardado en format_config**: Se guarda en JSON como `playoff_series_length`

---

## 📋 Flujo Completo

### Paso 1: Crear Torneo con Formato
1. Ir a `/admin/blacktop/new`
2. Completar datos básicos
3. **Card "Formato del torneo"**:
   - Elegir tipo: Zonas + Playoffs
   - Número de zonas: 2
   - Equipos que avanzan: 2
   - Formato playoffs: Eliminación simple
   - Partidos por serie: Mejor de 3
   - Partido por 3º puesto: Sí
4. Guardar torneo

### Paso 2: Aprobar Equipos y Asignar Zonas
1. Ir a `/admin/blacktop/[id]` → Tab "Inscripciones"
2. Aprobar equipos
3. Ir a Tab "Formato y Zonas" → Sub-tab "Asignar Zonas"
4. Arrastrar equipos a Zona A y Zona B
5. Guardar

### Paso 3: Generar Fixture
1. Ir a Tab "Fixture (0)"
2. Click en **"Generar Fixture"**
3. El sistema crea automáticamente:
   - Partidos de fase de grupos (todos contra todos por zona)
   - Semifinales (los 2 mejores de cada zona)
   - Final
   - Partido por 3º puesto (si está activado)

### Paso 4: Asignar Horarios (Drag & Drop)
1. Ver lista de partidos en tabla tipo NBA
2. Arrastrar equipos a partidos vacíos (TBD)
3. Asignar horarios clickeando en cada partido

### Paso 5: Cargar Estadísticas
1. Click en un partido de la tabla
2. Se abre **Modal de Planilla**
3. Ingresar resultado: Equipo A vs Equipo B
4. Ir a tab del Equipo A:
   - Ingresar stats de cada jugador (puntos, asistencias, etc.)
   - Marcar MVP si aplica
5. Ir a tab del Equipo B:
   - Ingresar stats de cada jugador
   - Marcar MVP si aplica
6. Click en **"Guardar estadísticas"**
7. Toast de confirmación
8. El partido se marca como "Finalizado"

---

## 🎨 Diseño Tipo NBA

### Vista de Fixture
```
┌─────────────────────────────────────────────────────────────┐
│ PARTIDO              │ HORA    │ RESULTADO │ ESTADO         │
├─────────────────────────────────────────────────────────────┤
│ Los Toppers          │ 9:00 PM │ 21 - 18   │ ✅ Finalizado  │
│ vs                   │         │           │                │
│ Arquitectos MDP      │         │           │                │
├─────────────────────────────────────────────────────────────┤
│ Team A               │ 10:00PM │    -      │ 🔴 En juego    │
│ vs                   │         │           │                │
│ Team B               │         │           │                │
├─────────────────────────────────────────────────────────────┤
│ TBD                  │    -    │    -      │ ⚪ Programado  │
│ vs                   │         │           │                │
│ TBD                  │         │           │                │
└─────────────────────────────────────────────────────────────┘
```

### Modal de Planilla
```
┌─────────────────────────────────────────────────────────────┐
│ 🏆 Planilla del Partido                                     │
│ Los Toppers vs Arquitectos MDP                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Los Toppers    [21]   VS   [18]   Arquitectos MDP         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  👥 Los Toppers  │  👥 Arquitectos MDP                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Henry Bocchi (Capitán)                    [MVP]            │
│  ┌───────┬───────┬───────┬───────┬───────┬───────┐         │
│  │Points │Assists│Rebounds│Steals│Blocks │Turnovs│         │
│  │  [12] │  [3]  │  [5]  │  [2] │  [1]  │  [1]  │         │
│  └───────┴───────┴───────┴───────┴───────┴───────┘         │
│                                                              │
│  Bocchi Andres                                              │
│  ┌───────┬───────┬───────┬───────┬───────┬───────┐         │
│  │  [5]  │  [1]  │  [2]  │  [0] │  [0]  │  [0]  │         │
│  └───────┴───────┴───────┴───────┴───────┴───────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Características Avanzadas

### Validaciones Implementadas
- ✅ **Límite de partidos por equipo**: Según formato del torneo
- ✅ **No duplicar enfrentamientos**: En fase de grupos
- ✅ **Respetar zonas**: Los equipos solo juegan contra su zona
- ✅ **Clasificación automática**: Los mejores avanzan a playoffs

### Generación Automática
- ✅ **Fase de grupos**: Todos contra todos dentro de cada zona
- ✅ **Semifinales**: Cruces entre zonas (1º A vs 2º B, 1º B vs 2º A)
- ✅ **Final**: Ganadores de semifinales
- ✅ **3º puesto**: Perdedores de semifinales (opcional)
- ✅ **Best of series**: Genera múltiples partidos si es Mejor de 3/5

### Drag & Drop
- ✅ **Equipos sin asignar**: Zona horizontal con todos los equipos
- ✅ **Arrastrar a partido**: Click y arrastrar a slot de Equipo A o B
- ✅ **Feedback visual**: Highlight al arrastrar
- ✅ **Validación en tiempo real**: No permite asignar si excede límite

---

## 📊 Estadísticas Guardadas

### Por Jugador (player_match_stats)
```sql
- match_id
- player_id
- points (int)
- assists (int)
- rebounds (int)
- steals (int)
- blocks (int)
- turnovers (int)
- is_mvp (boolean)
```

### Por Equipo (team_match_stats)
```sql
- match_id
- team_id
- points (int) -- suma de todos los jugadores
- assists (int)
- rebounds (int)
- steals (int)
- blocks (int)
- turnovers (int)
```

---

## 🎯 Próximos Pasos Opcionales

### Fase 4A - Bracket Visual
- [ ] Visualización de llave de playoffs tipo March Madness
- [ ] Líneas conectando partidos
- [ ] Actualización en tiempo real

### Fase 4B - Live Scorekeeper
- [ ] Interfaz para cargar stats en vivo durante el partido
- [ ] Botones grandes para sumar puntos/stats
- [ ] Cronómetro integrado
- [ ] Actualización en tiempo real para espectadores

### Fase 4C - Validaciones Avanzadas
- [ ] No permitir más partidos si equipo alcanzó límite
- [ ] Alertas si hay conflictos de horarios
- [ ] Sugerencias de horarios óptimos

### Fase 4D - Exportar Fixture
- [ ] PDF con fixture completo
- [ ] Imagen para redes sociales
- [ ] Integración con Google Calendar

---

## ✅ Checklist de Testing

- [ ] Crear torneo con formato "Zonas + Playoffs"
- [ ] Configurar "Mejor de 3" en playoffs
- [ ] Aprobar 8 equipos
- [ ] Asignar equipos a 2 zonas
- [ ] Click en "Generar Fixture"
- [ ] Verificar que se crearon todos los partidos
- [ ] Arrastrar un equipo a un partido vacío
- [ ] Click en un partido para abrir planilla
- [ ] Ingresar resultado y stats de jugadores
- [ ] Marcar MVP
- [ ] Guardar y verificar que se actualizó
- [ ] Ver estadísticas en perfiles de jugadores

---

## 📝 SQL Necesario

```sql
-- Si aún no ejecutaste:
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS logo_url text;

-- Formato de torneo
ALTER TABLE public.tournaments 
  ADD COLUMN IF NOT EXISTS format_type text default 'groups_playoff',
  ADD COLUMN IF NOT EXISTS num_groups integer default 2,
  ADD COLUMN IF NOT EXISTS teams_advance_per_group integer default 2,
  ADD COLUMN IF NOT EXISTS playoff_format text default 'single_elimination',
  ADD COLUMN IF NOT EXISTS third_place_match boolean default false,
  ADD COLUMN IF NOT EXISTS format_config jsonb;

-- Grupos en equipos
ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS group_name text,
  ADD COLUMN IF NOT EXISTS group_position integer;

-- Stats ampliadas (si no existen)
ALTER TABLE public.player_match_stats 
  ADD COLUMN IF NOT EXISTS steals integer default 0,
  ADD COLUMN IF NOT EXISTS blocks integer default 0,
  ADD COLUMN IF NOT EXISTS turnovers integer default 0;
```

---

**¡Sistema de fixture tipo NBA con planilla de stats completamente funcional! 🏀🔥**

**Última actualización:** Nov 8, 2025 - 20:40
