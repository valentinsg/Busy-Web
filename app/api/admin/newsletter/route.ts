import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../_utils"

export async function GET(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  const { data, error } = await svc.from("newsletter_subscribers").select("email,created_at").order("created_at", { ascending: false })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, items: data || [] })
}

export async function DELETE(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")
    if (!email) return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 })
    const { error } = await svc.from("newsletter_subscribers").delete().eq("email", email)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 400 })
  }
}
