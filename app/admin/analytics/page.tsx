"use client"
export const dynamic = "force-dynamic"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import DashboardCards from "@/components/admin/dashboard-cards"
import { useToast } from "@/hooks/use-toast"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { motion, AnimatePresence } from "framer-motion"

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
    timeSeries: Array<{ bucket: string; revenue: number; revenue_prev?: number }>
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

  // Preparar datos del chart con todos los días
  const chartData = useMemo(() => {
    if (groupBy !== 'day') {
      // Para week/month, usar los datos tal cual
      return summary.timeSeries.map(d => ({
        date: d.bucket,
        label: formatDateLabel(d.bucket, groupBy),
        Ingresos: d.revenue,
        'Período anterior': d.revenue_prev || 0
      }))
    }
    
    // Para días, llenar todos los días del rango
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
      <motion.section 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground" title="Fecha de inicio del análisis">Desde</label>
              <input 
                type="date" 
                value={from} 
                onChange={(e) => setFrom(e.target.value)} 
                className="border rounded-md px-3 py-2 bg-background hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground" title="Fecha de fin del análisis">Hasta</label>
              <input 
                type="date" 
                value={to} 
                onChange={(e) => setTo(e.target.value)} 
                className="border rounded-md px-3 py-2 bg-background hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors" 
                onClick={() => {
                  const today = new Date()
                  const fromD = new Date(today.getTime() - 6*24*3600*1000)
                  setFrom(fromD.toISOString().slice(0,10)); setTo(today.toISOString().slice(0,10))
                }}
              >
                Últimos 7 días
              </button>
              <button 
                className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors" 
                onClick={() => {
                  const today = new Date(); const fromD = new Date(today.getTime() - 29*24*3600*1000)
                  setFrom(fromD.toISOString().slice(0,10)); setTo(today.toISOString().slice(0,10))
                }}
              >
                Últimos 30 días
              </button>
              <button 
                className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors" 
                onClick={() => {
                  const today = new Date(); const y = today.getFullYear(); const fromD = new Date(y,0,1)
                  setFrom(fromD.toISOString().slice(0,10)); setTo(today.toISOString().slice(0,10))
                }}
              >
                YTD
              </button>
              <button 
                className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors" 
                onClick={() => { setFrom(""); setTo("") }}
              >
                Todos
              </button>
            </div>
            <details className="ml-auto">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground select-none hover:text-foreground transition-colors">Avanzado ▼</summary>
              <div className="mt-3 flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground" title="Agrupar la serie temporal por día, semana o mes">Agrupar por</label>
                  <select 
                    value={groupBy} 
                    onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')} 
                    className="border rounded-md px-3 py-2 bg-background hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="day">Día</option>
                    <option value="week">Semana</option>
                    <option value="month">Mes</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="compare-prev" 
                    checked={comparePrev} 
                    onChange={(e) => setComparePrev(e.target.checked)} 
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <label htmlFor="compare-prev" className="text-xs font-medium cursor-pointer" title="Compara la serie actual contra un período previo de igual duración">Comparar período previo</label>
                </div>
                <button 
                  onClick={loadSummary} 
                  disabled={loading} 
                  className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {loading ? 'Cargando…' : 'Actualizar'}
                </button>
              </div>
            </details>
          </div>
        </div>
      </motion.section>

      {/* Resumen principal dependiente del mismo rango */}
      <DashboardCards variant="full" from={from} to={to} showControls={false} />

      {/* KPIs */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow" 
          title="Cantidad de pedidos en el período seleccionado"
        >
          <div className="text-xs font-medium text-muted-foreground mb-2">Pedidos</div>
          <div className="text-3xl font-bold">{summary.kpis ? summary.kpis.orders : (loading ? '…' : '0')}</div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow" 
          title="Average Order Value: Ingresos / número de pedidos en el período"
        >
          <div className="text-xs font-medium text-muted-foreground mb-2">Ticket promedio (AOV)</div>
          <div className="text-3xl font-bold">${" "}{summary.kpis ? summary.kpis.aov.toFixed(2) : (loading ? '…' : '0.00')}</div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow" 
          title="Cantidad de clientes creados en el período seleccionado"
        >
          <div className="text-xs font-medium text-muted-foreground mb-2">Clientes nuevos</div>
          <div className="text-3xl font-bold">{summary.kpis ? summary.kpis.new_customers : (loading ? '…' : '0')}</div>
        </motion.div>
      </motion.section>

      {/* Time series chart */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border bg-card p-6 shadow-sm space-y-4"
      >
        <div className="flex justify-between items-center">
          <div className="font-semibold text-lg">Evolución de ingresos</div>
          {comparePrev && prevRange && (
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">Comparando con {prevRange.from} → {prevRange.to}</div>
          )}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${from}-${to}-${groupBy}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-[320px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
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
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Area 
                  type="monotone" 
                  dataKey="Ingresos" 
                  stroke="hsl(142, 76%, 36%)" 
                  strokeWidth={2}
                  fill="url(#colorIngresos)"
                  animationDuration={800}
                  animationEasing="ease-out"
                />
                {comparePrev && (
                  <Area 
                    type="monotone" 
                    dataKey="Período anterior" 
                    stroke="hsl(0, 84%, 60%)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#colorPrev)"
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* Revenue by channel chart */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg border bg-card p-6 shadow-sm space-y-4"
      >
        <div className="font-semibold text-lg">Ingresos por canal</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${from}-${to}-channels`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-[320px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={summary.revenueByChannel.map(r => ({ 
                  canal: r.channel, 
                  Ingresos: r.revenue,
                  Pedidos: r.orders 
                }))} 
                margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="canal" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  width={60}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar 
                  dataKey="Ingresos" 
                  fill="hsl(217, 91%, 60%)" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
        <div className="text-xs text-muted-foreground" title="Suma de ingresos (ordenes) agrupados por canal dentro del período">Suma de ingresos por canal en el período seleccionado</div>
      </motion.section>
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Productos populares</h2>
          <button 
            onClick={loadPopular} 
            disabled={loading} 
            className="rounded-md bg-muted hover:bg-muted/80 px-4 py-2 text-sm font-medium transition-colors"
          >
            {loading ? "Cargando..." : "Actualizar"}
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
                  <td className="px-4 py-8 text-center text-muted-foreground" colSpan={3}>{loading ? "Cargando..." : "Sin datos"}</td>
                </tr>
              )}
              {popular.map((p, idx) => (
                <motion.tr 
                  key={p.product_id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-t hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{p.name || p.product_id}</td>
                  <td className="px-4 py-3">{p.orders_count}</td>
                  <td className="px-4 py-3 font-semibold">${" "}{p.revenue.toFixed(2)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  )
}
