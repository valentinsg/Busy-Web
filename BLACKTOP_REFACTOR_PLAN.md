# 🎯 BLACKTOP REFACTOR - Plan de Implementación

**Fecha:** 10 Nov 2025  
**Objetivo:** Refactorizar sistema de torneos 3v3 para gestión en vivo y simulación tipo FIFA

---

## 📋 PROBLEMAS IDENTIFICADOS (Resumen)

1. ❌ **Modelo de datos incompleto:** Faltan campos de tiempo (current_period, elapsed_seconds, started_at, paused_at, fouls)
2. ❌ **Sin sistema de fases:** No hay tournament.status para trackear draft/groups/playoffs/finished
3. ❌ **Fixtures frágiles:** Genera playoffs vacíos (TBD vs TBD) desde el inicio
4. ❌ **Sin cálculo de standings:** No hay función para tabla de posiciones con criterios de desempate
5. ❌ **Tipos inconsistentes:** Desajuste entre SQL y TypeScript
6. ❌ **Sin configuración de tiempo:** No hay period_duration_minutes ni periods_count en tournaments
7. ❌ **Timer no persiste:** LiveScorekeeper maneja tiempo en memoria local
8. ❌ **Sin simulación:** No hay endpoints para simular resultados
9. ❌ **Grupos hardcodeados:** 'group_a', 'group_b' no escala
10. ❌ **Sin tabla groups normalizada:** group_name es string libre en teams

---

## 🚀 PLAN DE REFACTORIZACIÓN

### FASE 1: Migraciones SQL (CRÍTICO)

#### 1.1 Agregar campos de tiempo a `matches`
```sql
-- migrations/001_add_match_time_fields.sql
ALTER TABLE public.matches
  ADD COLUMN current_period INTEGER DEFAULT 1,
  ADD COLUMN elapsed_seconds INTEGER DEFAULT 0,
  ADD COLUMN started_at TIMESTAMPTZ,
  ADD COLUMN paused_at TIMESTAMPTZ,
  ADD COLUMN finished_at TIMESTAMPTZ,
  ADD COLUMN fouls_a INTEGER DEFAULT 0,
  ADD COLUMN fouls_b INTEGER DEFAULT 0;
```

#### 1.2 Agregar configuración de tiempo a `tournaments`
```sql
-- migrations/002_add_tournament_config.sql
ALTER TABLE public.tournaments
  ADD COLUMN period_duration_minutes INTEGER DEFAULT 8,
  ADD COLUMN periods_count INTEGER DEFAULT 2,
  ADD COLUMN tournament_status TEXT DEFAULT 'draft' 
    CHECK (tournament_status IN ('draft', 'groups', 'playoffs', 'finished'));
```

#### 1.3 Crear tabla `groups` normalizada
```sql
-- migrations/003_create_groups_table.sql
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id BIGINT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, name)
);

ALTER TABLE public.teams ADD COLUMN group_id UUID REFERENCES public.groups(id);
ALTER TABLE public.matches ADD COLUMN group_id UUID REFERENCES public.groups(id);
```

#### 1.4 Normalizar `matches.round` a `phase`
```sql
-- migrations/004_normalize_match_phase.sql
ALTER TABLE public.matches
  ADD COLUMN phase TEXT CHECK (phase IN ('groups', 'semifinals', 'third_place', 'final'));

UPDATE public.matches SET phase = 
  CASE 
    WHEN round LIKE 'group%' THEN 'groups'
    WHEN round = 'semifinal' THEN 'semifinals'
    WHEN round = 'third_place' THEN 'third_place'
    WHEN round = 'final' THEN 'final'
  END;
```

---

### FASE 2: Actualizar tipos TypeScript

```typescript
// types/blacktop.ts - NUEVOS TIPOS

export type MatchStatus = 'pending' | 'live' | 'halftime' | 'finished' | 'cancelled';
export type TournamentStatus = 'draft' | 'groups' | 'playoffs' | 'finished';
export type MatchPhase = 'groups' | 'semifinals' | 'third_place' | 'final';

export interface Group {
  id: string;
  tournament_id: number;
  name: string;
  display_name: string;
  order_index: number;
  created_at: string;
}

export interface Match {
  // ... campos existentes ...
  phase: MatchPhase;
  group_id?: string;
  current_period: number;
  elapsed_seconds: number;
  started_at?: string;
  paused_at?: string;
  finished_at?: string;
  fouls_a: number;
  fouls_b: number;
}

export interface Tournament {
  // ... campos existentes ...
  period_duration_minutes: number;
  periods_count: number;
  tournament_status: TournamentStatus;
}
```

---

### FASE 3: Implementar lógica de negocio

#### 3.1 Timer desacoplado (`lib/blacktop/timer.ts`)
- `calculateElapsedTime(match)` - Calcula tiempo transcurrido
- `getRemainingSeconds(match, tournament)` - Tiempo restante
- `formatTime(seconds)` - Formatea MM:SS
- `isPeriodFinished(match, tournament)` - Valida fin de período
- `isMatchFinished(match, tournament)` - Valida fin de partido

#### 3.2 Standings (`lib/blacktop/standings.ts`)
- `calculateStandings(tournamentId, groupId)` - Tabla de posiciones
- `getTopTeams(tournamentId, groupId, count)` - Top N clasificados
- Criterios: tournament_points DESC, point_diff DESC, points_for DESC

#### 3.3 Fixtures (`lib/blacktop/fixtures.ts`)
- `generateGroupsFixtures(tournamentId)` - Solo fase de grupos (round-robin)
- `generatePlayoffsFixtures(tournamentId)` - Solo playoffs con clasificados
- `assignTeamToMatch(matchId, teamId, slot)` - Asignar equipo a partido

#### 3.4 Playoffs (`lib/blacktop/playoffs.ts`)
- `advanceToPlayoffs(tournamentId)` - Calcula clasificados y genera SFs + Final
- `validateGroupsComplete(tournamentId)` - Valida que todos los partidos de grupos estén finished

#### 3.5 Simulación (`lib/blacktop/simulation.ts`)
- `simulateMatch(matchId)` - Genera resultado aleatorio
- `simulatePhase(tournamentId)` - Simula todos los partidos pending de la fase actual

---

### FASE 4: Nuevos endpoints API

```typescript
// Control de tiempo
POST   /api/admin/blacktop/matches/[id]/start
POST   /api/admin/blacktop/matches/[id]/pause
POST   /api/admin/blacktop/matches/[id]/resume
POST   /api/admin/blacktop/matches/[id]/end-period
POST   /api/admin/blacktop/matches/[id]/finish

// Actualizar score
PATCH  /api/admin/blacktop/matches/[id]/score
       Body: { team_a_score, team_b_score, fouls_a, fouls_b }

// Fixtures inteligentes
POST   /api/admin/blacktop/tournaments/[id]/generate-groups-fixtures
POST   /api/admin/blacktop/tournaments/[id]/advance-to-playoffs

// Standings
GET    /api/admin/blacktop/tournaments/[id]/standings?groupId=xxx

// Simulación
POST   /api/admin/blacktop/matches/[id]/simulate
POST   /api/admin/blacktop/tournaments/[id]/simulate-phase
```

---

### FASE 5: Refactorizar componentes

#### 5.1 LiveScorekeeper
- Integrar timer desde backend (polling cada 2s)
- Botones: Start, Pause, Resume, End Period, Finish
- Mostrar current_period / periods_count
- Registrar fouls por equipo

#### 5.2 TournamentFixture
- Mostrar partidos agrupados por phase
- Botón "Generar Fixture de Grupos" (solo si tournament_status === 'draft')
- Botón "Avanzar a Playoffs" (solo si todos los partidos de grupos están finished)
- Mostrar standings por grupo

#### 5.3 TournamentFormatTab
- Agregar campos: period_duration_minutes, periods_count
- Generar grupos automáticamente al guardar

---

### FASE 6: Testing

1. **Crear torneo de prueba**
   - 2 grupos, 4 equipos por grupo
   - 2x8 minutos

2. **Generar fixture de grupos**
   - Validar que se crean 12 partidos (6 por grupo)

3. **Simular fase de grupos**
   - Usar endpoint de simulación

4. **Calcular standings**
   - Validar ordenamiento correcto

5. **Avanzar a playoffs**
   - Validar que se crean 4 partidos (2 SFs + Final + 3er puesto)
   - Validar que los clasificados son correctos

6. **Simular playoffs**
   - Validar que se determina el campeón

---

## 📊 ESTRUCTURA DE RESPUESTA DE FIXTURES

```typescript
// GET /api/admin/blacktop/tournaments/[id]/fixtures
{
  tournament: Tournament,
  groups: [
    {
      group: Group,
      teams: Team[],
      matches: Match[],
      standings: StandingsRow[]
    }
  ],
  playoffs: {
    semifinals: Match[],
    third_place: Match | null,
    final: Match | null
  }
}
```

---

## 🎯 ORDEN DE IMPLEMENTACIÓN

1. ✅ Ejecutar migraciones SQL (FASE 1)
2. ✅ Actualizar tipos TypeScript (FASE 2)
3. ✅ Implementar lib/blacktop/* (FASE 3)
4. ✅ Crear nuevos endpoints API (FASE 4)
5. ✅ Refactorizar componentes (FASE 5)
6. ✅ Testing completo (FASE 6)

---

## 💡 PRÓXIMOS PASOS INMEDIATOS

1. **Revisar y aprobar este plan**
2. **Ejecutar migraciones SQL en Supabase**
3. **Actualizar types/blacktop.ts**
4. **Implementar lib/blacktop/timer.ts**
5. **Implementar lib/blacktop/standings.ts**

---

**¿Listo para comenzar la implementación?**
