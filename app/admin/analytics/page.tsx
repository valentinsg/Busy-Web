"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import DashboardCards from "@/components/admin/dashboard-cards"
import { useToast } from "@/hooks/use-toast"

// Inline chart components (simple SVG) in module scope
function ChartLine({ series }: { series: Array<{ name: string; color: string; data: Array<{ x: string; y: number }> }> }) {
  const width = 800
  const height = 220
  const pad = 32
  const labels = Array.from(new Set(series.flatMap(s => s.data.map(d => d.x))))
  const maxY = Math.max(1, ...series.flatMap(s => s.data.map(d => d.y)))
  const x = (i: number) => pad + (i * (width - 2*pad)) / Math.max(1, labels.length - 1)
  const y = (v: number) => height - pad - (v * (height - 2*pad)) / maxY
  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="min-w-[700px]">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#444" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#444" />
        {series.map((s, idx) => {
          const path = s.data.map(d => {
            const i = labels.indexOf(d.x)
            return `${x(i)},${y(d.y)}`
          }).join(' ')
          return <polyline key={idx} fill="none" stroke={s.color} strokeWidth={2} points={path} />
        })}
        {labels.map((lb, i) => (
          <text key={i} x={x(i)} y={height - pad + 14} fontSize="10" textAnchor="middle" fill="#888">{lb}</text>
        ))}
      </svg>
    </div>
  )
}

function ChartBars({ data }: { data: Array<{ label: string; value: number }> }) {
  const width = 800
  const height = 220
  const pad = 32
  const maxV = Math.max(1, ...data.map(d => d.value))
  const bw = (width - 2*pad) / Math.max(1, data.length)
  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="min-w-[700px]">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#444" />
        {data.map((d, i) => {
          const h = ((d.value) / maxV) * (height - 2*pad)
          const x = pad + i*bw + 4
          const y = height - pad - h
          return (
            <g key={i}>
              <rect x={x} y={y} width={bw - 8} height={h} fill="#60a5fa" />
              <text x={x + (bw-8)/2} y={height - pad + 14} fontSize="10" textAnchor="middle" fill="#888">{d.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function AnalyticsPage() {
  const { toast } = useToast()
  const analyticsUrl = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_URL
  const [popular, setPopular] = useState<Array<{ product_id: string; name: string; revenue: number; orders_count: number }>>([])
  const [loading, setLoading] = useState(false)

  // Advanced analytics state
  // Default: últimos 30 días
  const [from, setFrom] = useState<string>(() => {
    const today = new Date()
    const fromD = new Date(today.getTime() - 29*24*3600*1000)
    return fromD.toISOString().slice(0,10)
  })
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [groupBy, setGroupBy] = useState<'day'|'week'|'month'>("day")
  const [comparePrev, setComparePrev] = useState<boolean>(false)
  const [summary, setSummary] = useState<{
    profit: { revenue: number; expenses: number; profit: number } | null
    revenueByChannel: Array<{ channel: string; orders: number; revenue: number }>
    timeSeries: Array<{ bucket: string; revenue: number; expenses: number; orders: number; profit: number }>
    kpis: { orders: number; aov: number; new_customers: number } | null
  }>({ profit: null, revenueByChannel: [], timeSeries: [], kpis: null })

  const loadPopular = useMemo(
    () => async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/admin/analytics/product-popularity?limit=20")
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Error")
        setPopular((json.data || []).map((r: { product_id: string; name: string; revenue: number; orders_count: number }) => ({ product_id: r.product_id, name: r.name, revenue: Number(r.revenue || 0), orders_count: Number(r.orders_count || 0) })))
      } catch (e: unknown ) {
        toast({ title: "Error al cargar populares", description: e?.toString() || "", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const loadSummary = useMemo(
    () => async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (from) params.set('from', from)
        if (to) params.set('to', to)
        if (groupBy) params.set('groupBy', groupBy)
        const res = await fetch(`/api/admin/analytics/summary?${params.toString()}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Error')
        setSummary({
          profit: json.profit || null,
          revenueByChannel: json.revenueByChannel || [],
          timeSeries: json.timeSeries || [],
          kpis: json.kpis || null,
        })
      } catch (e: unknown) {
        toast({ title: 'Error al cargar análisis', description: e?.toString() || '', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }, [from, to, groupBy, toast]
  )

  useEffect(() => {
    void loadPopular()
    void loadSummary()
  }, [loadPopular, loadSummary ])

  // Helpers to build comparison series (previous period)
  const prevRange = useMemo(() => {
    if (!from || !to) return null
    const start = new Date(from)
    const end = new Date(to)
    const diffMs = end.getTime() - start.getTime()
    const prevEnd = new Date(start.getTime() - 24*3600*1000)
    const prevStart = new Date(prevEnd.getTime() - diffMs)
    return { from: prevStart.toISOString().slice(0,10), to: prevEnd.toISOString().slice(0,10) }
  }, [from, to])

  const [prevSeries, setPrevSeries] = useState<Array<{ bucket: string; revenue: number; expenses: number; orders: number; profit: number }>>([])
  useEffect(() => {
    let ignore = false
    async function loadPrev() {
      if (!comparePrev || !prevRange) { setPrevSeries([]); return }
      try {
        const params = new URLSearchParams({ from: prevRange.from, to: prevRange.to, groupBy })
        const res = await fetch(`/api/admin/analytics/summary?${params.toString()}`)
        const json = await res.json()
        if (!ignore && res.ok) setPrevSeries(json.timeSeries || [])
      } catch {}
    }
    void loadPrev()
    return () => { ignore = true }
  }, [comparePrev, prevRange, groupBy])

  // Auto-update current summary with debounce when inputs change
  useEffect(() => {
    const t = setTimeout(() => {
      void loadSummary()
    }, 400)
    return () => clearTimeout(t)
  }, [from, to, groupBy, loadSummary])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Inteligencia comercial</h1>
          <p className="text-sm text-muted-foreground">KPIs, series temporales y distribución por canales.</p>
        </div>
        <div className="flex items-center gap-3">
          {analyticsUrl && (
            <a
              href={analyticsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm rounded border px-3 py-1 hover:bg-muted"
            >
              Ver Web Analytics
            </a>
          )}
          <Link href="/admin" className="text-sm text-primary underline-offset-2 hover:underline">Volver al panel</Link>
        </div>
      </div>

      {/* Controles unificados */}
      <section className="space-y-3">
        <div className="rounded border p-3 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground" title="Fecha de inicio del análisis">Desde</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-2 py-1 bg-background" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground" title="Fecha de fin del análisis">Hasta</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-2 py-1 bg-background" />
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded border px-2 py-1 text-xs" onClick={() => {
              const today = new Date()
              const fromD = new Date(today.getTime() - 6*24*3600*1000)
              setFrom(fromD.toISOString().slice(0,10)); setTo(today.toISOString().slice(0,10))
            }}>Últimos 7 días</button>
            <button className="rounded border px-2 py-1 text-xs" onClick={() => {
              const today = new Date(); const fromD = new Date(today.getTime() - 29*24*3600*1000)
              setFrom(fromD.toISOString().slice(0,10)); setTo(today.toISOString().slice(0,10))
            }}>Últimos 30 días</button>
            <button className="rounded border px-2 py-1 text-xs" onClick={() => {
              const today = new Date(); const y = today.getFullYear(); const fromD = new Date(y,0,1)
              setFrom(fromD.toISOString().slice(0,10)); setTo(today.toISOString().slice(0,10))
            }}>YTD</button>
            <button className="rounded border px-2 py-1 text-xs" onClick={() => { setFrom(""); setTo("") }}>Todos</button>
          </div>
          <details className="ml-auto">
            <summary className="cursor-pointer text-sm text-muted-foreground select-none">Avanzado</summary>
            <div className="mt-2 flex flex-wrap gap-3 items-end">
              <div className="flex flex-col">
                <label className="text-xs text-muted-foreground" title="Agrupar la serie temporal por día, semana o mes">Agrupar por</label>
                <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')} className="border rounded px-2 py-1 bg-background">
                  <option value="day">Día</option>
                  <option value="week">Semana</option>
                  <option value="month">Mes</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs" title="Compara la serie actual contra un período previo de igual duración">Comparar período previo</label>
                <input type="checkbox" checked={comparePrev} onChange={(e) => setComparePrev(e.target.checked)} />
              </div>
              <button onClick={loadSummary} disabled={loading} className="rounded bg-primary text-primary-foreground px-3 py-1 text-sm disabled:opacity-60">{loading ? 'Cargando…' : 'Actualizar'}</button>
            </div>
          </details>
        </div>
      </section>

      {/* Resumen principal dependiente del mismo rango */}
      <DashboardCards variant="full" from={from} to={to} showControls={false} />

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded border p-4" title="Cantidad de pedidos en el período seleccionado">
          <div className="text-xs text-muted-foreground">Pedidos</div>
          <div className="text-2xl font-semibold">{summary.kpis ? summary.kpis.orders : (loading ? '…' : '0')}</div>
        </div>
        <div className="rounded border p-4" title="Average Order Value: Ingresos / número de pedidos en el período">
          <div className="text-xs text-muted-foreground">Ticket promedio (AOV)</div>
          <div className="text-2xl font-semibold">${" "}{summary.kpis ? summary.kpis.aov.toFixed(2) : (loading ? '…' : '0.00')}</div>
        </div>
        <div className="rounded border p-4" title="Cantidad de clientes creados en el período seleccionado">
          <div className="text-xs text-muted-foreground">Clientes nuevos</div>
          <div className="text-2xl font-semibold">{summary.kpis ? summary.kpis.new_customers : (loading ? '…' : '0')}</div>
        </div>
      </section>

      {/* Time series chart */}
      <section className="rounded border p-4 space-y-2">
        <div className="flex justify-between items-center">
          <div className="font-medium">Serie temporal (Ingresos y Beneficio)</div>
          {comparePrev && prevRange && (
            <div className="text-xs text-muted-foreground">Comparando con {prevRange.from} → {prevRange.to}</div>
          )}
        </div>
        <ChartLine
          series={[
            { name: 'Ingresos', color: '#4ade80', data: summary.timeSeries.map(d => ({ x: d.bucket, y: d.revenue })) },
            { name: 'Beneficio', color: '#60a5fa', data: summary.timeSeries.map(d => ({ x: d.bucket, y: d.profit })) },
            ...(comparePrev ? [ { name: 'Ingresos (prev.)', color: '#4ade8055', data: prevSeries.map(d => ({ x: d.bucket, y: d.revenue })) } ] : []),
          ]}
        />
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-[#4ade80]" /> Ingresos</div>
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-[#60a5fa]" /> Beneficio</div>
          {comparePrev && <div className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-[#4ade8055]" /> Ingresos (prev.)</div>}
        </div>
      </section>

      {/* Revenue by channel chart */}
      <section className="rounded border p-4 space-y-2">
        <div className="font-medium">Ingresos por canal</div>
        <ChartBars data={summary.revenueByChannel.map(r => ({ label: r.channel, value: r.revenue }))} />
        <div className="text-xs text-muted-foreground" title="Suma de ingresos (ordenes) agrupados por canal dentro del período">Suma de ingresos por canal</div>
      </section>
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-xl font-semibold">Productos populares</h2>
          <button onClick={loadPopular} disabled={loading} className="rounded bg-muted px-3 py-1 text-sm">{loading ? "Cargando..." : "Actualizar"}</button>
        </div>
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-3 py-2">Producto</th>
                <th className="text-left px-3 py-2">Pedidos</th>
                <th className="text-left px-3 py-2">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {popular.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-muted-foreground" colSpan={3}>{loading ? "Cargando..." : "Sin datos"}</td>
                </tr>
              )}
              {popular.map((p) => (
                <tr key={p.product_id} className="border-t">
                  <td className="px-3 py-2">{p.name || p.product_id}</td>
                  <td className="px-3 py-2">{p.orders_count}</td>
                  <td className="px-3 py-2">${" "}{p.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
