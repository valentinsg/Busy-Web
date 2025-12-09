import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../../../../_utils"

/**
 * GET /api/admin/newsletter/campaigns/[id]/events
 * Get tracking events for a campaign
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await assertAdmin(req)
  if (!admin.ok) return admin.res
  const svc = admin.svc

  try {
    const { data, error } = await svc
      .from("newsletter_campaign_events")
      .select("id, email, event_type, link_url, created_at")
      .eq("campaign_id", params.id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json({ ok: true, items: [] })
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, items: data || [] })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    )
  }
}
