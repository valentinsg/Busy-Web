import { logError, logInfo } from "@/lib/checkout/logger"
import { sendInvoiceEmail } from "@/lib/email/resend"
import { getPaymentClient } from "@/lib/mp/client"
import { generateAutoLabel, isAutoLabelEnabled } from "@/lib/shipping"
import getServiceClient from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

function ok() { return NextResponse.json({ ok: true }) }

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get("token")
  const secret = process.env.MP_WEBHOOK_SECRET_TOKEN
  if (!secret || token !== secret) {
    logError("Unauthorized webhook token (processing anyway)", { token })
  }

  let payload: unknown
  try { payload = await req.json() } catch { payload = null }

  // Helpers to safely access unknown objects
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
  const toStr = (v: unknown): string | undefined =>
    typeof v === 'string' || typeof v === 'number' ? String(v) : undefined

  // Mercado Pago can send topic/type and data.id
  const rawType =
    toStr(getPath(payload, ['type'])) ||
    toStr(getPath(payload, ['topic'])) ||
    toStr(getPath(payload, ['action']))
  const paymentId =
    toStr(getPath(payload, ['data', 'id'])) ||
    toStr(getPath(payload, ['resource', 'id'])) ||
    toStr(getPath(payload, ['id']))

  const isPayment = !!rawType && (rawType === 'payment' || rawType.startsWith('payment.'))

  logInfo("MP webhook received", { rawType, paymentId, payload })

  if (!isPayment || !paymentId) {
    logInfo("Ignoring non-payment event", { rawType, paymentId })
    return ok()
  }

  const supabase = getServiceClient()

  // Idempotency: insert webhook_events unique(payment_id, event_type)
  const { error: insertEvtErr } = await supabase
    .from("webhook_events")
    .insert({ payment_id: String(paymentId), event_type: String(rawType ?? ''), raw: payload })
  if (insertEvtErr && !String(insertEvtErr.message || "").includes("duplicate key")) {
    // Real failure other than duplicate
    logError("Failed to record webhook event", { error: insertEvtErr.message })
    return ok()
  }

  try {
    const payments = getPaymentClient()
    const payment = await payments.get({ id: String(paymentId) })
    const p: unknown = payment as unknown
    const status: string =
      toStr(getPath(p, ['status'])) ||
      toStr(getPath(p, ['body', 'status'])) ||
      toStr(getPath(p, ['response', 'status'])) ||
      ''
    const status_detail: string | undefined =
      toStr(getPath(p, ['status_detail'])) ||
      toStr(getPath(p, ['body', 'status_detail'])) ||
      toStr(getPath(p, ['response', 'status_detail']))
    const payment_method_id: string | undefined =
      toStr(getPath(p, ['payment_method_id'])) ||
      toStr(getPath(p, ['body', 'payment_method_id'])) ||
      toStr(getPath(p, ['response', 'payment_method_id']))
    const payment_type_id: string | undefined =
      toStr(getPath(p, ['payment_type_id'])) ||
      toStr(getPath(p, ['body', 'payment_type_id'])) ||
      toStr(getPath(p, ['response', 'payment_type_id']))
    const external_reference: string | undefined =
      toStr(getPath(p, ['external_reference'])) ||
      toStr(getPath(p, ['body', 'external_reference'])) ||
      toStr(getPath(p, ['response', 'external_reference']))
    const metadata: unknown =
      getPath(p, ['metadata']) ||
      getPath(p, ['body', 'metadata']) ||
      getPath(p, ['response', 'metadata'])
    const preference_id: string | undefined =
      toStr(getPath(p, ['preference_id'])) ||
      toStr(getPath(p, ['body', 'preference_id'])) ||
      toStr(getPath(p, ['response', 'preference_id']))
    const merchant_order_id: string | undefined =
      toStr(getPath(p, ['order', 'id'])) ||
      toStr(getPath(p, ['body', 'order', 'id'])) ||
      toStr(getPath(p, ['response', 'order', 'id']))

    let mapped: "approved" | "rejected" | "in_process" | "pending" | "cancelled"
    if (status === "approved") mapped = "approved"
    else if (status === "rejected" || status === "cancelled") mapped = "rejected"
    else if (status === "in_process" || status === "in_mediation" || status === "authorized") mapped = "in_process"
    else mapped = "pending"

    if (!external_reference) {
      logError("Payment missing external_reference", { paymentId, status, status_detail, payment_method_id, payment_type_id })
      return ok()
    }

    const order_id = external_reference // This is now the DB Order ID

    // Snapshot into orders_tmp for order-status endpoint (optional but kept for debugging)
    try {
      await supabase.from("orders_tmp").insert({
        session_id: order_id,
        payment_id: String(paymentId),
        status,
        status_detail: status_detail ?? null,
        preference_id: preference_id ?? null,
        merchant_order_id: merchant_order_id ?? null,
        raw: (getPath(p, ['body']) ?? p ?? null) as unknown,
      })
    } catch (e: unknown) {
      logError("orders_tmp insert error", { error: String((e as Error)?.message || String(e)), order_id, paymentId })
    }

    // Status Handling
    if (status === "approved") {
      logInfo("Processing approved payment for order", { order_id, paymentId })

      // 1. Fetch Order
      const { data: order, error: orderFetchErr } = await supabase
        .from("orders")
        .select("id, status")
        .eq("id", order_id)
        .single()

      if (orderFetchErr || !order) {
        logError("Order not found or access error", { order_id, error: orderFetchErr?.message })
        return ok()
      }

      // 2. Idempotency Check
      if (order.status === "paid") {
        logInfo("Order already paid, skipping", { order_id })
        return ok()
      }

      // 3. Trigger Paid RPC (Updates status + Decrements Stock)
      const { error: rpcErr } = await supabase.rpc("process_order_paid", { p_order_id: order.id, p_payment_id: String(paymentId) })

      if (rpcErr) {
        logError("process_order_paid failed, attempting fallback", { order_id: order.id, error: rpcErr.message })

        // Fallback: manually decrements stock
        const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id)
        if (items && items.length > 0) {
          for (const item of items) {
            const { error: stockRpcErr } = await supabase.rpc("decrement_product_stock", {
              p_product_id: item.product_id,
              p_size: item.variant_size ?? null,
              p_qty: item.quantity,
            })
            if (stockRpcErr) {
              // Last resort: update table directly (not atomic but better than nothing)
              const { data: p } = await supabase.from("products").select("stock").eq("id", item.product_id).single()
              if (p) {
                await supabase.from("products").update({ stock: Math.max(0, (p.stock || 0) - item.quantity) }).eq("id", item.product_id)
              }
            }
          }
        }

        // Update Order Status
        await supabase
          .from("orders")
          .update({
            status: "paid",
            payment_id: String(paymentId),
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", order.id)

        logInfo("Order manually marked as paid (fallback)", { order_id: order.id })
      } else {
        logInfo("Order processed successfully via RPC", { order_id: order.id })
      }

      // 4. Send Invoice Email (fire and forget)
      // Refetch full order with items for email
      const { data: fullOrder } = await supabase
        .from("orders")
        .select("*, order_items(*), customers(email)")
        .eq("id", order_id)
        .single()

      if (fullOrder && fullOrder.customers?.email) {
        try {
          await sendInvoiceEmail({
            to: fullOrder.customers.email,
            order: fullOrder,
            items: fullOrder.order_items,
            paymentId: String(paymentId),
            tax: fullOrder.tax,
            shipping: fullOrder.shipping,
            discount: fullOrder.discount,
          })
        } catch (emailErr) {
          logError("Failed to send email", { order_id, error: String(emailErr) })
        }
      }

      // 5. Generate Auto Label (if enabled)
      if (isAutoLabelEnabled()) {
        generateAutoLabel(order_id).catch((e) => logError("Auto label failed", { error: String(e) }))
      }

    } else if (status === "cancelled" || status === "rejected") {
      // Mark as failed/canceled if currently pending
      await supabase
        .from("orders")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("id", order_id)
        .in("status", ["pending", "created"]) // Only cancel if it wasn't paid yet

      logInfo("Order marked as canceled/rejected", { order_id, status })
    }

  } catch (err: unknown) {
    logError("webhook processing error", { error: String((err as Error)?.message || String(err)) })
  }

  return ok()
}
