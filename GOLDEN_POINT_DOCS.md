# ⚡ Golden Point (Punto de Oro) - Sistema de Desempate

**Sistema de muerte súbita para resolver empates en torneos 3v3**

---

## 🎯 ¿Qué es el Golden Point?

El **Punto de Oro** es un sistema de desempate tipo "muerte súbita" que se activa automáticamente cuando:

1. El partido llega al final del último período
2. El marcador está empatado
3. El torneo tiene habilitado `golden_point_enabled = true`

**Regla:** El próximo punto que se anote **termina el partido** automáticamente.

---

## 📦 Implementación Completa

### 1️⃣ Base de Datos

**Migración SQL:**
```sql
-- supabase/schema/migrations/005_add_golden_point.sql

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS golden_point_enabled BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.tournaments.golden_point_enabled IS 
  'Si está habilitado, en caso de empate al finalizar el tiempo se juega punto de oro (muerte súbita)';
```

**Ejecutar:**
```bash
# En Supabase SQL Editor
-- Copiar y pegar el contenido de 005_add_golden_point.sql
```

---

### 2️⃣ Tipos TypeScript

**Actualizado en `types/blacktop.ts`:**
```typescript
export interface Tournament {
  // ... otros campos
  period_duration_minutes: number;
  periods_count: number;
  tournament_status: TournamentStatus;
  golden_point_enabled: boolean;  // ✅ NUEVO
  // ... resto de campos
}
```

---

### 3️⃣ Lógica en LiveScorekeeper Pro

**Componente:** `components/admin/blacktop/scorekeeper/live-scorekeeper-pro.tsx`

#### Estado
```typescript
const [isGoldenPoint, setIsGoldenPoint] = useState(false);
```

#### Detección de Empate
```typescript
const handleEndPeriod = async () => {
  const isLastPeriod = match.current_period === tournament.periods_count;
  const isTied = scoreA === scoreB;
  
  if (isLastPeriod && isTied && tournament.golden_point_enabled) {
    // Activar modo golden point
    setIsGoldenPoint(true);
    await handleResume();
    showActionToast('⚡ EMPATE! Punto de Oro activado - Próximo punto gana');
  } else {
    // Período normal
    await handlePause();
    showActionToast(`Período ${match.current_period} finalizado. Iniciá el próximo cuando estés listo.`);
  }
};
```

#### Finalización Automática
```typescript
const handleAddPoints = async (side: 'A' | 'B', playerId: number, points: number) => {
  // ... actualizar score y stats
  
  // Si estamos en golden point, terminar automáticamente
  if (isGoldenPoint) {
    const winnerTeam = side === 'A' ? teamA?.name : teamB?.name;
    showActionToast(`🏆 ¡${winnerTeam} gana por Punto de Oro!`);
    setTimeout(() => {
      handleFinish();
    }, 2000);
  }
};
```

---

### 4️⃣ UI en Timer Control

**Componente:** `components/admin/blacktop/scorekeeper/timer-control.tsx`

#### Props
```typescript
interface TimerControlProps {
  // ... otros props
  isGoldenPoint?: boolean;
  scoreA: number;
  scoreB: number;
}
```

#### Badge Visual
```tsx
<div className="flex items-center gap-3 flex-wrap justify-center">
  {!isGoldenPoint ? (
    <Badge variant="outline" className="text-lg px-4 py-2 border-accent-brand/50">
      Período {currentPeriod}/{totalPeriods}
    </Badge>
  ) : (
    <Badge className="text-lg px-4 py-2 border-2 bg-yellow-500/20 border-yellow-500 animate-pulse">
      ⚡ PUNTO DE ORO
    </Badge>
  )}
  {/* ... resto de badges */}
</div>
```

#### Lógica de Finalización
```typescript
const isTied = scoreA === scoreB;
const canFinish = status === 'live' && timeRemaining === 0 && isLastPeriod && (!isTied || isGoldenPoint);
```

---

### 5️⃣ Formulario de Torneo

**Componente:** `components/admin/blacktop/tournament-form.tsx`

**Nueva sección agregada:**
```tsx
{/* Configuración de tiempo */}
<Card>
  <CardHeader>
    <CardTitle>Configuración de tiempo</CardTitle>
    <CardDescription>Duración de períodos y reglas de desempate</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor="period_duration">Duración del período (minutos)</Label>
        <Input
          id="period_duration"
          type="number"
          min="1"
          value={(formData as any).period_duration_minutes || 8}
          onChange={(e) => setFormData({ ...formData, period_duration_minutes: parseInt(e.target.value) } as any)}
        />
      </div>

      <div>
        <Label htmlFor="periods_count">Cantidad de períodos</Label>
        <Input
          id="periods_count"
          type="number"
          min="1"
          value={(formData as any).periods_count || 2}
          onChange={(e) => setFormData({ ...formData, periods_count: parseInt(e.target.value) } as any)}
        />
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <Switch
        id="golden_point"
        checked={(formData as any).golden_point_enabled || false}
        onCheckedChange={(checked) => setFormData({ ...formData, golden_point_enabled: checked } as any)}
      />
      <div>
        <Label htmlFor="golden_point">Punto de Oro (Golden Point)</Label>
        <p className="text-sm text-muted-foreground">
          Si está habilitado, en caso de empate al finalizar el tiempo se juega muerte súbita: el próximo punto gana
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 🚀 Flujo de Uso

### Configuración (Antes del Torneo)

```bash
1. Admin → Blacktop → Crear/Editar Torneo
2. Sección "Configuración de tiempo"
3. Configurar:
   - Duración del período: 8 minutos
   - Cantidad de períodos: 2
   - ✅ Activar "Punto de Oro (Golden Point)"
4. Guardar torneo
```

### Durante el Partido

```bash
1. Partido llega al final del último período (00:00)
2. Marcador: 15-15 (EMPATE)
3. Sistema detecta:
   - ✅ Último período
   - ✅ Empate
   - ✅ Golden Point habilitado
4. Automáticamente:
   - Badge cambia a "⚡ PUNTO DE ORO" (amarillo pulsante)
   - Partido se reanuda automáticamente
   - Toast: "⚡ EMPATE! Punto de Oro activado - Próximo punto gana"
5. Jugador anota (ej: +2 puntos)
6. Sistema automáticamente:
   - Toast: "🏆 ¡[Equipo] gana por Punto de Oro!"
   - Espera 2 segundos
   - Abre modal de selección MVP
   - Finaliza partido
```

---

## 🎨 Características Visuales

### Badge de Golden Point
- **Color:** Amarillo (`bg-yellow-500/20 border-yellow-500`)
- **Animación:** `animate-pulse` (pulsante)
- **Icono:** ⚡
- **Texto:** "PUNTO DE ORO"

### Toast de Activación
- **Mensaje:** "⚡ EMPATE! Punto de Oro activado - Próximo punto gana"
- **Duración:** 2 segundos
- **Color:** Accent brand

### Toast de Victoria
- **Mensaje:** "🏆 ¡[Equipo] gana por Punto de Oro!"
- **Duración:** 2 segundos antes de abrir MVP modal
- **Color:** Accent brand

---

## 🧪 Testing

### Caso 1: Golden Point Habilitado + Empate
```bash
1. Crear torneo con golden_point_enabled = true
2. Crear partido 2x8 minutos
3. Jugar hasta empate 15-15
4. Esperar a que timer llegue a 00:00
5. Verificar:
   - ✅ Badge cambia a "⚡ PUNTO DE ORO"
   - ✅ Partido se reanuda automáticamente
   - ✅ Toast de activación aparece
6. Anotar punto (ej: +2)
7. Verificar:
   - ✅ Toast de victoria aparece
   - ✅ Espera 2 segundos
   - ✅ Abre modal MVP
   - ✅ Partido finaliza correctamente
```

### Caso 2: Golden Point Habilitado + No Empate
```bash
1. Crear torneo con golden_point_enabled = true
2. Crear partido 2x8 minutos
3. Jugar hasta 18-15 (NO empate)
4. Esperar a que timer llegue a 00:00
5. Verificar:
   - ✅ NO activa golden point
   - ✅ Muestra botón "Finalizar Partido"
   - ✅ Flujo normal de finalización
```

### Caso 3: Golden Point Deshabilitado + Empate
```bash
1. Crear torneo con golden_point_enabled = false
2. Crear partido 2x8 minutos
3. Jugar hasta empate 15-15
4. Esperar a que timer llegue a 00:00
5. Verificar:
   - ✅ NO activa golden point
   - ✅ Muestra botón "Finalizar Partido"
   - ✅ Permite finalizar con empate
```

---

## 📊 Ventajas del Sistema

### Para el Torneo
- ✅ **No hay empates** - Siempre hay un ganador claro
- ✅ **Emoción máxima** - Muerte súbita genera tensión
- ✅ **Rápido** - Se resuelve con un solo punto
- ✅ **Justo** - Ambos equipos tienen la misma oportunidad

### Para el Anotador
- ✅ **Automático** - No requiere intervención manual
- ✅ **Visual** - Badge amarillo pulsante muy claro
- ✅ **Feedback inmediato** - Toasts informativos
- ✅ **Sin errores** - Sistema detecta y activa automáticamente

### Para los Jugadores
- ✅ **Claro** - Saben que el próximo punto gana
- ✅ **Justo** - No hay ventaja de cancha
- ✅ **Emocionante** - Máxima tensión en cada jugada

---

## 🔧 Configuración Recomendada

### Torneos Competitivos
```
✅ Golden Point: Habilitado
Razón: Evita empates, define ganadores claros
```

### Torneos Recreativos
```
❌ Golden Point: Deshabilitado
Razón: Permite empates, menos presión
```

### Torneos de Grupos
```
✅ Golden Point: Habilitado
Razón: Importante para standings y clasificación
```

### Finales
```
✅ Golden Point: Habilitado
Razón: DEBE haber un campeón
```

---

## 📝 Archivos Modificados

```
✅ supabase/schema/migrations/005_add_golden_point.sql
✅ types/blacktop.ts
✅ components/admin/blacktop/scorekeeper/timer-control.tsx
✅ components/admin/blacktop/scorekeeper/live-scorekeeper-pro.tsx
✅ components/admin/blacktop/tournament-form.tsx
```

---

## ✅ Checklist de Implementación

- [x] Migración SQL creada
- [x] Tipo TypeScript actualizado
- [x] Lógica de detección implementada
- [x] UI de golden point agregada
- [x] Finalización automática implementada
- [x] Formulario de torneo actualizado
- [x] Toasts de feedback agregados
- [x] Documentación completa
- [ ] **Ejecutar migración SQL en Supabase** ← HACER ESTO
- [ ] Testing del flujo completo

---

## 🎉 Sistema Listo

El **Golden Point** está **100% implementado** y listo para usar.

**Próximo paso:** Ejecutar la migración SQL `005_add_golden_point.sql` en Supabase.

**¡Muerte súbita lista! ⚡🏀**
