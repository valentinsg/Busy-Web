import getServiceClient from "@/lib/supabase/server"
import type { CustomerStats, ProductPopularity } from "@/types/commerce"

// Customer ranking helpers
export async function getCustomerRanking(params: {
  metric: "spend" | "frequency" | "recency"
  limit?: number
}): Promise<CustomerStats[]> {
  const supabase = getServiceClient()
  let query = supabase.from("customer_stats").select("*")
  switch (params.metric) {
    case "spend":
      query = query.order("total_spent", { ascending: false })
      break
    case "frequency":
      query = query.order("orders_count", { ascending: false })
      break
    case "recency":
      query = query.order("last_purchase_at", { ascending: false, nullsFirst: false })
      break
  }
  if (params.limit) query = query.limit(params.limit)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as CustomerStats[]
}

// Product popularity aggregations (view defined in SQL)
export async function getProductPopularity(limit = 20): Promise<ProductPopularity[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("product_popularity")
    .select("*")
    .order("revenue", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as ProductPopularity[]
}

// Revenue by channel within a date range
export async function getRevenueByChannel(params: {
  from?: string // ISO date
  to?: string // ISO date
}): Promise<Array<{ channel: string; orders: number; revenue: number }>> {
  const supabase = getServiceClient()
  // Fetch channel + total and aggregate in application code for reliability
  let query = supabase.from("orders").select("channel,total,placed_at")
  if (params.from) query = query.gte("placed_at", params.from)
  if (params.to) query = query.lte("placed_at", params.to)
  const { data, error } = await query
  if (error) throw error
  const agg = new Map<string, { channel: string; orders: number; revenue: number }>()
  for (const row of data ?? []) {
    const ch = String((row as any).channel)
    const total = Number((row as any).total) || 0
    if (!agg.has(ch)) agg.set(ch, { channel: ch, orders: 0, revenue: 0 })
    const a = agg.get(ch)!
    a.orders += 1
    a.revenue += total
  }
  return Array.from(agg.values()).sort((a, b) => b.revenue - a.revenue)
}

// Simple profit summary: revenue - expenses in date range
export async function getProfitSummary(params: {
  from?: string
  to?: string
}): Promise<{ revenue: number; expenses: number; profit: number }> {
  const supabase = getServiceClient()
  // Fetch values and aggregate in app to avoid PostgREST aggregate quirks
  let ordersQB = supabase.from("orders").select("total,placed_at")
  if (params.from) ordersQB = ordersQB.gte("placed_at", params.from)
  if (params.to) ordersQB = ordersQB.lte("placed_at", params.to)
  const { data: orderRows, error: revErr } = await ordersQB
  if (revErr) throw revErr

  let expensesQB = supabase.from("expenses").select("amount,incurred_at")
  if (params.from) expensesQB = expensesQB.gte("incurred_at", params.from)
  if (params.to) expensesQB = expensesQB.lte("incurred_at", params.to)
  const { data: expenseRows, error: expErr } = await expensesQB
  if (expErr) throw expErr

  const revenue = (orderRows ?? []).reduce((acc: number, r: any) => acc + Number(r.total || 0), 0)
  const expenses = (expenseRows ?? []).reduce((acc: number, r: any) => acc + Number(r.amount || 0), 0)
  return { revenue, expenses, profit: revenue - expenses }
}

// Utilities for bucketing dates
function toDateKey(d: Date, groupBy: 'day'|'week'|'month'): string {
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  if (groupBy === 'month') return `${year}-${String(month).padStart(2,'0')}`
  if (groupBy === 'week') {
    const tmp = new Date(Date.UTC(year, d.getUTCMonth(), d.getUTCDate()))
    const dayNum = tmp.getUTCDay() || 7
    tmp.setUTCDate(tmp.getUTCDate() - dayNum + 1) // Monday week start
    const wy = tmp.getUTCFullYear()
    const wFirstJan = new Date(Date.UTC(wy, 0, 1))
    const diff = Math.floor((tmp.getTime() - wFirstJan.getTime()) / 86400000)
    const week = Math.floor(diff / 7) + 1
    return `${wy}-W${String(week).padStart(2,'0')}`
  }
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

export async function getTimeSeries(params: {
  from?: string
  to?: string
  groupBy?: 'day'|'week'|'month'
}): Promise<Array<{ bucket: string; revenue: number; expenses: number; orders: number; profit: number }>> {
  const groupBy = params.groupBy || 'day'
  const supabase = getServiceClient()
  // fetch orders
  let ordersQB = supabase.from('orders').select('total,placed_at')
  if (params.from) ordersQB = ordersQB.gte('placed_at', params.from)
  if (params.to) ordersQB = ordersQB.lte('placed_at', params.to)
  const [{ data: orderRows, error: oErr }, { data: expRows, error: eErr }] = await Promise.all([
    ordersQB,
    (() => {
      let q = supabase.from('expenses').select('amount,incurred_at')
      if (params.from) q = q.gte('incurred_at', params.from)
      if (params.to) q = q.lte('incurred_at', params.to)
      return q
    })(),
  ])
  if (oErr) throw oErr
  if (eErr) throw eErr

  const agg = new Map<string, { revenue: number; expenses: number; orders: number }>()
  for (const r of orderRows ?? []) {
    const d = new Date(String((r as any).placed_at))
    const key = toDateKey(d, groupBy)
    const a = agg.get(key) || { revenue: 0, expenses: 0, orders: 0 }
    a.revenue += Number((r as any).total || 0)
    a.orders += 1
    agg.set(key, a)
  }
  for (const r of expRows ?? []) {
    const d = new Date(String((r as any).incurred_at))
    const key = toDateKey(d, groupBy)
    const a = agg.get(key) || { revenue: 0, expenses: 0, orders: 0 }
    a.expenses += Number((r as any).amount || 0)
    agg.set(key, a)
  }
  const out = Array.from(agg.entries())
    .map(([bucket, v]) => ({ bucket, revenue: v.revenue, expenses: v.expenses, orders: v.orders, profit: v.revenue - v.expenses }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket))
  return out
}

export async function getKPIs(params: { from?: string; to?: string }): Promise<{ orders: number; aov: number; new_customers: number }> {
  const supabase = getServiceClient()
  // Orders and revenue
  let ordersQB = supabase.from('orders').select('id,total,placed_at')
  if (params.from) ordersQB = ordersQB.gte('placed_at', params.from)
  if (params.to) ordersQB = ordersQB.lte('placed_at', params.to)
  const { data: orderRows, error: ordErr } = await ordersQB
  if (ordErr) throw ordErr
  const orders = (orderRows ?? []).length
  const revenue = (orderRows ?? []).reduce((acc: number, r: any) => acc + Number(r.total || 0), 0)
  const aov = orders > 0 ? revenue / orders : 0

  // New customers in period
  let custQB = supabase.from('customers').select('id,created_at')
  if (params.from) custQB = custQB.gte('created_at', params.from)
  if (params.to) custQB = custQB.lte('created_at', params.to)
  const { data: custRows, error: custErr } = await custQB
  if (custErr) throw custErr
  const new_customers = (custRows ?? []).length
  return { orders, aov, new_customers }
}
