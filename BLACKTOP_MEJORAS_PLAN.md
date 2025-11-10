# BLACKTOP - Plan de Mejoras

## ✅ Cambios en Base de Datos (SQL)

### Completados:
1. ✅ Agregar estadísticas ampliadas a `player_match_stats`: steals, blocks, turnovers
2. ✅ Crear tabla `team_match_stats` para estadísticas de equipos
3. ✅ Agregar campo `email` a tabla `players`
4. ✅ RLS policies para `team_match_stats`

### Pendientes:
- Campo `accept_image_rights` en `teams` (para formulario)

---

## 📝 Cambios Pendientes por Implementar

### 1. **Componentes Admin - Inscripciones**
**Archivo**: `components/admin/blacktop/tournament-teams.tsx`
- [ ] Cambiar a grid de 2 columnas (`grid-cols-2`)
- [ ] Agregar botón "Editar" por equipo
- [ ] Modal de edición de equipo con todos los campos editables
- [ ] Permitir editar jugadores (nombre, Instagram, email)

### 2. **Tab General - Mover Premios**
**Archivo**: `components/admin/blacktop/tournament-overview.tsx`
- [ ] Agregar sección de Premios en el overview
- [ ] Mostrar `prizes_title` y `prizes_description`
- [ ] Permitir edición inline o modal

### 3. **Reglamento con Markdown**
**Archivos**: 
- `components/admin/blacktop/tournament-form.tsx`
- `components/blacktop/tournament-rules.tsx`
- [ ] Instalar `react-markdown` y `remark-gfm`
- [ ] Renderizar `rules_content` con Markdown
- [ ] Soportar: h1, h2, h3, bold, italic, listas, links

### 4. **Estadísticas Ampliadas**
**Archivos**:
- `lib/repo/blacktop.ts`
- `components/admin/blacktop/tournament-stats.tsx` (NUEVO)
- `components/blacktop/tournament-leaderboard-public.tsx`

**Funcionalidades**:
- [ ] Actualizar `getTournamentLeaderboard()` con todas las stats
- [ ] Crear `getTeamLeaderboard()` para estadísticas de equipos
- [ ] Filtros: "Mejores del torneo" vs "Por equipo"
- [ ] Ordenar por: Puntos, Rebotes, Asistencias, Robos, Tapones
- [ ] Mostrar stats de jugadores Y equipos en tabs separados

### 5. **Formulario de Inscripción Mejorado**
**Archivo**: `components/blacktop/registration-form.tsx`
- [ ] Agregar campo `email` por jugador
- [ ] Checkbox "Acepto derecho de imagen" (obligatorio)
- [ ] Mostrar reglamento del torneo en el formulario
- [ ] Validar que todos los jugadores tengan email

### 6. **Fixture - Validación de Equipos**
**Archivo**: `components/admin/blacktop/tournament-fixture.tsx`
- [ ] Deshabilitar creación de partidos si no hay equipos aprobados
- [ ] Mensaje: "Debes aprobar equipos antes de crear el fixture"
- [ ] Mostrar contador de equipos aprobados

### 7. **Planilla de Partido en Tiempo Real** (NUEVO)
**Archivos**:
- `app/admin/blacktop/[id]/match/[matchId]/page.tsx` (NUEVO)
- `components/admin/blacktop/match-scorekeeper.tsx` (NUEVO)

**Funcionalidades**:
- [ ] Interfaz de carga de estadísticas en vivo
- [ ] Autocompletado de jugadores del partido
- [ ] Botones rápidos: +2pts, +3pts, Rebote, Asistencia, Robo, Tapón, Pérdida
- [ ] Actualización en tiempo real del marcador
- [ ] Guardar estadísticas por jugador y equipo
- [ ] Determinar ganador automáticamente

### 8. **Reorganización Visual Admin**
**Archivo**: `app/admin/blacktop/[id]/page.tsx`
- [ ] Mejorar tabs con iconos
- [ ] Tab "Estadísticas" separado de "Fixture"
- [ ] Orden sugerido:
  1. General (info + premios)
  2. Inscripciones
  3. Fixture
  4. Estadísticas (jugadores + equipos)
  5. Galería

---

## 🎯 Prioridades de Implementación

### **Fase 1 - Crítico** (Hacer ahora)
1. Grid 2 columnas en inscripciones
2. Edición de equipos/jugadores
3. Email obligatorio en formulario
4. Derecho de imagen en formulario
5. Mostrar reglamento en formulario

### **Fase 2 - Importante** (Siguiente)
6. Markdown en reglamento
7. Premios en tab General
8. Estadísticas ampliadas (6 stats)
9. Leaderboard de equipos
10. Filtros en estadísticas

### **Fase 3 - Avanzado** (Después)
11. Planilla de partido en tiempo real
12. Validación de fixture
13. Reorganización visual

---

## 📦 Dependencias Nuevas

```bash
pnpm add react-markdown remark-gfm
```

---

## 🔄 Migraciones SQL Necesarias

```sql
-- Agregar campos faltantes
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS accept_image_rights boolean default false;

-- Ya creadas:
-- ✅ team_match_stats
-- ✅ steals, blocks, turnovers en player_match_stats
-- ✅ email en players
```

---

## ✅ Checklist de Testing

- [ ] Crear torneo
- [ ] Inscribir equipo con emails
- [ ] Aprobar equipo
- [ ] Editar equipo/jugadores
- [ ] Crear fixture
- [ ] Cargar estadísticas completas
- [ ] Ver leaderboard jugadores
- [ ] Ver leaderboard equipos
- [ ] Filtrar por equipo
- [ ] Renderizar reglamento con Markdown
- [ ] Planilla de partido en vivo

---

**Siguiente paso**: Implementar Fase 1 (crítico)
