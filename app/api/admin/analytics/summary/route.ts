import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"
import { getRevenueByChannel, getProfitSummary, getTimeSeries, getKPIs } from "@/lib/repo/analytics"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get("from") || undefined
    const to = searchParams.get("to") || undefined
    const groupBy = (searchParams.get("groupBy") as 'day'|'week'|'month' | null) || 'day'
    const includeComparison = searchParams.get("comparison") === "true"
    const category = searchParams.get("category") || undefined

    const [revenueByChannel, profit, timeSeries, kpis] = await Promise.all([
      getRevenueByChannel({ from, to }),
      getProfitSummary({ from, to }),
      getTimeSeries({ from, to, groupBy, includeComparison, category }),
      getKPIs({ from, to }),
    ])

    return NextResponse.json({ ok: true, revenueByChannel, profit, timeSeries, kpis })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}
