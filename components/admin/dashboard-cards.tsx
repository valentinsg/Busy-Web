"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
// Chart UI helpers removed; charts now rendered via client-only component
import RevenueAreaChart from "@/components/admin/RevenueAreaChart"

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
  const [timeSeries, setTimeSeries] = useState<Array<{ bucket: string; revenue: number; revenue_prev?: number }>>([])
  const [kpis, setKpis] = useState<{ orders: number; aov: number; new_customers: number } | null>(null)
  const [groupBy, setGroupBy] = useState<'day'|'week'|'month'>("day")
  const [preset, setPreset] = useState<string>("last30")
  const [showComparison, setShowComparison] = useState(false)
  const [rangeOpen, setRangeOpen] = useState(false)
  const [customRange, setCustomRange] = useState<Partial<DateRange>>({})

  const load = useMemo(
    () => async (opts?: { quiet?: boolean }) => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        const effFrom = externalFrom ?? from
        const effTo = externalTo ?? to
        if (effFrom) params.set("from", effFrom)
        if (effTo) params.set("to", effTo)
        if (groupBy) params.set("groupBy", groupBy)
        if (showComparison) params.set("comparison", "true")
        const res = await fetch(`/api/admin/analytics/summary?${params.toString()}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Error")
        setProfit(json.profit)
        setRevenueByChannel(json.revenueByChannel || [])
        setTimeSeries(json.timeSeries || [])
        setKpis(json.kpis || null)
        if (!opts?.quiet) toast({ title: "Resumen actualizado" })
      } catch (e: unknown) {
        toast({ title: "Error al cargar resumen", description: String(e), variant: "destructive" })
      } finally {
        setLoading(false)
      }
    },
    [externalFrom, externalTo, from, to, groupBy, showComparison, toast],
  )

  // Keep in sync with external props (when provided) and load data
  useEffect(() => {
    if (typeof externalFrom !== 'undefined') setFrom(externalFrom)
    if (typeof externalTo !== 'undefined') setTo(externalTo)
  }, [externalFrom, externalTo])

  // Load data with debounce to avoid multiple calls
  useEffect(() => {
    const timer = setTimeout(() => {
      void load({ quiet: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [load])

  // Presets handler
  useEffect(() => {
    if (!showControls) return
    const now = new Date()
    const iso = (d: Date) => d.toISOString().slice(0,10)
    if (preset === "today") {
      const d = iso(now)
      setFrom(d)
      setTo(d)
    } else if (preset === "last7") {
      const d = new Date(now)
      d.setDate(d.getDate()-6)
      setFrom(iso(d))
      setTo(iso(now))
    } else if (preset === "last30") {
      const d = new Date(now)
      d.setDate(d.getDate()-29)
      setFrom(iso(d))
      setTo(iso(now))
    } else if (preset === "ytd") {
      const d = new Date(Date.UTC(now.getUTCFullYear(),0,1))
      setFrom(iso(d))
      setTo(iso(now))
    } else if (preset === "custom" && customRange.from && customRange.to) {
      setFrom(iso(customRange.from))
      setTo(iso(customRange.to))
    }
  }, [preset, customRange, showControls])

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
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-stretch sm:items-end">
          <div className="flex flex-col flex-1 min-w-[140px]">
            <label className="text-xs text-muted-foreground mb-1">Rango</label>
            <Select value={preset} onValueChange={setPreset}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="last7">Últimos 7 días</SelectItem>
                <SelectItem value="last30">Últimos 30 días</SelectItem>
                <SelectItem value="ytd">YTD</SelectItem>
                <SelectItem value="custom">Personalizado…</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col flex-1 min-w-[120px]">
            <label className="text-xs text-muted-foreground mb-1">Agrupar por</label>
            <Select value={groupBy} onValueChange={(v: 'day'|'week'|'month') => setGroupBy(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Día</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" disabled={preset !== 'custom'} className="w-full sm:w-auto">Elegir fechas</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="grid grid-cols-1 gap-2">
                <Calendar
                  mode="range"
                  selected={customRange.from ? (customRange as DateRange) : undefined}
                  onSelect={(r: DateRange | undefined) => setCustomRange(r || {})}
                  numberOfMonths={1}
                  className="sm:hidden"
                />
                <Calendar
                  mode="range"
                  selected={customRange.from ? (customRange as DateRange) : undefined}
                  onSelect={(r: DateRange | undefined) => setCustomRange(r || {})}
                  numberOfMonths={2}
                  className="hidden sm:block"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setRangeOpen(false) }}>Cerrar</Button>
                  <Button size="sm" onClick={() => { setRangeOpen(false); load(); }}>Aplicar</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={() => load()} disabled={loading} className="w-full sm:w-auto">
            {loading ? "Cargando..." : "Actualizar"}
          </Button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-lg border p-3 sm:p-4">
          <div className="text-xs text-muted-foreground">Ingresos</div>
          <div className="text-xl sm:text-2xl font-semibold">${" "}{profit ? profit.revenue.toFixed(2) : loading ? "…" : "0.00"}</div>
        </div>
        <div className="rounded-lg border p-3 sm:p-4">
          <div className="text-xs text-muted-foreground">Pedidos</div>
          <div className="text-xl sm:text-2xl font-semibold">{kpis ? kpis.orders : loading ? "…" : "0"}</div>
        </div>
        <div className="rounded-lg border p-3 sm:p-4">
          <div className="text-xs text-muted-foreground">Ticket promedio</div>
          <div className="text-xl sm:text-2xl font-semibold">${" "}{kpis ? kpis.aov.toFixed(2) : loading ? "…" : "0.00"}</div>
        </div>
      </div>

      {/* Time series chart - Removed, only shown in /admin/analytics */}

      {/* Revenue by channel list */}
      <div className="rounded-lg border p-3 sm:p-4">
        <div className="mb-2 text-sm sm:text-base font-medium">Ingresos por canal</div>
        <div className="space-y-2">
          {revenueByChannel.length === 0 && <div className="text-xs sm:text-sm text-muted-foreground">{loading ? "Cargando..." : "Sin datos"}</div>}
          {revenueByChannel.map((r) => (
            <div key={r.channel} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-3 text-xs sm:text-sm">
              <div>
                <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] sm:text-[11px] uppercase tracking-wide text-muted-foreground">
                  {r.channel}
                </span>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <span className="tabular-nums text-muted-foreground">{r.orders} pedidos</span>
                <span className="font-medium tabular-nums">${" "}{r.revenue.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
