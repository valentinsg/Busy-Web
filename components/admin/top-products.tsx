"use client"

import { useEffect, useState } from "react"

type Row = {
  product_id: string
  name: string
  orders_count: number
  quantity_sold: number
  revenue: number
}

export default function TopProducts({ limit = 5 }: { limit?: number }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/analytics/product-popularity?limit=${limit}`)
        const json = await res.json()
        if (!cancel && res.ok) setRows(json.data || [])
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    load()
    return () => { cancel = true }
  }, [limit])

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 font-medium">Productos más vendidos</div>
      {loading && <div className="text-sm text-muted-foreground">Cargando…</div>}
      {!loading && rows.length === 0 && (
        <div className="text-sm text-muted-foreground">Sin datos</div>
      )}
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.product_id} className="flex items-center justify-between text-sm">
            <span className="truncate mr-2" title={r.name}>{r.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground tabular-nums" title="Pedidos">{r.orders_count} pedidos</span>
              <span className="text-muted-foreground tabular-nums" title="Unidades">{r.quantity_sold} u</span>
              <span className="font-medium tabular-nums" title="Ingresos">$ {r.revenue.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
