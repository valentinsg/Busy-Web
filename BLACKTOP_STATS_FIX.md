# Fix para tournament-stats-public.tsx

El archivo tiene problemas de estructura de JSX con demasiados divs y Cards anidados incorrectamente.

## Problema:
- Hay un Card que se abre en línea 91 pero no se cierra correctamente
- Hay divs anidados de más que causan errores de sintaxis
- Los gráficos necesitan moverse al final

## Solución:
Reescribir la estructura del return para que sea:

```tsx
return (
  <div className="space-y-8 font-body">
    {/* Card de Filtros */}
    <Card>
      <CardHeader>Filtros</CardHeader>
      <CardContent>
        {/* Filtros aquí */}
      </CardContent>
    </Card>

    {/* Card de Tabla de Jugadores */}
    <Card>
      <CardHeader>Jugadores</CardHeader>
      <CardContent>
        {/* Tabla aquí */}
      </CardContent>
    </Card>

    {/* Card de Gráficos al final */}
    {leaderboard.length > 0 && (
      <Card>
        <CardHeader>Gráficos de Rendimiento</CardHeader>
        <CardContent>
          <PlayerStatsChart />
        </CardContent>
      </Card>
    )}
  </div>
);
```

Esto elimina el anidamiento innecesario y pone cada sección en su propio Card.
