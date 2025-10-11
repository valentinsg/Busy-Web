import getServiceClient from "@/lib/supabase/server"
import type { CustomerStats, ProductPopularity } from "@/types/commerce"

// Get historical balance (all-time or filtered by date)
export async function getHistoricalBalance(params?: {
  from?: string
  to?: string
}): Promise<{
  total_revenue: number
  total_expenses: number
  balance: number
  orders_count: number
}> {
  const supabase = getServiceClient()
  
  // Get total revenue (exclude pending orders)
  let revenueQuery = supabase
    .from('orders')
    .select('total')
    .neq('status', 'pending')
  
  if (params?.from) revenueQuery = revenueQuery.gte('placed_at', params.from)
  if (params?.to) revenueQuery = revenueQuery.lte('placed_at', params.to)
  
  const { data: orders, error: ordersErr } = await revenueQuery
  if (ordersErr) throw ordersErr
  
  const total_revenue = (orders || []).reduce((sum, o) => sum + Number(o.total || 0), 0)
  const orders_count = (orders || []).length
  
  // Get total expenses
  let expensesQuery = supabase
    .from('expenses')
    .select('amount')
  
  if (params?.from) expensesQuery = expensesQuery.gte('incurred_at', params.from)
  if (params?.to) expensesQuery = expensesQuery.lte('incurred_at', params.to)
  
  const { data: expenses, error: expensesErr } = await expensesQuery
  if (expensesErr) throw expensesErr
  
  const total_expenses = (expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0)
  
  return {
    total_revenue,
    total_expenses,
    balance: total_revenue - total_expenses,
    orders_count
  }
}

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
  // Exclude pending orders from revenue calculations
  let query = supabase.from("orders").select("channel,total,placed_at").neq("status", "pending")
  if (params.from) query = query.gte("placed_at", params.from)
  if (params.to) query = query.lte("placed_at", params.to)
  const { data, error } = await query
  if (error) throw error
  type ChannelRow = { channel: string; total: number }
  const agg = new Map<string, { channel: string; orders: number; revenue: number }>()
  for (const row of (data as ChannelRow[] | null) ?? []) {
    const ch = String(row.channel)
    const total = Number(row.total) || 0
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
  // Exclude pending orders from profit calculations
  type OrderRow = { total: number; placed_at: string }
  let ordersQB = supabase.from("orders").select("total,placed_at").neq("status", "pending")
  if (params.from) ordersQB = ordersQB.gte("placed_at", params.from)
  if (params.to) ordersQB = ordersQB.lte("placed_at", params.to)
  const { data: orderRows, error: revErr } = await ordersQB
  if (revErr) throw revErr

  type ExpenseRow = { amount: number; incurred_at: string }
  let expensesQB = supabase.from("expenses").select("amount,incurred_at")
  if (params.from) expensesQB = expensesQB.gte("incurred_at", params.from)
  if (params.to) expensesQB = expensesQB.lte("incurred_at", params.to)
  const { data: expenseRows, error: expErr } = await expensesQB
  if (expErr) throw expErr

  const revenue = ((orderRows as OrderRow[] | null) ?? []).reduce((acc: number, r) => acc + Number(r.total || 0), 0)
  const expenses = ((expenseRows as ExpenseRow[] | null) ?? []).reduce((acc: number, r) => acc + Number(r.amount || 0), 0)
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
  includeComparison?: boolean
  category?: string
}): Promise<Array<{ bucket: string; revenue: number; expenses: number; revenue_prev?: number }>> {
  const groupBy = params.groupBy || 'day'
  const supabase = getServiceClient()
  type TSOrderRow = { total: number; placed_at: string; id: string }
  type TSExpenseRow = { amount: number; incurred_at: string }
  
  // fetch orders for current period (exclude pending)
  let ordersQB = supabase.from('orders').select('id,total,placed_at').neq('status', 'pending')
  if (params.from) ordersQB = ordersQB.gte('placed_at', params.from)
  if (params.to) ordersQB = ordersQB.lte('placed_at', params.to)
  const { data: orderRows, error: oErr } = await ordersQB
  if (oErr) throw oErr

  // If category filter is applied, filter orders by category
  let filteredOrderRows = orderRows
  if (params.category && params.category !== 'all' && orderRows) {
    const orderIds = orderRows.map(o => o.id)
    
    // Get order items with product category
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('order_id, products!inner(category)')
      .in('order_id', orderIds)
    
    if (orderItems) {
      // Get unique order IDs that match the category
      const matchingOrderIds = new Set(
        orderItems
          .filter((item: any) => {
            const productCategory = item.products?.category?.toLowerCase() || ''
            return productCategory.includes(params.category!.toLowerCase())
          })
          .map((item: any) => item.order_id)
      )
      
      // Filter orders to only those with matching category
      filteredOrderRows = orderRows.filter(o => matchingOrderIds.has(o.id))
    }
  }

  // fetch expenses for current period (always fetch, regardless of category filter)
  let expensesQB = supabase.from('expenses').select('amount,incurred_at')
  if (params.from) expensesQB = expensesQB.gte('incurred_at', params.from)
  if (params.to) expensesQB = expensesQB.lte('incurred_at', params.to)
  const { data: expenseRows, error: eErr } = await expensesQB
  if (eErr) throw eErr

  // Get all dates from both revenue and expenses to ensure complete timeline
  const allDates = new Set<string>()
  
  // Add dates from filtered revenue
  for (const r of ((filteredOrderRows as TSOrderRow[] | null) ?? [])) {
    const d = new Date(String(r.placed_at))
    allDates.add(toDateKey(d, groupBy))
  }
  
  // Add dates from expenses
  for (const e of ((expenseRows as TSExpenseRow[] | null) ?? [])) {
    const d = new Date(String(e.incurred_at))
    allDates.add(toDateKey(d, groupBy))
  }

  // Initialize aggregation map with all dates
  const agg = new Map<string, { revenue: number; expenses: number; revenue_prev?: number }>()
  for (const date of allDates) {
    agg.set(date, { revenue: 0, expenses: 0 })
  }
  
  // Aggregate revenue (use filtered orders)
  for (const r of ((filteredOrderRows as TSOrderRow[] | null) ?? [])) {
    const d = new Date(String(r.placed_at))
    const key = toDateKey(d, groupBy)
    const a = agg.get(key)!
    a.revenue += Number(r.total || 0)
  }

  // Aggregate expenses (always show all expenses, not filtered by category)
  for (const e of ((expenseRows as TSExpenseRow[] | null) ?? [])) {
    const d = new Date(String(e.incurred_at))
    const key = toDateKey(d, groupBy)
    const a = agg.get(key)!
    a.expenses += Number(e.amount || 0)
  }

  // If comparison requested, fetch previous period
  if (params.includeComparison && params.from && params.to) {
    const fromDate = new Date(params.from)
    const toDate = new Date(params.to)
    const diff = toDate.getTime() - fromDate.getTime()
    const prevFrom = new Date(fromDate.getTime() - diff)
    const prevTo = new Date(fromDate.getTime() - 1)
    
    let prevOrdersQB = supabase.from('orders').select('total,placed_at')
      .neq('status', 'pending')
      .gte('placed_at', prevFrom.toISOString().slice(0, 10))
      .lte('placed_at', prevTo.toISOString().slice(0, 10))
    const { data: prevOrderRows } = await prevOrdersQB
    
    const prevAgg = new Map<string, number>()
    for (const r of ((prevOrderRows as TSOrderRow[] | null) ?? [])) {
      const d = new Date(String(r.placed_at))
      const key = toDateKey(d, groupBy)
      prevAgg.set(key, (prevAgg.get(key) || 0) + Number(r.total || 0))
    }
    
    // Map previous period data to current period buckets
    const buckets = Array.from(agg.keys()).sort()
    const prevBuckets = Array.from(prevAgg.keys()).sort()
    buckets.forEach((bucket, idx) => {
      if (prevBuckets[idx]) {
        const a = agg.get(bucket)
        if (a) a.revenue_prev = prevAgg.get(prevBuckets[idx])
      }
    })
  }

  const out = Array.from(agg.entries())
    .map(([bucket, v]) => ({ bucket, revenue: v.revenue, expenses: v.expenses, revenue_prev: v.revenue_prev }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket))
  return out
}

export async function getKPIs(params: { from?: string; to?: string }): Promise<{ orders: number; aov: number; new_customers: number }> {
  const supabase = getServiceClient()
  // Orders and revenue (exclude pending)
  let ordersQB = supabase.from('orders').select('id,total,placed_at').neq('status', 'pending')
  if (params.from) ordersQB = ordersQB.gte('placed_at', params.from)
  if (params.to) ordersQB = ordersQB.lte('placed_at', params.to)
  const { data: orderRows, error: ordErr } = await ordersQB
  if (ordErr) throw ordErr
  const orders = (orderRows ?? []).length
  const revenue = ((orderRows as Array<{ total: number }> | null) ?? []).reduce((acc: number, r) => acc + Number(r.total || 0), 0)
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
