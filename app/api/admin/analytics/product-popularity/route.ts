import { NextResponse } from "next/server"
import { getProductPopularity } from "@/lib/repo/analytics"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20
    const data = await getProductPopularity(limit)
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}
