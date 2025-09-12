import { NextRequest, NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"
import { getPaymentClient } from "@/lib/mp/client"
import { logError, logInfo } from "@/lib/checkout/logger"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const session_id = url.searchParams.get("session_id")
  if (!session_id) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
  }

  try {
    const supabase = getServiceClient()

    // Get last temporary order record by session_id
    const { data: tmp, error: tmpErr } = await supabase
      .from("orders_tmp")
      .select("session_id, payment_id, status, preference_id, merchant_order_id, raw, created_at")
      .eq("session_id", session_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (tmpErr) {
      logError("order-status tmp query error", { error: tmpErr.message, session_id })
    }

    // If we have a payment_id, fetch latest status from Mercado Pago
    if (tmp?.payment_id) {
      try {
        const payments = getPaymentClient()
        const p: any = await payments.get({ id: String(tmp.payment_id) })
        const status: string = p?.status ?? p?.body?.status ?? p?.response?.status ?? tmp?.status ?? "unknown"
        const status_detail: string | undefined = p?.status_detail ?? p?.body?.status_detail ?? p?.response?.status_detail
        const preference_id: string | undefined = p?.preference_id ?? p?.body?.preference_id ?? p?.response?.preference_id ?? tmp?.preference_id
        const merchant_order_id: string | undefined = p?.order?.id ?? p?.body?.order?.id ?? p?.response?.order?.id ?? tmp?.merchant_order_id

        // Try to find the created order stored by the webhook
        const { data: order } = await supabase
          .from("orders")
          .select("id,total,tax,shipping,discount,currency,placed_at")
          .eq("payment_id", String(tmp.payment_id))
          .order("placed_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        const payload = {
          session_id,
          payment_id: String(tmp.payment_id),
          status,
          status_detail: status_detail ?? null,
          merchant_order_id: merchant_order_id ?? null,
          preference_id: preference_id ?? null,
          order: order ?? null,
        }

        logInfo("order-status from MP", payload)
        return NextResponse.json(payload)
      } catch (err: any) {
        logError("order-status MP fetch error", { error: String(err?.message || err), session_id, payment_id: tmp.payment_id })
        // Fall back to tmp record if MP call fails
        return NextResponse.json({
          session_id,
          payment_id: String(tmp.payment_id),
          status: tmp?.status ?? "unknown",
          status_detail: null,
          merchant_order_id: tmp?.merchant_order_id ?? null,
          preference_id: tmp?.preference_id ?? null,
        })
      }
    }

    // No payment yet recorded
    return NextResponse.json({ session_id, payment_id: null, status: "unknown" })
  } catch (err: any) {
    logError("order-status fatal", { error: String(err?.message || err) })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
