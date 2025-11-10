# BUSY BLACKTOP - Quick Start

Guía rápida para poner en marcha tu primer torneo en 5 minutos.

## ⚡ Setup inicial (una sola vez)

### 1. Ejecutar migración SQL

```sql
-- Copiar y pegar en Supabase SQL Editor
-- Archivo: supabase/schema/blacktop_tournaments.sql
```

Esto crea todas las tablas necesarias:
- `tournaments`
- `teams`
- `players`
- `matches`
- `player_match_stats`
- `tournament_media`
- `player_profiles`

### 2. Verificar permisos

Las políticas RLS ya están configuradas:
- ✅ Público puede ver torneos no ocultos
- ✅ Público puede inscribir equipos
- ✅ Solo admins pueden modificar

## 🏀 Crear tu primer torneo

### Paso 1: Ir al admin

```
/admin/blacktop
```

### Paso 2: Click "Nuevo torneo"

### Paso 3: Completar datos básicos

```
Nombre: BUSY BLACKTOP #1
Slug: busy-blacktop-1 (se genera automáticamente)
Descripción: Primer torneo 3v3 en Mar del Plata
Ubicación: Cancha BUSY, Mar del Plata
Fecha: 2024-12-15
Hora: 18:00
```

### Paso 4: Configurar equipos

```
Máximo de equipos: 8
Jugadores mínimo: 3
Jugadores máximo: 4
✅ Inscripciones abiertas
```

### Paso 5: Agregar premios

```
Título: Premios

Descripción:
🏆 Campeones: 3 remeras BUSY + cortes de pelo
🥈 Subcampeones: Vermut para el equipo
⭐ MVP: Tatuaje
```

### Paso 6: Agregar reglamento

```
- Partidos a 21 puntos o 10 minutos
- Canastas de 2 y 3 puntos
- Faltas personales: 3 por jugador
- Tiempo muerto: 1 por equipo
- Respeto entre jugadores obligatorio
```

### Paso 7: Colores (opcional)

```
Color primario: #000000 (negro)
Color de acento: #ef4444 (rojo)
```

### Paso 8: Guardar

¡Listo! Tu torneo está creado.

## 📱 Compartir inscripciones

### URL generada automáticamente:

```
https://busy.com.ar/blacktop/busy-blacktop-1/inscripcion
```

### Compartir por:

1. **Instagram Stories**
   - Crear sticker con link
   - Texto: "INSCRIBÍ TU EQUIPO"

2. **QR Code**
   - Generar QR del link
   - Imprimir para posters físicos

3. **WhatsApp**
   - Enviar link directo a grupos

4. **Post Instagram**
   - Link en bio
   - Comentario fijado con link

## ✅ Gestionar inscripciones

### Ver inscripciones pendientes

```
/admin/blacktop/[id] → Tab "Inscripciones"
```

### Aprobar equipo

1. Ver datos del equipo
2. Click "Aprobar"
3. ✅ Equipo aparece en HUB público

### Rechazar equipo

1. Ver datos del equipo
2. Click "Rechazar"
3. ❌ Equipo no aparece en HUB público

## 🗓️ Crear fixture

### Opción 1: Grupos + Eliminación directa

```
Grupo A (4 equipos):
- Partido 1: Equipo 1 vs Equipo 2
- Partido 2: Equipo 3 vs Equipo 4
- Partido 3: Equipo 1 vs Equipo 3
- Partido 4: Equipo 2 vs Equipo 4
- Partido 5: Equipo 1 vs Equipo 4
- Partido 6: Equipo 2 vs Equipo 3

Grupo B (4 equipos):
- Partido 7-12: Igual que Grupo A

Semifinales:
- Partido 13: 1° Grupo A vs 2° Grupo B
- Partido 14: 1° Grupo B vs 2° Grupo A

Tercer puesto:
- Partido 15: Perdedores semifinales

Final:
- Partido 16: Ganadores semifinales
```

### Opción 2: Eliminación directa simple

```
Cuartos de final:
- Partido 1-4

Semifinales:
- Partido 5-6

Tercer puesto:
- Partido 7

Final:
- Partido 8
```

## 📊 Cargar resultados

### Durante el torneo

1. Ir a partido en fixture
2. Ingresar puntos:
   ```
   Equipo A: 21
   Equipo B: 18
   ```
3. Guardar
4. ✅ Resultado aparece en HUB público

### Cargar MVP (opcional)

1. Tab "Estadísticas"
2. Seleccionar partido
3. Agregar stats de jugador:
   ```
   Jugador: @jugador_instagram
   Puntos: 12
   Asistencias: 3
   Rebotes: 5
   ✅ MVP
   ```

## 📸 Subir fotos

### Durante o después del evento

1. Tab "Galería"
2. Click "Agregar imagen"
3. Ingresar URL:
   ```
   URL: https://supabase.co/storage/v1/object/public/...
   Caption: "Final épica entre Los Imparables y Los Invencibles"
   ```
4. Guardar
5. ✅ Foto aparece en HUB público

## 🎯 Checklist del día del torneo

### Antes del evento

- [ ] Cerrar inscripciones
- [ ] Verificar fixture completo
- [ ] Compartir fixture con equipos
- [ ] Preparar planilla de resultados

### Durante el evento

- [ ] Cargar resultados en tiempo real
- [ ] Tomar fotos de partidos
- [ ] Identificar MVPs
- [ ] Actualizar leaderboard

### Después del evento

- [ ] Subir todas las fotos
- [ ] Verificar estadísticas finales
- [ ] Compartir HUB público en redes
- [ ] Agradecer a participantes

## 🔗 URLs importantes

```
Landing principal:    /blacktop
HUB del torneo:       /blacktop/busy-blacktop-1
Formulario:           /blacktop/busy-blacktop-1/inscripcion
Admin:                /admin/blacktop
Gestión torneo:       /admin/blacktop/[id]
```

## 💬 Mensajes sugeridos

### Instagram Story - Anuncio

```
🏀 BUSY BLACKTOP #1
📅 15 de Diciembre • 18:00
📍 Cancha BUSY, Mar del Plata

3v3 • 8 equipos • Premios

INSCRIBÍ TU EQUIPO 👆
[Link en sticker]
```

### Instagram Post - Premios

```
🏆 PREMIOS BUSY BLACKTOP #1

🥇 Campeones
→ 3 remeras BUSY
→ Cortes de pelo

🥈 Subcampeones
→ Vermut para el equipo

⭐ MVP
→ Tatuaje

¿Te animás?
Link en bio para inscribirte
```

### WhatsApp - Confirmación

```
✅ Equipo confirmado para BUSY BLACKTOP #1

📅 15/12 a las 18:00
📍 Cancha BUSY

Fixture completo:
[link al HUB]

Nos vemos en la cancha 🏀
```

## 🚨 Troubleshooting

### "No puedo crear torneo"
→ Verificar que ejecutaste la migración SQL

### "Inscripciones no funcionan"
→ Verificar que `registration_open = true`

### "Equipos no aparecen en HUB"
→ Deben estar en estado `approved`

### "Leaderboard vacío"
→ Cargar estadísticas de partidos primero

### "Fotos no se ven"
→ Verificar que URL sea pública

## 📞 Soporte

Para dudas o problemas:
- Revisar `BLACKTOP_DOCUMENTATION.md`
- Verificar schema SQL
- Checkear políticas RLS en Supabase

---

¡Listo para tu primer BUSY BLACKTOP! 🏀🔥
