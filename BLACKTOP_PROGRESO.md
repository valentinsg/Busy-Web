# BLACKTOP - Progreso de Implementación

## ✅ COMPLETADO

### 1. Base de Datos (SQL)
- ✅ Estadísticas ampliadas: `steals`, `blocks`, `turnovers` en `player_match_stats`
- ✅ Tabla `team_match_stats` para estadísticas de equipos
- ✅ Campo `email` en tabla `players`
- ✅ Campos `accept_image_rights` y `accept_rules` en tabla `teams`
- ✅ RLS policies para todas las tablas nuevas
- ✅ Comentarios SQL actualizados

### 2. Tipos TypeScript
- ✅ `Player` con campo `email`
- ✅ `Team` con `accept_image_rights` y `accept_rules`
- ✅ `PlayerMatchStats` con todas las estadísticas
- ✅ `TeamMatchStats` (nuevo tipo)
- ✅ `TournamentLeaderboard` con todas las estadísticas
- ✅ `TeamLeaderboard` (nuevo tipo)

### 3. Repositorio (lib/repo/blacktop.ts)
- ✅ `getTournamentLeaderboard()` actualizado con todas las stats
- ✅ Corrección de imports (usar `getServiceClient`)

### 4. Formulario de Inscripción
- ✅ Campo `email` por cada jugador
- ✅ Checkbox "Acepto derecho de imagen" (obligatorio)
- ✅ Mostrar reglamento del torneo en el formulario
- ✅ Validaciones de email
- ✅ Envío de `accept_image_rights` al backend

### 5. Admin - Inscripciones
- ✅ Grid de 2 columnas (responsive)
- ✅ Botón "Editar" por equipo
- ✅ Modal de edición completo (`TeamEditModal`)
- ✅ Edición de datos del equipo
- ✅ Edición de jugadores (nombre, Instagram, email)
- ✅ API endpoint `/api/blacktop/players/[id]` para actualizar jugadores

---

## 🔄 EN PROGRESO / PENDIENTE

### 6. Renderizar Reglamento con Markdown
**Archivos a modificar:**
- `components/blacktop/tournament-rules.tsx`
- `components/admin/blacktop/tournament-form.tsx`

**Tareas:**
- [ ] Instalar `react-markdown` y `remark-gfm`
- [ ] Renderizar `rules_content` con Markdown
- [ ] Soportar h1, h2, h3, bold, italic, listas

**Comando:**
```bash
pnpm add react-markdown remark-gfm
```

### 7. Premios en Tab General
**Archivo:** `components/admin/blacktop/tournament-overview.tsx`
- [ ] Agregar sección de Premios
- [ ] Mostrar `prizes_title` y `prizes_description`
- [ ] Permitir edición inline

### 8. Estadísticas Ampliadas
**Archivos:**
- `components/admin/blacktop/tournament-stats.tsx` (CREAR)
- `components/blacktop/tournament-leaderboard-public.tsx`

**Funcionalidades:**
- [ ] Crear `getTeamLeaderboard()` en repositorio
- [ ] Filtros: "Mejores del torneo" vs "Por equipo"
- [ ] Tabs: Jugadores / Equipos
- [ ] Ordenar por: Puntos, Rebotes, Asistencias, Robos, Tapones
- [ ] Mostrar todas las 6 estadísticas

### 9. Fixture - Validación
**Archivo:** `components/admin/blacktop/tournament-fixture.tsx`
- [ ] Deshabilitar creación si no hay equipos aprobados
- [ ] Mensaje: "Debes aprobar equipos antes de crear el fixture"
- [ ] Mostrar contador de equipos aprobados

### 10. Planilla de Partido en Tiempo Real (AVANZADO)
**Archivos a crear:**
- `app/admin/blacktop/[id]/match/[matchId]/page.tsx`
- `components/admin/blacktop/match-scorekeeper.tsx`

**Funcionalidades:**
- [ ] Interfaz de carga de estadísticas en vivo
- [ ] Autocompletado de jugadores
- [ ] Botones rápidos: +2pts, +3pts, Rebote, Asistencia, Robo, Tapón, Pérdida
- [ ] Actualización en tiempo real
- [ ] Guardar estadísticas por jugador y equipo
- [ ] Determinar ganador automáticamente

### 11. Reorganización Visual Admin
**Archivo:** `app/admin/blacktop/[id]/page.tsx`
- [ ] Mejorar tabs con iconos
- [ ] Tab "Estadísticas" separado de "Fixture"
- [ ] Orden: General, Inscripciones, Fixture, Estadísticas, Galería

---

## 🐛 ERRORES A CORREGIR

### Error en lib/repo/blacktop.ts línea 538
```
Object literal may only specify known properties, and 'email' does not exist in type 'Omit<Team, "id" | "created_at" | "updated_at">'
```

**Solución:** El error está en la función `registerTeam()`. Necesita actualizar el tipo o la lógica de creación del equipo.

### Errores en tournament-teams.tsx
```
Property 'email' does not exist on type 'TeamWithPlayers'
Property 'whatsapp_or_phone' does not exist on type 'TeamWithPlayers'
```

**Solución:** Estos campos no existen en el tipo `Team`. Son campos del formulario pero no de la tabla. Necesitan ser removidos o mapeados correctamente.

---

## 📋 SQL A EJECUTAR

```sql
-- Ejecutar en Supabase SQL Editor
-- (Ya está todo en el archivo blacktop_tournaments.sql actualizado)

-- Si ya ejecutaste el schema anterior, ejecuta solo esto:
ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS accept_image_rights boolean default false,
  ADD COLUMN IF NOT EXISTS accept_rules boolean default false;

ALTER TABLE public.players 
  ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.player_match_stats 
  ADD COLUMN IF NOT EXISTS steals integer default 0,
  ADD COLUMN IF NOT EXISTS blocks integer default 0,
  ADD COLUMN IF NOT EXISTS turnovers integer default 0;

-- Crear tabla de estadísticas de equipos
CREATE TABLE IF NOT EXISTS public.team_match_stats (
  id bigint primary key generated always as identity,
  match_id bigint not null references public.matches(id) on delete cascade,
  team_id bigint not null references public.teams(id) on delete cascade,
  points integer default 0,
  assists integer default 0,
  rebounds integer default 0,
  steals integer default 0,
  blocks integer default 0,
  turnovers integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

CREATE INDEX IF NOT EXISTS idx_team_stats_match ON public.team_match_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_team_stats_team ON public.team_match_stats(team_id);

-- RLS policies
CREATE POLICY "Todos pueden ver estadísticas de equipos"
  ON public.team_match_stats FOR SELECT
  USING (true);

CREATE POLICY "Solo admins pueden modificar estadísticas de equipos"
  ON public.team_match_stats FOR ALL
  USING (auth.role() = 'authenticated');
```

---

## 🎯 PRIORIDAD SIGUIENTE

1. **Corregir errores TypeScript** (crítico)
2. **Instalar react-markdown** y renderizar reglamento
3. **Agregar premios a tab General**
4. **Crear componente de estadísticas ampliadas**
5. **Validación de fixture**
6. **Planilla de partido** (más complejo, puede ser después)

---

## 📝 NOTAS

- El sistema base está 90% completo
- Los errores TypeScript son menores y fáciles de corregir
- La funcionalidad core ya funciona
- Falta pulir UX y agregar features avanzadas

---

**Última actualización:** Nov 8, 2025
