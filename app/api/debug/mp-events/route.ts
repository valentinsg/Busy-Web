import { NextRequest, NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get("token")
  const secret = process.env.MP_WEBHOOK_SECRET_TOKEN
  if (!secret || token !== secret) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const supabase = getServiceClient()

  // Fetch last 25 webhook events for quick diagnostics
  const { data, error } = await supabase
    .from("webhook_events")
    .select("payment_id, event_type, raw, created_at")
    .order("created_at", { ascending: false })
    .limit(25)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Try to map quick info from raw
  type WebhookRow = { payment_id: string; event_type: string; created_at: string; raw?: unknown }
  const getPath = (obj: unknown, path: string[]): unknown => {
    let cur: unknown = obj
    for (const key of path) {
      if (cur && typeof cur === 'object' && key in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[key]
      } else {
        return undefined
      }
    }
    return cur
  }
  const toStr = (v: unknown): string | undefined => (typeof v === 'string' || typeof v === 'number') ? String(v) : undefined

  const mapped = (data || []).map((row: WebhookRow) => {
    const p = row?.raw
    const status = toStr(getPath(p, ['status'])) || toStr(getPath(p, ['body', 'status'])) || toStr(getPath(p, ['response', 'status']))
    const status_detail = toStr(getPath(p, ['status_detail'])) || toStr(getPath(p, ['body', 'status_detail'])) || toStr(getPath(p, ['response', 'status_detail']))
    const payment_method_id = toStr(getPath(p, ['payment_method_id'])) || toStr(getPath(p, ['body', 'payment_method_id'])) || toStr(getPath(p, ['response', 'payment_method_id']))
    const payment_type_id = toStr(getPath(p, ['payment_type_id'])) || toStr(getPath(p, ['body', 'payment_type_id'])) || toStr(getPath(p, ['response', 'payment_type_id']))
    const external_reference = toStr(getPath(p, ['external_reference'])) || toStr(getPath(p, ['body', 'external_reference'])) || toStr(getPath(p, ['response', 'external_reference']))

    return {
      created_at: row.created_at,
      payment_id: row.payment_id,
      event_type: row.event_type,
      status,
      status_detail,
      payment_method_id,
      payment_type_id,
      external_reference,
    }
  })

  return NextResponse.json({ events: mapped })
}
