import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../../../../_utils"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc

  try {
    const { data, error } = await svc
      .from("newsletter_campaign_recipients")
      .select("email, status, created_at")
      .eq("campaign_id", params.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ ok: true, items: data || [] })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 400 })
  }
}
