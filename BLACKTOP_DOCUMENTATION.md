# BUSY BLACKTOP - Sistema de Torneos 3v3

Sistema completo para gestionar torneos de básquet 3v3 con inscripciones, fixture, estadísticas y galería.

## 🏀 Características

### Panel Admin
- **Gestión de torneos**: Crear, editar y eliminar torneos
- **Configuración flexible**: Premios, reglamento, colores, fechas
- **Gestión de inscripciones**: Aprobar/rechazar equipos
- **Fixture**: Crear partidos, zonas, semifinales, finales
- **Estadísticas**: Cargar puntos, MVPs, asistencias
- **Galería**: Subir fotos del evento

### Formulario Público
- **Inscripción por torneo**: URL única `/blacktop/[slug]/inscripcion`
- **Validación inteligente**: Detecta equipos duplicados
- **Normalización**: Maneja errores comunes en nombres
- **Confirmación automática**: Mensajes personalizados

### HUB Público
- **Header dinámico**: Nombre, fecha, ubicación, CTA
- **Premios**: Configurable desde admin
- **Equipos**: Listado con jugadores e Instagram
- **Reglamento**: Texto + código de conducta
- **Fixture**: Grupos, semifinales, finales con resultados
- **Leaderboard**: Goleadores y MVPs
- **Galería**: Fotos del evento

## 📁 Estructura

```
supabase/schema/
  └── blacktop_tournaments.sql          # Schema completo

types/
  └── blacktop.ts                       # Tipos TypeScript

lib/repo/
  └── blacktop.ts                       # Repositorio de datos

app/api/blacktop/
  ├── tournaments/                      # CRUD torneos
  ├── register/                         # Inscripción pública
  ├── teams/[id]/                       # Gestión equipos
  ├── matches/                          # CRUD partidos
  └── media/                            # Galería

app/admin/blacktop/
  ├── page.tsx                          # Listado torneos
  ├── new/page.tsx                      # Crear torneo
  └── [id]/
      ├── page.tsx                      # Detalle torneo (tabs)
      └── edit/page.tsx                 # Editar torneo

components/admin/blacktop/
  ├── tournament-form.tsx               # Formulario CRUD
  ├── tournament-overview.tsx           # Vista general
  ├── tournament-teams.tsx              # Gestión inscripciones
  ├── tournament-fixture.tsx            # Gestión fixture
  └── tournament-gallery.tsx            # Gestión galería

app/blacktop/
  ├── page.tsx                          # Landing principal
  └── [slug]/
      ├── page.tsx                      # HUB público
      └── inscripcion/page.tsx          # Formulario inscripción

components/blacktop/
  ├── tournament-header.tsx             # Header HUB
  ├── tournament-prizes.tsx             # Sección premios
  ├── tournament-teams-list.tsx         # Listado equipos
  ├── tournament-rules.tsx              # Reglamento
  ├── tournament-fixture-public.tsx     # Fixture público
  ├── tournament-leaderboard-public.tsx # Estadísticas
  ├── tournament-gallery-public.tsx     # Galería pública
  └── registration-form.tsx             # Formulario inscripción
```

## 🗄️ Base de Datos

### Tablas principales

#### `tournaments`
- Información del torneo (nombre, slug, fecha, ubicación)
- Configuración (max_teams, players_per_team_min/max)
- Inscripciones (registration_open, registration_start/end)
- Estética (primary_color, accent_color)
- Contenido (prizes, rules)

#### `teams`
- Datos del equipo (name, captain_instagram, email, phone)
- Estado (pending, approved, rejected)
- Relación con tournament

#### `players`
- Datos del jugador (full_name, instagram_handle)
- Relación con team y tournament
- Flags (is_captain, consent_media)

#### `matches`
- Fixture (team_a, team_b, round, match_number)
- Resultados (team_a_score, team_b_score, winner)
- Estado (scheduled, in_progress, completed)

#### `player_match_stats`
- Estadísticas por partido (points, assists, rebounds)
- MVP del partido

#### `tournament_media`
- Galería de fotos/videos
- Caption y orden de visualización

#### `player_profiles` (opcional)
- Perfil global por Instagram handle
- Estadísticas históricas

## 🚀 Uso

### 1. Ejecutar migración SQL

```bash
# Ejecutar en Supabase SQL Editor
supabase/schema/blacktop_tournaments.sql
```

### 2. Crear torneo desde admin

1. Ir a `/admin/blacktop`
2. Click en "Nuevo torneo"
3. Completar formulario:
   - **Nombre**: BUSY BLACKTOP #1
   - **Slug**: busy-blacktop-1 (auto-generado)
   - **Fecha/hora/ubicación**
   - **Max equipos**: 8
   - **Jugadores por equipo**: 3-4
   - **Premios**: Descripción de premios
   - **Reglamento**: Texto o URL
   - **Colores**: Negro (#000000) y Rojo (#ef4444)
4. Activar "Inscripciones abiertas"
5. Guardar

### 3. Compartir formulario de inscripción

URL generada automáticamente:
```
/blacktop/busy-blacktop-1/inscripcion
```

Compartir por:
- QR code
- Instagram Stories
- WhatsApp
- Link directo

### 4. Gestionar inscripciones

1. Ir a `/admin/blacktop/[id]`
2. Tab "Inscripciones"
3. Ver equipos pendientes
4. Aprobar o rechazar
5. Equipos aprobados aparecen en HUB público

### 5. Crear fixture

1. Tab "Fixture"
2. Click "Nuevo partido"
3. Seleccionar equipos
4. Elegir ronda (Grupo A, Grupo B, Semifinal, Final)
5. Asignar hora
6. Guardar

### 6. Cargar resultados

1. Editar partido existente
2. Ingresar puntos de cada equipo
3. Sistema determina ganador automáticamente
4. Resultados aparecen en HUB público

### 7. Subir fotos

1. Tab "Galería"
2. Click "Agregar imagen"
3. Ingresar URL de imagen
4. Agregar caption (opcional)
5. Fotos aparecen en HUB público

## 🎨 Personalización

### Colores del torneo

Cada torneo tiene colores personalizables:
- **Primary color**: Fondo principal (default: negro)
- **Accent color**: Acentos y CTAs (default: rojo)

Se aplican automáticamente en:
- Header del HUB
- Botones de inscripción
- Bordes de cards
- Títulos de secciones
- Estadísticas

### Estética BLACKTOP

- Tipografía: Abstract Slab (fuente Busy)
- Fondo oscuro con overlays
- Efectos de blur y transparencia
- Hover effects con scale
- Mobile-first responsive

## 🔒 Seguridad

### RLS Policies

- **Torneos**: Públicos si `is_hidden = false`
- **Equipos**: Públicos si `status = approved`
- **Jugadores**: Públicos si equipo aprobado
- **Partidos**: Todos públicos
- **Estadísticas**: Todas públicas
- **Galería**: Toda pública

### Validaciones

- Mínimo de jugadores por equipo
- Máximo de jugadores por equipo
- Aceptación de reglamento obligatoria
- Normalización de nombres e Instagram handles
- Detección de equipos duplicados

## 📊 Funcionalidades avanzadas

### Normalización de equipos

El sistema detecta equipos duplicados normalizando:
- Mayúsculas/minúsculas
- Espacios extras
- Caracteres especiales

Ejemplo:
- "Los Imparables" = "los imparables" = "LOS  IMPARABLES"

### Normalización de Instagram

Limpia handles automáticamente:
- Quita `@`
- Convierte a minúsculas
- Quita espacios

### Perfiles de jugadores

Cada jugador se identifica por su Instagram handle.
Futuro: Estadísticas históricas por jugador.

### Leaderboard dinámico

Calcula automáticamente:
- Goleadores (total_points)
- MVPs (mvp_count)
- Asistencias (total_assists)
- Rebotes (total_rebounds)

## 🔄 Flujo completo

1. **Admin crea torneo** → Configura todo desde panel
2. **Comparte link/QR** → Jugadores se inscriben
3. **Admin aprueba equipos** → Aparecen en HUB público
4. **Admin crea fixture** → Partidos programados
5. **Se juega el torneo** → Admin carga resultados en vivo
6. **Admin sube fotos** → Galería pública
7. **Leaderboard automático** → Stats de jugadores

## 🎯 Roadmap futuro

- [ ] Notificaciones push para inscripciones
- [ ] Live scoring (actualización en tiempo real)
- [ ] Streaming integrado
- [ ] Bracket visualization
- [ ] Player profiles con historial
- [ ] Ranking global de jugadores
- [ ] Integración con Instagram API
- [ ] Generación automática de fixture
- [ ] Exportar resultados a PDF
- [ ] Sistema de pagos para inscripciones

## 📱 URLs importantes

- **Landing**: `/blacktop`
- **HUB torneo**: `/blacktop/[slug]`
- **Inscripción**: `/blacktop/[slug]/inscripcion`
- **Admin**: `/admin/blacktop`
- **Detalle admin**: `/admin/blacktop/[id]`

## 🎨 Ejemplo de configuración

```typescript
{
  name: "BUSY BLACKTOP #1",
  slug: "busy-blacktop-1",
  description: "Primer torneo 3v3 en Mar del Plata",
  location: "Cancha BUSY, Mar del Plata",
  date: "2024-12-15",
  time: "18:00",
  max_teams: 8,
  players_per_team_min: 3,
  players_per_team_max: 4,
  registration_open: true,
  primary_color: "#000000",
  accent_color: "#ef4444",
  prizes_description: `
🏆 Campeones: 3 remeras BUSY + cortes de pelo
🥈 Subcampeones: Vermut para el equipo
⭐ MVP: Tatuaje
  `,
  rules_content: `
- Partidos a 21 puntos o 10 minutos
- Canastas de 2 y 3 puntos
- Faltas personales: 3 por jugador
- Tiempo muerto: 1 por equipo
  `
}
```

## 💡 Tips

1. **Slug único**: Usa formato `busy-blacktop-N` para múltiples ediciones
2. **Inscripciones**: Deja abiertas hasta 1 día antes
3. **Fixture**: Crea grupos balanceados
4. **Fotos**: Sube durante el evento para engagement
5. **Stats**: Carga resultados inmediatamente después de cada partido
6. **QR**: Genera QR del link de inscripción para posters físicos

---

**BUSY BLACKTOP** - Más que un torneo, una comunidad.
