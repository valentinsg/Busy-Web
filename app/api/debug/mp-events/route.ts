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
  const mapped = (data || []).map((row: any) => {
    const p = row?.raw ?? {}
    const status = p?.status || p?.body?.status || p?.response?.status
    const status_detail = p?.status_detail || p?.body?.status_detail || p?.response?.status_detail
    const payment_method_id = p?.payment_method_id || p?.body?.payment_method_id || p?.response?.payment_method_id
    const payment_type_id = p?.payment_type_id || p?.body?.payment_type_id || p?.response?.payment_type_id
    const external_reference = p?.external_reference || p?.body?.external_reference || p?.response?.external_reference

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
