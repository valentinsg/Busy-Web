"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/hooks/use-toast"

type Variant = "compact" | "full"

export default function DashboardCards({
  variant = "compact",
  from: externalFrom,
  to: externalTo,
  showControls = true,
}: {
  variant?: Variant
  from?: string
  to?: string
  showControls?: boolean
}) {
  const { toast } = useToast()
  const [from, setFrom] = useState<string>(externalFrom || "")
  const [to, setTo] = useState<string>(externalTo || "")
  const [loading, setLoading] = useState<boolean>(false)
  const [profit, setProfit] = useState<{ revenue: number; expenses: number; profit: number } | null>(null)
  const [revenueByChannel, setRevenueByChannel] = useState<Array<{ channel: string; orders: number; revenue: number }>>([])

  const load = useMemo(
    () => async (opts?: { quiet?: boolean }) => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        const effFrom = externalFrom ?? from
        const effTo = externalTo ?? to
        if (effFrom) params.set("from", effFrom)
        if (effTo) params.set("to", effTo)
        const res = await fetch(`/api/admin/analytics/summary?${params.toString()}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Error")
        setProfit(json.profit)
        setRevenueByChannel(json.revenueByChannel || [])
        if (!opts?.quiet) toast({ title: "Resumen actualizado" })
      } catch (e: any) {
        toast({ title: "Error al cargar resumen", description: e?.message || "", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    },
    [externalFrom, externalTo, from, to, toast],
  )

  useEffect(() => {
    load({ quiet: true })
  }, [])

  // Keep in sync with external props (when provided)
  useEffect(() => {
    if (typeof externalFrom !== 'undefined') setFrom(externalFrom)
    if (typeof externalTo !== 'undefined') setTo(externalTo)
    if (typeof externalFrom !== 'undefined' || typeof externalTo !== 'undefined') {
      void load({ quiet: true })
    }
  }, [externalFrom, externalTo])

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded border px-3 py-2">
          <div className="text-[11px] text-muted-foreground">Ingresos</div>
          <div className="text-lg font-semibold tabular-nums">${" "}{profit ? profit.revenue.toFixed(2) : loading ? "…" : "0.00"}</div>
        </div>
        <div className="rounded border px-3 py-2">
          <div className="text-[11px] text-muted-foreground">Gastos</div>
          <div className="text-lg font-semibold tabular-nums">${" "}{profit ? profit.expenses.toFixed(2) : loading ? "…" : "0.00"}</div>
        </div>
        <div className="rounded border px-3 py-2">
          <div className="text-[11px] text-muted-foreground">Beneficio</div>
          <div className={`text-lg font-semibold tabular-nums ${profit && profit.profit < 0 ? "text-red-600" : ""}`}>${" "}{profit ? profit.profit.toFixed(2) : loading ? "…" : "0.00"}</div>
        </div>
        {showControls && (
          <div className="flex items-end gap-2 ml-auto">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-2 py-1 bg-background text-sm" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-2 py-1 bg-background text-sm" />
            <button
              onClick={() => load()}
              disabled={loading}
              className="rounded bg-primary text-primary-foreground px-3 py-1 text-xs disabled:opacity-60"
            >
              {loading ? "Cargar…" : "Actualizar"}
            </button>
            <Link href="/admin/analytics" className="text-xs text-primary underline-offset-2 hover:underline">Ver estadísticas</Link>
          </div>
        )}
      </div>
    )
  }

  // full
  return (
    <div className="space-y-4">
      {showControls && (
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">Desde</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-2 py-1 bg-background" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">Hasta</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-2 py-1 bg-background" />
          </div>
          <button
            onClick={() => load()}
            disabled={loading}
            className="rounded bg-primary text-primary-foreground px-3 py-1 text-sm disabled:opacity-60"
          >
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Ingresos</div>
          <div className="text-2xl font-semibold">${" "}{profit ? profit.revenue.toFixed(2) : loading ? "…" : "0.00"}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Gastos</div>
          <div className="text-2xl font-semibold">${" "}{profit ? profit.expenses.toFixed(2) : loading ? "…" : "0.00"}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Beneficio</div>
          <div className={`text-2xl font-semibold ${profit && profit.profit < 0 ? "text-red-600" : ""}`}>${" "}{profit ? profit.profit.toFixed(2) : loading ? "…" : "0.00"}</div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-2 font-medium">Ingresos por canal</div>
        <div className="space-y-2">
          {revenueByChannel.length === 0 && <div className="text-sm text-muted-foreground">{loading ? "Cargando..." : "Sin datos"}</div>}
          {revenueByChannel.map((r) => (
            <div key={r.channel} className="flex justify-between text-sm">
              <div className="text-muted-foreground">{r.channel}</div>
              <div className="flex gap-3">
                <span className="tabular-nums">{r.orders} pedidos</span>
                <span className="font-medium tabular-nums">${" "}{r.revenue.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
