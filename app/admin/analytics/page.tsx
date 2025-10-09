"use client"
export const dynamic = "force-dynamic"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { AnalyticsSkeleton } from "@/components/admin/analytics-skeleton"
import { cn } from "@/lib/utils"

// Helper para generar todos los días entre dos fechas
function getAllDatesInRange(from: string, to: string): string[] {
  if (!from || !to) return []
  const dates: string[] = []
  const start = new Date(from)
  const end = new Date(to)
  const current = new Date(start)
  
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

// Helper para formatear fechas en el eje X
function formatDateLabel(dateStr: string, groupBy: 'day' | 'week' | 'month'): string {
  if (groupBy === 'week') return dateStr
  if (groupBy === 'month') return dateStr
  
  // Para días, mostrar formato corto
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.getMonth() + 1
  return `${day}/${month}`
}

// Tooltip personalizado
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const { toast } = useToast()
  const analyticsUrl = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_URL
  const [popular, setPopular] = useState<Array<{ product_id: string; name: string; revenue: number; orders_count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [activePreset, setActivePreset] = useState<string>('30d')

  // Default: últimos 30 días
  const [from, setFrom] = useState<string>(() => {
    const today = new Date()
    const fromD = new Date(today.getTime() - 29*24*3600*1000)
    return fromD.toISOString().slice(0,10)
  })
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0,10))
  
  // Preset handlers
  const handlePreset = (preset: string) => {
    setActivePreset(preset)
    const today = new Date()
    const iso = (d: Date) => d.toISOString().slice(0,10)
    
    switch(preset) {
      case '7d':
        setFrom(iso(new Date(today.getTime() - 6*24*3600*1000)))
        setTo(iso(today))
        setGroupBy('day')
        break
      case '30d':
        setFrom(iso(new Date(today.getTime() - 29*24*3600*1000)))
        setTo(iso(today))
        setGroupBy('day')
        break
      case 'ytd':
        setFrom(iso(new Date(today.getFullYear(), 0, 1)))
        setTo(iso(today))
        setGroupBy('month') // Agrupar por mes para YTD
        break
      case 'all':
        setFrom('')
        setTo('')
        setGroupBy('month') // Agrupar por mes para todo el tiempo
        break
    }
  }
  
  const [groupBy, setGroupBy] = useState<'day'|'week'|'month'>("day")
  const [comparePrev, setComparePrev] = useState<boolean>(false)
  const [summary, setSummary] = useState<{
    profit: { revenue: number; expenses: number; profit: number } | null
    revenueByChannel: Array<{ channel: string; orders: number; revenue: number }>
    timeSeries: Array<{ bucket: string; revenue: number; revenue_prev?: number }>
    kpis: { orders: number; aov: number; new_customers: number } | null
  }>({ profit: null, revenueByChannel: [], timeSeries: [], kpis: null })

  const loadPopular = useMemo(
    () => async () => {
      try {
        const res = await fetch("/api/admin/analytics/product-popularity?limit=20")
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || "Error")
        setPopular((json.data || []).map((r: { product_id: string; name: string; revenue: number; orders_count: number }) => ({ product_id: r.product_id, name: r.name, revenue: Number(r.revenue || 0), orders_count: Number(r.orders_count || 0) })))
      } catch (e: unknown ) {
        toast({ title: "Error al cargar populares", description: e?.toString() || "", variant: "destructive" })
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
        if (comparePrev) params.set('comparison', 'true')
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
    }, [from, to, groupBy, comparePrev, toast]
  )

  // Load popular products only once on mount
  useEffect(() => {
    void loadPopular()
  }, [loadPopular])

  // Auto-update summary with debounce when inputs change
  useEffect(() => {
    const t = setTimeout(() => {
      void loadSummary()
    }, 400)
    return () => clearTimeout(t)
  }, [from, to, groupBy, comparePrev, loadSummary])

  // Preparar datos del chart con todos los días
  const chartData = useMemo(() => {
    if (groupBy !== 'day') {
      return summary.timeSeries.map(d => ({
        date: d.bucket,
        label: formatDateLabel(d.bucket, groupBy),
        Ingresos: d.revenue,
        'Período anterior': d.revenue_prev || 0
      }))
    }
    
    const allDates = getAllDatesInRange(from, to)
    const dataMap = new Map(summary.timeSeries.map(d => [d.bucket, d]))
    
    return allDates.map(date => {
      const existing = dataMap.get(date)
      return {
        date,
        label: formatDateLabel(date, 'day'),
        Ingresos: existing?.revenue || 0,
        'Período anterior': existing?.revenue_prev || 0
      }
    })
  }, [summary.timeSeries, from, to, groupBy])

  const CHANNEL_COLORS = [
    'hsl(142, 76%, 36%)', // Verde
    'hsl(217, 91%, 60%)', // Azul
    'hsl(47, 96%, 53%)',  // Amarillo
    'hsl(0, 84%, 60%)',   // Rojo
    'hsl(280, 67%, 55%)'  // Púrpura
  ]

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

      {/* Controles minimal */}
      <section className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handlePreset('7d')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activePreset === '7d'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          Últimos 7 días
        </button>
        <button
          onClick={() => handlePreset('30d')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activePreset === '30d'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          Últimos 30 días
        </button>
        <button
          onClick={() => handlePreset('ytd')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activePreset === 'ytd'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          YTD
        </button>
        <button
          onClick={() => handlePreset('all')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activePreset === 'all'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          Todo el tiempo
        </button>
        <div className="ml-auto flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setActivePreset('') }}
            className="px-3 py-2 text-sm border rounded-lg bg-background"
          />
          <span className="text-muted-foreground">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setActivePreset('') }}
            className="px-3 py-2 text-sm border rounded-lg bg-background"
          />
        </div>
      </section>

      {loading ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {/* KPIs */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="text-xs font-medium text-muted-foreground mb-2">Ingresos</div>
              <div className="text-3xl font-bold">${summary.profit ? summary.profit.revenue.toLocaleString() : '0'}</div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="text-xs font-medium text-muted-foreground mb-2">Pedidos</div>
              <div className="text-3xl font-bold">{summary.kpis?.orders || 0}</div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="text-xs font-medium text-muted-foreground mb-2">Ticket promedio</div>
              <div className="text-3xl font-bold">${summary.kpis?.aov.toFixed(2) || '0.00'}</div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="text-xs font-medium text-muted-foreground mb-2">Clientes nuevos</div>
              <div className="text-3xl font-bold">{summary.kpis?.new_customers || 0}</div>
            </div>
          </section>

          {/* Time series chart */}
          <section className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
            <div className="font-semibold text-lg">Evolución de ingresos</div>
            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    width={60}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
                  <Area 
                    type="monotone" 
                    dataKey="Ingresos" 
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    fill="url(#colorIngresos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Revenue by channel - Donut Chart */}
          <section className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
            <div className="font-semibold text-lg">Distribución por canal</div>
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.revenueByChannel.map(r => ({
                      name: r.channel,
                      value: r.revenue
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {summary.revenueByChannel.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {summary.revenueByChannel.map((channel, idx) => (
                <div key={channel.channel} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CHANNEL_COLORS[idx % 5] }}
                  />
                  <span className="text-muted-foreground">{channel.channel}:</span>
                  <span className="font-semibold">${channel.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Productos populares */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">Productos populares</h2>
              <button 
                onClick={loadPopular} 
                className="rounded-md bg-muted hover:bg-muted/80 px-4 py-2 text-sm font-medium transition-colors"
              >
                Actualizar
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Producto</th>
                    <th className="text-left px-4 py-3 font-semibold">Pedidos</th>
                    <th className="text-left px-4 py-3 font-semibold">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {popular.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-muted-foreground" colSpan={3}>Sin datos</td>
                    </tr>
                  )}
                  {popular.map((p) => (
                    <tr 
                      key={p.product_id} 
                      className="border-t hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{p.name || p.product_id}</td>
                      <td className="px-4 py-3">{p.orders_count}</td>
                      <td className="px-4 py-3 font-semibold">${p.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
