import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/server"

export async function PATCH(request: Request, { params }: { params: { code: string } }) {
  try {
    const body = await request.json()
    const { active } = body || {}
    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "active boolean requerido" }, { status: 400 })
    }
    const sb = getServiceClient()
    const { error } = await sb.from("coupons").update({ active }).eq("code", decodeURIComponent(params.code))
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { code: string } }) {
  try {
    const sb = getServiceClient()
    const { error } = await sb.from("coupons").delete().eq("code", decodeURIComponent(params.code))
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 })
  }
}
