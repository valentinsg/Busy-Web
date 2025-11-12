# 🎯 BLACKTOP - Próximos Pasos

## ✅ Completado

1. **Migraciones SQL** (4 archivos)
2. **Tipos TypeScript actualizados**
3. **Lógica de negocio** (5 librerías)
4. **API Endpoints** (11 rutas)
5. **LiveScorekeeperV2** con timer persistente

---

## 🚧 Pendiente

### 1. Ejecutar Migraciones SQL

```bash
# En Supabase SQL Editor, ejecutar en orden:
1. supabase/schema/migrations/001_add_match_time_fields.sql
2. supabase/schema/migrations/002_add_tournament_config.sql
3. supabase/schema/migrations/003_create_groups_table.sql
4. supabase/schema/migrations/004_normalize_match_phase.sql
```

### 2. Actualizar TournamentForm

Agregar campos de configuración de tiempo:

```tsx
// components/admin/blacktop/tournament-form.tsx
<FormField
  control={form.control}
  name="period_duration_minutes"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Duración del período (minutos)</FormLabel>
      <FormControl>
        <Input type="number" {...field} />
      </FormControl>
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="periods_count"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Cantidad de períodos</FormLabel>
      <FormControl>
        <Input type="number" {...field} />
      </FormControl>
    </FormItem>
  )}
/>
```

### 3. Actualizar TournamentFixture

Agregar botones para:
- Generar fixture de grupos
- Ver standings
- Avanzar a playoffs
- Simular fase

```tsx
// components/admin/blacktop/tournament-fixture.tsx

const handleGenerateGroupsFixtures = async () => {
  const res = await fetch(`/api/admin/blacktop/tournaments/${tournamentId}/generate-groups-fixtures`, {
    method: 'POST'
  });
  if (res.ok) {
    toast({ title: 'Fixtures de grupos generados' });
    refresh();
  }
};

const handleAdvanceToPlayoffs = async () => {
  const res = await fetch(`/api/admin/blacktop/tournaments/${tournamentId}/advance-to-playoffs`, {
    method: 'POST'
  });
  if (res.ok) {
    toast({ title: 'Avanzado a playoffs' });
    refresh();
  }
};

const handleSimulatePhase = async () => {
  const res = await fetch(`/api/admin/blacktop/tournaments/${tournamentId}/simulate-phase`, {
    method: 'POST'
  });
  if (res.ok) {
    toast({ title: 'Fase simulada' });
    refresh();
  }
};
```

### 4. Reemplazar LiveScorekeeper

```tsx
// Cambiar import en tournament-fixture.tsx
import { LiveScorekeeperV2 } from '@/components/admin/blacktop/live-scorekeeper-v2';

// Pasar tournament como prop
<LiveScorekeeperV2
  match={selectedMatch}
  tournament={tournament}
  open={scorekeeperOpen}
  onClose={() => setScorekeeperOpen(false)}
  onSuccess={refresh}
/>
```

### 5. Crear TournamentStandings Component

```tsx
// components/admin/blacktop/tournament-standings.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import type { StandingsRow, Group } from '@/types/blacktop';

interface TournamentStandingsProps {
  tournamentId: number;
}

export function TournamentStandings({ tournamentId }: TournamentStandingsProps) {
  const [standings, setStandings] = useState<{ group: Group; standings: StandingsRow[] }[]>([]);

  useEffect(() => {
    fetch(`/api/admin/blacktop/tournaments/${tournamentId}/standings`)
      .then(res => res.json())
      .then(data => setStandings(data.standings));
  }, [tournamentId]);

  return (
    <div className="space-y-6">
      {standings.map(({ group, standings: rows }) => (
        <Card key={group.id} className="p-6">
          <h3 className="font-bold text-lg mb-4">{group.display_name}</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground">
                <th>Pos</th>
                <th>Equipo</th>
                <th>PJ</th>
                <th>PG</th>
                <th>PP</th>
                <th>PF</th>
                <th>PC</th>
                <th>Dif</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.team_id} className="border-t">
                  <td className="py-2 font-bold">{idx + 1}</td>
                  <td>{row.team_name}</td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.lost}</td>
                  <td>{row.points_for}</td>
                  <td>{row.points_against}</td>
                  <td className={row.point_diff > 0 ? 'text-green-500' : 'text-red-500'}>
                    {row.point_diff > 0 ? '+' : ''}{row.point_diff}
                  </td>
                  <td className="font-bold">{row.tournament_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );
}
```

### 6. Actualizar TournamentGroupsAssignment

Usar `group_id` en lugar de `group_name`:

```tsx
// components/admin/blacktop/tournament-groups-assignment.tsx

const handleSave = async () => {
  const assignments = [];
  
  Object.entries(groups).forEach(([groupName, teamsList]) => {
    // Obtener group_id desde groups del torneo
    const group = tournamentGroups.find(g => g.name === groupName);
    
    teamsList.forEach((team) => {
      assignments.push({
        teamId: team.id,
        groupId: group?.id, // UUID
      });
    });
  });

  // Actualizar teams con group_id
  for (const assignment of assignments) {
    await fetch(`/api/blacktop/teams/${assignment.teamId}`, {
      method: 'PATCH',
      body: JSON.stringify({ group_id: assignment.groupId }),
    });
  }
};
```

### 7. Testing Completo

```bash
# 1. Crear torneo de prueba
# - Configurar 2 grupos, 4 equipos por grupo
# - period_duration_minutes: 8
# - periods_count: 2

# 2. Asignar equipos a grupos

# 3. Generar fixtures de grupos
POST /api/admin/blacktop/tournaments/[id]/generate-groups-fixtures

# 4. Simular fase de grupos
POST /api/admin/blacktop/tournaments/[id]/simulate-phase

# 5. Ver standings
GET /api/admin/blacktop/tournaments/[id]/standings

# 6. Avanzar a playoffs
POST /api/admin/blacktop/tournaments/[id]/advance-to-playoffs

# 7. Simular playoffs
POST /api/admin/blacktop/tournaments/[id]/simulate-phase

# 8. Ver fixtures completos
GET /api/admin/blacktop/tournaments/[id]/fixtures
```

---

## 📝 Checklist

- [ ] Ejecutar migraciones SQL
- [ ] Actualizar TournamentForm (agregar campos de tiempo)
- [ ] Actualizar TournamentFixture (botones de generación/avance)
- [ ] Reemplazar LiveScorekeeper por LiveScorekeeperV2
- [ ] Crear TournamentStandings component
- [ ] Actualizar TournamentGroupsAssignment (usar group_id)
- [ ] Testing del flujo completo
- [ ] Verificar que el timer se sincroniza correctamente
- [ ] Verificar que los standings se calculan correctamente
- [ ] Verificar que el avance a playoffs funciona

---

## 🎯 Prioridad Inmediata

1. **Ejecutar migraciones SQL** ← CRÍTICO
2. **Reemplazar LiveScorekeeper** ← Funcionalidad core
3. **Actualizar TournamentFixture** ← UX principal

El resto se puede hacer incrementalmente.
