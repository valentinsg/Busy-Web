import { NextResponse } from "next/server"
import { getHistoricalBalance } from "@/lib/repo/analytics"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get("from") || undefined
    const to = searchParams.get("to") || undefined

    const balance = await getHistoricalBalance({ from, to })

    return NextResponse.json({ ok: true, ...balance })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    )
  }
}
