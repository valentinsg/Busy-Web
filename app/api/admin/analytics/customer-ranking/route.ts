import { NextResponse } from "next/server"
import { getCustomerRanking } from "@/lib/repo/analytics"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const metric = (searchParams.get("metric") || "spend") as "spend" | "frequency" | "recency"
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20

    if (!["spend", "frequency", "recency"].includes(metric)) {
      return NextResponse.json({ error: "metric inválido" }, { status: 400 })
    }

    const data = await getCustomerRanking({ metric, limit })
    return NextResponse.json({ ok: true, data })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}
