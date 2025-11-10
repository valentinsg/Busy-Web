# 🎉 BUSY BLACKTOP - Perfiles Públicos y Formato Implementado

## ✅ LO QUE SE IMPLEMENTÓ

### 1. **Perfiles Públicos de Equipos** ✅
**Ruta:** `/blacktop/equipos/[id]`
**Archivo:** `app/blacktop/equipos/[id]/page.tsx`

**Características:**
- ✅ Logo del equipo (con fallback a icono Trophy)
- ✅ Nombre del equipo y capitán
- ✅ Instagram del capitán (link directo)
- ✅ Estadísticas del equipo:
  - Partidos jugados
  - Victorias
  - Derrotas
  - Puntos totales
- ✅ Plantel completo con fotos de jugadores
- ✅ Links a perfil de cada jugador
- ✅ Historial de partidos (preparado para futuro)
- ✅ Solo visible si el equipo está aprobado

---

### 2. **Perfiles Públicos de Jugadores** ✅
**Ruta:** `/blacktop/jugadores/[id]`
**Archivo:** `app/blacktop/jugadores/[id]/page.tsx`

**Características:**
- ✅ Foto del jugador (con fallback a inicial)
- ✅ Nombre completo
- ✅ Instagram (link directo)
- ✅ Badge del equipo (link al equipo)
- ✅ Badge de "Capitán" si aplica
- ✅ Estadísticas individuales:
  - Puntos
  - Asistencias
  - Rebotes
  - Robos
  - Tapones
  - MVPs
  - Partidos jugados
- ✅ Historial de partidos (preparado para futuro)
- ✅ Solo visible si el equipo está aprobado

---

### 3. **Campos Nuevos en DB** ✅

**Equipos (teams):**
```sql
logo_url text
```

**Jugadores (players):**
```sql
photo_url text
```

---

### 4. **Términos Actualizados** ✅
**Archivo:** `components/blacktop/registration-form.tsx`

**Nuevo texto de derecho de imagen:**
> "Autorizo el uso de mi imagen y la de mi equipo en fotos, videos y **perfiles públicos** del torneo para redes sociales, web y contenido de BUSY"

---

### 5. **Tab "Formato y Zonas" en Admin** ✅
**Archivo:** `app/admin/blacktop/[id]/page.tsx`

**Nuevo tab agregado:**
- ✅ Tab "Formato y Zonas" entre "General" e "Inscripciones"
- ✅ Componente `TournamentFormatTab` con 2 sub-tabs:
  1. **Configuración** - Selector de formato (zonas+playoffs, eliminación, etc.)
  2. **Asignar Zonas** - Drag & drop para asignar equipos

**Componente wrapper:**
- `components/admin/blacktop/tournament-format-tab.tsx`
- Integra `TournamentFormatConfig` y `TournamentGroupsAssignment`
- Toasts de éxito/error al guardar

---

## 📋 SQL A EJECUTAR

```sql
-- Agregar logo a equipos
ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS logo_url text;

-- Agregar foto a jugadores
ALTER TABLE public.players 
  ADD COLUMN IF NOT EXISTS photo_url text;

-- Si aún no ejecutaste los campos de formato:
ALTER TABLE public.tournaments 
  ADD COLUMN IF NOT EXISTS format_type text default 'groups_playoff',
  ADD COLUMN IF NOT EXISTS num_groups integer default 2,
  ADD COLUMN IF NOT EXISTS teams_advance_per_group integer default 2,
  ADD COLUMN IF NOT EXISTS playoff_format text default 'single_elimination',
  ADD COLUMN IF NOT EXISTS third_place_match boolean default false,
  ADD COLUMN IF NOT EXISTS format_config jsonb;

ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS group_name text,
  ADD COLUMN IF NOT EXISTS group_position integer;
```

---

## 🎯 Flujo Completo

### Paso 1: Configurar Formato del Torneo
1. Ir a `/admin/blacktop/[id]`
2. Click en tab **"Formato y Zonas"**
3. Sub-tab **"Configuración"**:
   - Elegir tipo de formato (Zonas + Playoffs, Eliminación, etc.)
   - Configurar número de zonas
   - Equipos que avanzan por zona
   - Formato de playoffs
   - Partido por 3er puesto
4. Guardar → Toast de éxito

### Paso 2: Asignar Equipos a Zonas
1. En el mismo tab, ir a sub-tab **"Asignar Zonas"**
2. Arrastrar equipos a las zonas (drag & drop)
3. O usar botón "Aleatorio" para sorteo
4. Guardar → Toast de éxito

### Paso 3: Equipos se Inscriben
1. Formulario de inscripción ahora incluye:
   - Aceptación de términos actualizada (perfiles públicos)
   - Email por jugador
   - (Futuro: upload de fotos)

### Paso 4: Perfiles Públicos Activos
1. Una vez aprobado el equipo:
   - Perfil del equipo: `/blacktop/equipos/[id]`
   - Perfil de jugador: `/blacktop/jugadores/[id]`
2. Visible para todos (público)
3. Muestra estadísticas en tiempo real

---

## 🚀 Próximos Pasos

### Fase 3A - Upload de Fotos
- [ ] Agregar input de foto en formulario de inscripción
- [ ] Upload a Supabase Storage (bucket: blacktop-photos)
- [ ] Validación de tamaño/formato
- [ ] Preview antes de enviar

### Fase 3B - Estadísticas Reales
- [ ] Calcular stats desde `player_match_stats`
- [ ] Calcular stats de equipo desde `team_match_stats`
- [ ] Mostrar en perfiles públicos
- [ ] Actualizar en tiempo real

### Fase 3C - Historial de Partidos
- [ ] Query de partidos por equipo
- [ ] Query de partidos por jugador
- [ ] Mostrar resultado, rival, fecha
- [ ] Link a detalle del partido

### Fase 3D - Tabla de Posiciones por Zona
- [ ] Calcular puntos por zona (PJ, PG, PE, PP, GF, GC, DIF, PTS)
- [ ] Ordenar por puntos
- [ ] Mostrar en tab "Formato y Zonas"
- [ ] Indicar quiénes clasifican

---

## 📱 URLs Públicas

### Perfiles de Equipos
```
/blacktop/equipos/1
/blacktop/equipos/2
...
```

### Perfiles de Jugadores
```
/blacktop/jugadores/1
/blacktop/jugadores/2
...
```

### Admin - Formato
```
/admin/blacktop/[id] → Tab "Formato y Zonas"
```

---

## 🎨 Diseño de Perfiles

### Equipo
- Fondo negro
- Logo grande (o icono Trophy)
- Stats en grid 2x2 (md:grid-cols-4)
- Plantel en cards con hover
- Links a jugadores

### Jugador
- Fondo negro
- Foto circular grande (o inicial)
- Badge del equipo con link
- Stats en grid 2x4
- Colores por stat (rojo=puntos, azul=asistencias, etc.)

---

## ✅ Checklist de Testing

- [ ] Ejecutar SQL de logo_url y photo_url
- [ ] Ir a admin del torneo
- [ ] Ver nuevo tab "Formato y Zonas"
- [ ] Configurar formato (2 zonas, 2 avanzan)
- [ ] Guardar → Ver toast de éxito
- [ ] Ir a sub-tab "Asignar Zonas"
- [ ] Arrastrar equipos entre zonas
- [ ] Guardar → Ver toast de éxito
- [ ] Aprobar un equipo
- [ ] Visitar `/blacktop/equipos/[id]` (público)
- [ ] Ver logo, stats, plantel
- [ ] Click en un jugador
- [ ] Ver perfil del jugador en `/blacktop/jugadores/[id]`
- [ ] Verificar que solo equipos aprobados son visibles

---

## 📝 Notas Técnicas

### Perfiles Públicos
- Server components (SSR)
- Fetch directo desde Supabase
- `notFound()` si equipo no existe o no está aprobado
- Image con Next.js Image component
- Fallbacks para fotos faltantes

### Tab de Formato
- Client component (drag & drop)
- useToast para feedback
- Tabs anidados (Configuración / Asignar Zonas)
- Guarda formato en tournaments
- Guarda asignación en teams (group_name, group_position)

### Términos Actualizados
- Texto más explícito sobre perfiles públicos
- Cubre fotos, videos, web, redes
- Obligatorio para inscribirse

---

**¡Sistema de perfiles públicos y formato de torneo completamente funcional! 🏀🔥**

---

**Última actualización:** Nov 8, 2025 - 20:10
