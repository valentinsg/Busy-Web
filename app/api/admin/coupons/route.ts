import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const sb = getServiceClient()
    const { data, error } = await sb.from("coupons").select("code, percent, active, max_uses, used_count, expires_at").order("code")
    if (error) throw error
    return NextResponse.json({ items: data ?? [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, percent, active = true, max_uses = null, expires_at = null } = body || {}

    if (!code || typeof percent !== "number") {
      return NextResponse.json({ error: "code y percent son requeridos" }, { status: 400 })
    }
    if (percent < 1 || percent > 100) {
      return NextResponse.json({ error: "percent debe estar entre 1 y 100" }, { status: 400 })
    }

    const sb = getServiceClient()
    const { error } = await sb.from("coupons").insert({ code: String(code).toUpperCase().trim(), percent, active, max_uses, expires_at })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}
