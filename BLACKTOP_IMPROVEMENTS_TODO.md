# Blacktop - Mejoras Pendientes

## ✅ Completadas

1. **Tabs centradas** - Las tabs ahora están centradas con `flex justify-center`
2. **Jugadores clickeables** - Top Anotadores ahora son links a `/blacktop/jugadores/[id]`
3. **Equipos clickeables** - Cards de equipos son links a `/blacktop/equipos/[id]`
4. **Tab "Equipos" simplificada** - Removido el título redundante

## 🔄 En Progreso / Pendientes

### Alta Prioridad

1. **Estadísticas abajo y condicionales**
   - Mover gráficos de estadísticas al final de la página
   - Solo mostrar si hay un jugador seleccionado
   - Archivo: `components/blacktop/tournament-stats-public.tsx`

2. **Reglas MDX no renderiza correctamente**
   - H1, H2, negritas no se ven
   - Necesita componente MDX o markdown parser
   - Archivo: `components/blacktop/tournament-rules.tsx`

3. **Info - Formato del torneo primero**
   - Reordenar contenido en glossary
   - Mostrar formato antes que glosario
   - Archivo: `components/blacktop/tournament-glossary.tsx`

4. **Botón "Inscribí tu equipo" condicional**
   - Ocultar cuando `teams.length >= tournament.max_teams`
   - Archivo: `components/blacktop/tournament-header.tsx`

5. **Sistema MVP del Torneo**
   - Admin puede seleccionar MVP
   - Campo `mvp_player_id` en tabla `tournaments`
   - Distintivo especial en nombre del MVP
   - Cambiar "Últimos Resultados" por "MVP y Campeón" cuando finaliza

6. **Fixture en Admin no muestra resultados**
   - Revisar componente de fixture en admin
   - Archivo: `app/admin/blacktop/[id]/page.tsx`

7. **Zonas en Admin no se guardan**
   - Revisar persistencia de zonas
   - Archivo: `components/admin/blacktop/zone-assignment.tsx`

8. **Upload de logos y fotos**
   - Agregar campos de upload en formulario de inscripción
   - Logos de equipos
   - Fotos de jugadores
   - Integración con Supabase Storage

9. **Premios mejor ubicados**
   - Actualmente en Dashboard/Inicio
   - Considerar moverlos a una sección más destacada

10. **Últimos Resultados no se muestran**
    - Verificar query de partidos completados
    - Puede ser que no hay partidos con `status='completed'`

## 📋 Detalles de Implementación

### MVP System
```sql
-- Agregar a tournaments table
ALTER TABLE tournaments ADD COLUMN mvp_player_id INTEGER REFERENCES players(id);
ALTER TABLE tournaments ADD COLUMN champion_team_id INTEGER REFERENCES teams(id);
ALTER TABLE tournaments ADD COLUMN status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed'));
```

### Upload System
```typescript
// Agregar a TeamRegistrationFormData
interface TeamRegistrationFormData {
  // ... existing fields
  team_logo?: File;
  players: Array<{
    // ... existing fields
    photo?: File;
  }>;
}
```

### MDX Rendering
```tsx
// Usar react-markdown o MDXRemote
import ReactMarkdown from 'react-markdown';

<ReactMarkdown
  components={{
    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
  }}
>
  {tournament.rules}
</ReactMarkdown>
```

## 🎯 Prioridades Sugeridas

1. **Crítico**: Reglas MDX, Botón inscripción condicional
2. **Alto**: MVP system, Upload de imágenes
3. **Medio**: Estadísticas condicionales, Fixture admin
4. **Bajo**: Reordenar Info, Mover premios

## 📝 Notas

- Muchos problemas pueden ser de datos de prueba incompletos
- Verificar que hay partidos completados para "Últimos Resultados"
- Verificar que las zonas se están guardando en la BD
- Considerar agregar logs en admin para debugging
