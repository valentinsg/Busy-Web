import { NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("product_popularity")
      .select("*")
      .order("popularity", { ascending: false })
      .limit(limit)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, data })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}
