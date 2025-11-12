# 🔧 FIX: Generate Groups Fixtures

**Error:** `null value in column "round" of relation "matches" violates not-null constraint`

---

## 🐛 Problema

Al intentar generar fixtures de grupos, el endpoint fallaba con error 500:

```
POST /api/admin/blacktop/tournaments/1/generate-groups-fixtures 500
Error al generar partidos: null value in column "round" of relation "matches" violates not-null constraint
```

---

## 🔍 Causa

La tabla `matches` tiene una columna `round` con constraint `NOT NULL`, pero el código solo estaba insertando `phase` y `group_id` (columnas nuevas agregadas en migración 004).

**Schema de la tabla:**
```sql
CREATE TABLE public.matches (
  -- ... otros campos
  round TEXT NOT NULL,  -- ❌ Constraint NOT NULL
  phase TEXT,           -- ✅ Columna nueva (nullable)
  group_id UUID,        -- ✅ Columna nueva (nullable)
  -- ... resto de campos
);
```

**Código anterior (incorrecto):**
```typescript
matches.push({
  tournament_id: tournamentId,
  phase: 'groups',        // ✅ OK
  group_id: group.id,     // ✅ OK
  // ❌ FALTA: round (requerido)
  team_a_id: teams[i].id,
  team_b_id: teams[j].id,
  status: 'pending',
  // ...
});
```

---

## ✅ Solución

Agregar el campo `round` al objeto de insert con el nombre del grupo:

**Archivo:** `lib/blacktop/fixtures.ts`

```typescript
matches.push({
  tournament_id: tournamentId,
  phase: 'groups',
  round: group.name,      // ✅ AGREGADO - Requerido por constraint NOT NULL
  group_id: group.id,
  team_a_id: teams[i].id,
  team_b_id: teams[j].id,
  status: 'pending',
  match_number: matchNumber++,
  current_period: 1,
  elapsed_seconds: 0,
  fouls_a: 0,
  fouls_b: 0,
});
```

---

## 🧪 Testing

### Verificar el Fix

```bash
1. Ir a http://localhost:3000/admin/blacktop/1
2. Tab "Fixture"
3. Click "Generar Fixture de Grupos"
4. Verificar:
   - ✅ No hay error 500
   - ✅ Se crean los partidos correctamente
   - ✅ Aparecen en la lista de "Fase de Grupos"
   - ✅ Cada partido tiene asignado su grupo
```

### Verificar en Base de Datos

```sql
-- Ver partidos creados
SELECT id, tournament_id, phase, round, group_id, team_a_id, team_b_id, status
FROM public.matches
WHERE tournament_id = 1 AND phase = 'groups';

-- Debe mostrar:
-- - round: 'group_a', 'group_b', etc. (NOT NULL ✅)
-- - phase: 'groups' (✅)
-- - group_id: UUID del grupo (✅)
```

---

## 📊 Contexto

### Migración 004

La migración `004_normalize_match_phase.sql` agregó las columnas `phase` y `group_id` para normalizar la estructura, pero mantuvo la columna `round` por compatibilidad.

**Estrategia de migración:**
1. Agregar columnas nuevas (`phase`, `group_id`)
2. Migrar datos de `round` → `phase`
3. Mantener `round` como NOT NULL (no se eliminó)

**Por qué no se eliminó `round`:**
- Compatibilidad con código existente
- Evitar breaking changes
- Permitir migración gradual

---

## 🎯 Lección Aprendida

Cuando se agregan columnas nuevas pero se mantienen las antiguas:
- ✅ **Siempre verificar constraints** de columnas existentes
- ✅ **Incluir ambos campos** (viejo y nuevo) en inserts
- ✅ **Revisar migraciones** para entender el estado actual del schema

---

## ✅ Estado

- [x] Error identificado
- [x] Causa encontrada
- [x] Fix aplicado en `lib/blacktop/fixtures.ts`
- [x] Documentación creada
- [ ] Testing en producción

---

**Fix aplicado y listo para usar! 🎉**
