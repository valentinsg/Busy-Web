import getServiceClient from "@/lib/supabase/server"
import type { Expense } from "@/types/commerce"

export async function listExpenses(params?: {
  from?: string
  to?: string
  category?: string
  supplier_id?: string
}): Promise<Expense[]> {
  const supabase = getServiceClient()
  let query = supabase.from("expenses").select("*").order("incurred_at", { ascending: false })
  if (params?.from) query = query.gte("incurred_at", params.from)
  if (params?.to) query = query.lte("incurred_at", params.to)
  if (params?.category) query = query.eq("category", params.category)
  if (params?.supplier_id) query = query.eq("supplier_id", params.supplier_id)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Expense[]
}

export async function createExpense(input: {
  category: string
  amount: number
  currency?: string
  description?: string | null
  supplier_id?: string | null
  channel?: string | null
  incurred_at?: string
  metadata?: Record<string, unknown> | null
}): Promise<Expense> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      category: input.category,
      amount: input.amount,
      currency: input.currency ?? "USD",
      description: input.description ?? null,
      supplier_id: input.supplier_id ?? null,
      channel: input.channel ?? null,
      incurred_at: input.incurred_at ?? new Date().toISOString(),
      metadata: input.metadata ?? null,
    })
    .select("*")
    .single()
  if (error) throw error
  return data as Expense
}
