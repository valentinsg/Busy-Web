"use client"

import { useEffect, useState } from "react"

type Row = {
  product_id: string
  name: string
  orders_count: number
  quantity_sold: number
  revenue: number
  image_url?: string
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
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.product_id} className="flex items-center gap-3 text-sm">
            {r.image_url && (
              <img 
                src={r.image_url} 
                alt={r.name} 
                className="w-12 h-12 object-cover rounded border"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium" title={r.name}>{r.name}</div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="tabular-nums">{r.quantity_sold} unidades</span>
                <span className="tabular-nums">$ {r.revenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
