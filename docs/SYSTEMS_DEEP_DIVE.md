# 🔬 Sistemas Internos - Deep Dive

> Documentación técnica detallada de los sistemas core.

---

## 🛒 Motor del Carrito

### Archivos clave

```
hooks/use-cart.ts           # Estado global con Zustand
lib/checkout/promo-engine.ts # Motor de promociones
lib/checkout/totals.ts       # Cálculo de totales
```

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CARRITO (Zustand)                           │
│                         hooks/use-cart.ts                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Estado:                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   items[]   │  │   coupon    │  │ promotions[]│                 │
│  │  CartItem   │  │   Coupon    │  │  Promotion  │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                                     │
│  Acciones:                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  addItem()  │  │removeItem() │  │updateQty()  │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                │                │                         │
│         └────────────────┼────────────────┘                         │
│                          ▼                                          │
│                ┌─────────────────┐                                  │
│                │ recalculate()   │ ← Se ejecuta en cada cambio     │
│                └────────┬────────┘                                  │
│                         │                                           │
│         ┌───────────────┼───────────────┐                          │
│         ▼               ▼               ▼                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                    │
│  │getSubtotal │  │getDiscount │  │ getTotal   │                    │
│  └────────────┘  └────────────┘  └────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Estructura de CartItem

```typescript
interface CartItem {
  product_id: string
  product_name: string
  slug: string
  price: number
  quantity: number
  size: string
  color: string
  image_url: string
  sku: string
}
```

### Ejemplo de Flujo: Agregar Producto

```typescript
// 1. Usuario hace click en "Agregar al carrito"
// components/shop/add-to-cart.tsx

const handleAddToCart = () => {
  addItem(product, selectedSize, selectedColor, quantity)
}

// 2. addItem() en use-cart.ts
addItem: (product, size, color, qty) => {
  set((state) => {
    // Buscar si ya existe
    const existing = state.items.find(
      i => i.product_id === product.id &&
           i.size === size &&
           i.color === color
    )

    if (existing) {
      // Incrementar cantidad
      existing.quantity += qty
    } else {
      // Agregar nuevo item
      state.items.push({
        product_id: product.id,
        product_name: product.name,
        slug: product.slug,
        price: product.price,
        quantity: qty,
        size,
        color,
        image_url: product.images[0],
        sku: `${product.sku}-${size}-${color}`
      })
    }

    return { items: [...state.items] }
  })
}

// 3. Persistencia automática en localStorage
// Zustand middleware: persist({ name: 'busy-cart-storage' })
```

### Cálculo de Totales

```typescript
// lib/checkout/totals.ts

getSubtotal(): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

getDiscount(): number {
  // 1. Aplicar promociones automáticas
  const promoDiscount = calculateAllPromotions(items, promotions)

  // 2. Aplicar cupón si existe
  const couponDiscount = coupon ? applyCoupon(coupon, subtotal) : 0

  return promoDiscount + couponDiscount
}

getShipping(): number {
  const subtotal = getSubtotalAfterDiscount()

  // Envío gratis si supera $100.000
  if (subtotal >= 100000) return 0

  // Envío reducido para Mar del Plata
  if (isMarDelPlata) return 10000

  return 25000
}

getTotal(): number {
  return getSubtotalAfterDiscount() + getShipping()
}
```

---

## 💳 Pipeline de Checkout

### Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CHECKOUT PIPELINE                            │
└─────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │   CARRITO    │
     │  (Zustand)   │
     └──────┬───────┘
            │
            ▼
┌───────────────────────┐
│   /checkout (page)    │
│                       │
│  ┌─────────────────┐  │
│  │ Datos Cliente   │  │
│  │ - Nombre        │  │
│  │ - Email         │  │
│  │ - Teléfono      │  │
│  │ - Dirección     │  │
│  └─────────────────┘  │
│                       │
│  ┌─────────────────┐  │
│  │ Método de Pago  │  │
│  └────────┬────────┘  │
└───────────┼───────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐    ┌─────────┐
│Mercado  │    │Transfer │
│  Pago   │    │  encia  │
└────┬────┘    └────┬────┘
     │              │
     ▼              ▼
┌─────────────┐  ┌─────────────┐
│ API: create │  │ API: create │
│ preference  │  │   order     │
└──────┬──────┘  └──────┬──────┘
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  Redirect   │  │   Orden     │
│  a MP       │  │  PENDING    │
└──────┬──────┘  └──────┬──────┘
       │                │
       ▼                │
┌─────────────┐         │
│  Usuario    │         │
│  paga en MP │         │
└──────┬──────┘         │
       │                │
       ▼                │
┌─────────────┐         │
│  Webhook    │         │
│  /api/mp/   │         │
│  webhook    │         │
└──────┬──────┘         │
       │                │
       ▼                ▼
┌─────────────────────────────┐
│         SUPABASE            │
│                             │
│  ┌─────────────────────┐    │
│  │      orders         │    │
│  │  status: paid/      │    │
│  │         pending     │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │    order_items      │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │     customers       │    │
│  └─────────────────────┘    │
└──────────────┬──────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Email  │ │ Stock  │ │ Notif  │
│ Resend │ │ Update │ │ Admin  │
└────────┘ └────────┘ └────────┘
               │
               ▼
┌─────────────────────────────┐
│  /checkout/success          │
│  /checkout/pending          │
│  /checkout/failure          │
└─────────────────────────────┘
```

### Motor de Promociones

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROMO ENGINE                                     │
│                lib/checkout/promo-engine.ts                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  INPUT:                                                             │
│  ┌─────────────┐     ┌─────────────┐                               │
│  │ CartItem[]  │     │ Promotion[] │                               │
│  └──────┬──────┘     └──────┬──────┘                               │
│         │                   │                                       │
│         └─────────┬─────────┘                                       │
│                   ▼                                                 │
│         ┌─────────────────┐                                         │
│         │ calculateAll    │                                         │
│         │ Promotions()    │                                         │
│         └────────┬────────┘                                         │
│                  │                                                  │
│    ┌─────────────┼─────────────┬─────────────┐                     │
│    ▼             ▼             ▼             ▼                     │
│ ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐                       │
│ │ NxM  │    │ %OFF │    │ $OFF │    │Combo │                       │
│ │ 2x1  │    │ 20%  │    │$5000 │    │Bundle│                       │
│ └──┬───┘    └──┬───┘    └──┬───┘    └──┬───┘                       │
│    │           │           │           │                            │
│    └───────────┴───────────┴───────────┘                            │
│                      │                                              │
│                      ▼                                              │
│            ┌─────────────────┐                                      │
│            │ AppliedPromo[]  │                                      │
│            │                 │                                      │
│            │ - type          │                                      │
│            │ - discount      │                                      │
│            │ - description   │                                      │
│            │ - affectedItems │                                      │
│            └─────────────────┘                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Tipos de Promoción

| Tipo | Ejemplo | Lógica |
|------|---------|--------|
| `nxm` | 2x1, 3x2 | Compra N, paga M. El más barato gratis |
| `percentage_off` | 20% OFF | Porcentaje sobre productos elegibles |
| `fixed_amount` | $5000 OFF | Monto fijo si cumple mínimo |
| `combo` | Remera + Pantalón = 15% | Descuento si compra combo específico |
| `bundle` | 3 remeras = 25% | Descuento por cantidad del mismo tipo |
| `nth_unit_discount` | 2da unidad 50% | La N-ésima unidad con descuento |

### Flujo de Mercado Pago

```typescript
// 1. Usuario elige "Pagar con Mercado Pago"
// components/checkout/pay-with-mercadopago.tsx

// 2. Se crea la preferencia
// POST /api/mp/create-preference
const preference = await mp.preferences.create({
  items: cartItems.map(item => ({
    title: item.product_name,
    quantity: item.quantity,
    unit_price: item.price,
  })),
  back_urls: {
    success: `${baseUrl}/checkout/success`,
    failure: `${baseUrl}/checkout/failure`,
    pending: `${baseUrl}/checkout/pending`,
  },
  external_reference: orderId,
  notification_url: `${baseUrl}/api/mp/webhook`,
})

// 3. Redirect a MP
window.location.href = preference.init_point

// 4. Usuario paga en MP...

// 5. MP envía webhook
// POST /api/mp/webhook
export async function POST(req: Request) {
  const { type, data } = await req.json()

  if (type === 'payment') {
    const payment = await mp.payment.get(data.id)

    if (payment.status === 'approved') {
      // Actualizar orden
      await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', payment.external_reference)

      // Descontar stock
      await updateStock(orderId)

      // Enviar email
      await sendEmail({ template: 'order-confirmed', ... })

      // Notificar admin
      await createNotification({ type: 'new_order', ... })
    }
  }
}
```

---

## 🏀 Blacktop - Sistema de Torneos

### Archivos clave

```
lib/blacktop/
├── fixtures.ts      # Generación de fixtures
├── standings.ts     # Cálculo de posiciones
├── playoffs.ts      # Lógica de playoffs
└── cache.ts         # Cache de datos

types/blacktop.ts    # Tipos (356 líneas)

components/admin/blacktop/
├── tournament-form.tsx
├── live-scorekeeper-v2.tsx
├── tournament-fixture-v2.tsx
└── scorekeeper/
    ├── team-scoreboard-v2.tsx
    └── timer-control-v2.tsx
```

### Modelo de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TOURNAMENT                                   │
├─────────────────────────────────────────────────────────────────────┤
│  id, name, slug, format, status, start_date, end_date              │
│  points_per_win, points_per_draw, points_per_loss                  │
│  teams_per_group, teams_to_playoffs                                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│     TEAMS       │   │     GROUPS      │   │     MATCHES     │
├─────────────────┤   ├─────────────────┤   ├─────────────────┤
│ id, name, logo  │   │ id, name        │   │ id, round       │
│ tournament_id   │   │ tournament_id   │   │ home_team_id    │
│ group_id        │   │                 │   │ away_team_id    │
│ status          │   │                 │   │ home_score      │
└────────┬────────┘   └─────────────────┘   │ away_score      │
         │                                   │ status          │
         ▼                                   │ is_playoff      │
┌─────────────────┐                         │ playoff_round   │
│    PLAYERS      │                         └────────┬────────┘
├─────────────────┤                                  │
│ id, name        │                                  ▼
│ number          │                         ┌─────────────────┐
│ team_id         │                         │ PLAYER_MATCH    │
│ position        │                         │ _STATS          │
└─────────────────┘                         ├─────────────────┤
                                            │ player_id       │
                                            │ match_id        │
                                            │ points, assists │
                                            │ rebounds, fouls │
                                            └─────────────────┘
```

### Flujo de Torneo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DEL TORNEO                         │
└─────────────────────────────────────────────────────────────────────┘

1. CREACIÓN
   ┌─────────────────┐
   │ Admin crea      │
   │ torneo          │
   │ /admin/blacktop │
   │ /new            │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ status: draft   │
   │ format: X       │
   │ config: {...}   │
   └────────┬────────┘
            │
2. INSCRIPCIÓN
            ▼
   ┌─────────────────┐
   │ Equipos se      │◄──── /blacktop/[slug]/register
   │ inscriben       │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Admin aprueba   │
   │ equipos         │
   └────────┬────────┘
            │
3. FIXTURE
            ▼
   ┌─────────────────┐
   │ generateFixture │◄──── lib/blacktop/fixtures.ts
   │ ()              │
   └────────┬────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐    ┌────────┐
│ Grupos │    │ Elim.  │
│ Round  │    │ Direct │
│ Robin  │    │        │
└───┬────┘    └───┬────┘
    │             │
    └──────┬──────┘
           │
4. PARTIDOS
           ▼
   ┌─────────────────┐
   │ Scorekeeper     │◄──── live-scorekeeper-v2.tsx
   │ en vivo         │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Registrar       │
   │ - Puntos        │
   │ - Faltas        │
   │ - Stats         │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ updateStandings │◄──── lib/blacktop/standings.ts
   │ ()              │
   └────────┬────────┘
            │
5. PLAYOFFS (si aplica)
            ▼
   ┌─────────────────┐
   │ generatePlayoff │◄──── lib/blacktop/playoffs.ts
   │ Bracket()       │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Cuartos → Semi  │
   │ → Final         │
   └────────┬────────┘
            │
6. FINALIZACIÓN
            ▼
   ┌─────────────────┐
   │ status:         │
   │ completed       │
   │ Campeón: X      │
   └─────────────────┘
```

### Generación de Fixtures

```typescript
// lib/blacktop/fixtures.ts

export async function generateFixture(tournamentId: string) {
  const tournament = await getTournament(tournamentId)
  const teams = await getTeams(tournamentId)

  switch (tournament.format) {
    case 'groups_playoff':
      // 1. Distribuir equipos en grupos
      const groups = distributeTeamsToGroups(teams, tournament.teams_per_group)

      // 2. Generar round-robin por grupo
      for (const group of groups) {
        const matches = generateRoundRobin(group.teams)
        await createMatches(matches)
      }
      break

    case 'single_elimination':
      // Generar bracket de eliminación directa
      const bracket = generateSingleEliminationBracket(teams)
      await createMatches(bracket)
      break

    case 'round_robin':
      // Todos contra todos
      const allMatches = generateRoundRobin(teams)
      await createMatches(allMatches)
      break
  }
}

// Round Robin: cada equipo juega contra todos los demás
function generateRoundRobin(teams: Team[]): Match[] {
  const matches: Match[] = []

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        home_team_id: teams[i].id,
        away_team_id: teams[j].id,
        round: calculateRound(i, j, teams.length),
      })
    }
  }

  return matches
}
```

### Cálculo de Standings

```typescript
// lib/blacktop/standings.ts

export async function calculateStandings(tournamentId: string) {
  const teams = await getTeams(tournamentId)
  const matches = await getCompletedMatches(tournamentId)
  const config = await getTournamentConfig(tournamentId)

  const standings = teams.map(team => {
    const teamMatches = matches.filter(
      m => m.home_team_id === team.id || m.away_team_id === team.id
    )

    let wins = 0, draws = 0, losses = 0
    let pointsFor = 0, pointsAgainst = 0

    for (const match of teamMatches) {
      const isHome = match.home_team_id === team.id
      const teamScore = isHome ? match.home_score : match.away_score
      const oppScore = isHome ? match.away_score : match.home_score

      pointsFor += teamScore
      pointsAgainst += oppScore

      if (teamScore > oppScore) wins++
      else if (teamScore < oppScore) losses++
      else draws++
    }

    return {
      team_id: team.id,
      team_name: team.name,
      played: teamMatches.length,
      wins,
      draws,
      losses,
      points_for: pointsFor,
      points_against: pointsAgainst,
      point_diff: pointsFor - pointsAgainst,
      points: wins * config.points_per_win +
              draws * config.points_per_draw +
              losses * config.points_per_loss,
    }
  })

  // Ordenar por puntos, luego por diferencia de puntos
  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    return b.point_diff - a.point_diff
  })
}
```

### Scorekeeper en Vivo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LIVE SCOREKEEPER                                 │
│              live-scorekeeper-v2.tsx                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      TIMER                                   │   │
│  │                     12:34                                    │   │
│  │              [START] [PAUSE] [RESET]                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────┐    ┌──────────────────────┐              │
│  │     EQUIPO A         │    │     EQUIPO B         │              │
│  │                      │    │                      │              │
│  │        45            │    │        42            │              │
│  │                      │    │                      │              │
│  │  ┌────────────────┐  │    │  ┌────────────────┐  │              │
│  │  │ Jugador 1  [+] │  │    │  │ Jugador 1  [+] │  │              │
│  │  │ Jugador 2  [+] │  │    │  │ Jugador 2  [+] │  │              │
│  │  │ Jugador 3  [+] │  │    │  │ Jugador 3  [+] │  │              │
│  │  │ Jugador 4  [+] │  │    │  │ Jugador 4  [+] │  │              │
│  │  │ Jugador 5  [+] │  │    │  │ Jugador 5  [+] │  │              │
│  │  └────────────────┘  │    │  └────────────────┘  │              │
│  │                      │    │                      │              │
│  │  Faltas: ●●●○○       │    │  Faltas: ●●○○○       │              │
│  └──────────────────────┘    └──────────────────────┘              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    [FINALIZAR PARTIDO]                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Flujo de datos:
1. Click en [+] de jugador
2. updatePlayerStats(playerId, { points: +2 })
3. Supabase realtime → actualiza UI
4. Al finalizar → updateMatch({ status: 'completed' })
5. Trigger → recalculateStandings()
```

---

## 📧 Sistema de Emails

### Flujo

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Trigger      │────▶│   sendEmail()   │────▶│     Resend      │
│  (orden, etc)   │     │  lib/email/     │     │      API        │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │    Template     │
                        │   (HTML/React)  │
                        └─────────────────┘
```

### Templates

| Template | Trigger | Variables |
|----------|---------|-----------|
| `new-order` | Orden pagada | orderId, items, total, customer |
| `pending-transfer` | Orden pendiente | orderId, total, bankInfo |
| `order-cancelled` | Orden cancelada | orderId, reason |
| `low-stock` | Stock < 3 | productName, currentStock |
| `newsletter-welcome` | Suscripción | email |

---

*Última actualización: Diciembre 2024*
