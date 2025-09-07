import { NextRequest, NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 })
    const svc = getServiceClient()
    const { data: product, error } = await svc.from("products").select("*").eq("id", id).maybeSingle()
    if (error) throw error
    return NextResponse.json({ ok: true, product })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 400 })
  }
}
