import { NextRequest, NextResponse } from "next/server"
import { getPaymentClient } from "@/lib/mp/client"
import getServiceClient from "@/lib/supabase/server"
import { validateCouponPercent } from "@/lib/checkout/coupons"
import { logError, logInfo } from "@/lib/checkout/logger"

function ok() { return NextResponse.json({ ok: true }) }

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get("token")
  const secret = process.env.MP_WEBHOOK_SECRET_TOKEN
  if (!secret || token !== secret) {
    logError("Unauthorized webhook", { token })
    return new NextResponse("Unauthorized", { status: 401 })
  }

  let payload: any
  try { payload = await req.json() } catch { payload = null }

  // Mercado Pago can send topic/type and data.id
  const type = payload?.type || payload?.topic || payload?.action
  const paymentId = payload?.data?.id || payload?.resource?.id || payload?.id

  if (type !== "payment" || !paymentId) {
    logInfo("Ignoring non-payment event", { type, paymentId })
    return ok()
  }

  const supabase = getServiceClient()

  // Idempotency: insert webhook_events unique(payment_id, event_type)
  const { error: insertEvtErr } = await supabase
    .from("webhook_events")
    .insert({ payment_id: String(paymentId), event_type: String(type), raw: payload })
  if (insertEvtErr && !String(insertEvtErr.message || "").includes("duplicate key")) {
    // Real failure other than duplicate
    logError("Failed to record webhook event", { error: insertEvtErr.message })
    return ok()
  }

  try {
    const payments = getPaymentClient()
    const payment = await payments.get({ id: String(paymentId) })
    const p: any = payment as any
    const status: string = p?.status ?? p?.body?.status ?? p?.response?.status ?? ""
    const external_reference: string | undefined = p?.external_reference ?? p?.body?.external_reference ?? p?.response?.external_reference
    const metadata: any = p?.metadata ?? p?.body?.metadata ?? p?.response?.metadata

    let mapped: "approved" | "rejected" | "in_process" | "pending"
    if (status === "approved") mapped = "approved"
    else if (status === "rejected" || status === "cancelled") mapped = "rejected"
    else if (status === "in_process" || status === "in_mediation" || status === "authorized") mapped = "in_process"
    else mapped = "pending"

    if (!external_reference) {
      logError("Payment missing external_reference", { paymentId })
      return ok()
    }

    const session_id = external_reference

    if (mapped === "approved") {
      // Build order on-the-fly from metadata
      const itemsMeta: Array<{ product_id: string; quantity: number; variant_size?: string | null }> = Array.isArray(metadata?.items)
        ? metadata.items
        : []

      // Fetch products to compute trusted totals and titles
      const productIds = [...new Set(itemsMeta.map((i) => i.product_id))]
      const { data: products, error: prodErr } = await supabase
        .from("products")
        .select("id, name, price, images")
        .in("id", productIds)
      if (prodErr || !products || products.length !== productIds.length) {
        logError("Products not found for approved payment", { paymentId, productIds })
        return ok()
      }

      const detailed = itemsMeta.map((it) => {
        const pinfo = products.find((pp) => pp.id === it.product_id)!
        return {
          product_id: it.product_id,
          title: pinfo.name as string,
          quantity: it.quantity,
          unit_price: Number(pinfo.price),
          picture_url: Array.isArray(pinfo.images) && pinfo.images.length > 0 ? (pinfo.images[0] as string) : undefined,
          variant_size: it.variant_size ?? null,
        }
      })

      // Compute totals (shipping from metadata or 0) and coupon if any
      const shipping_cost = Number(metadata?.shipping_cost ?? 0)
      const items_total = detailed.reduce((acc, i) => acc + i.unit_price * i.quantity, 0)
      const coupon_code = (metadata?.coupon_code ?? null) as string | null
      const discount_percent = await validateCouponPercent(coupon_code)
      const discount = discount_percent ? Number(((items_total * discount_percent) / 100).toFixed(2)) : 0
      const order_total = Number((items_total - discount + shipping_cost).toFixed(2))

      // Resolve customer if email provided
      let customer_id: string | null = null
      const customer = (metadata?.customer ?? {}) as { email?: string | null; first_name?: string | null; last_name?: string | null; phone?: string | null }
      if (customer?.email) {
        const { data: existing } = await supabase.from("customers").select("id").eq("email", customer.email).maybeSingle()
        if (existing?.id) {
          customer_id = existing.id
        } else {
          const { data: created, error: custErr } = await supabase
            .from("customers")
            .insert({ email: customer.email, full_name: `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim(), phone: customer.phone ?? null, last_seen_at: new Date().toISOString() })
            .select("id")
            .single()
          if (!custErr && created?.id) customer_id = created.id
        }
      }

      // Create order (status created) and items, then mark paid via RPC (which also decrements stock)
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_id,
          channel: "web",
          status: "created",
          currency: "ARS",
          subtotal: items_total,
          discount,
          shipping: shipping_cost,
          tax: 0,
          total: order_total,
          notes: null,
          placed_at: new Date().toISOString(),
          payment_id: String(paymentId),
        })
        .select("*")
        .single()
      if (orderErr || !order?.id) {
        logError("Failed to create order on approved webhook", { paymentId, error: orderErr?.message })
        return ok()
      }

      const itemsPayload = detailed.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.title,
        variant_color: null,
        variant_size: i.variant_size,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total: Number((i.unit_price * i.quantity).toFixed(2)),
      }))
      const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload)
      if (itemsErr) {
        logError("Failed to insert order_items on approved webhook", { order_id: order.id, paymentId, error: itemsErr.message })
        return ok()
      }

      const { error: rpcErr } = await supabase.rpc("process_order_paid", { p_order_id: order.id, p_payment_id: String(paymentId) })
      if (rpcErr) {
        logError("process_order_paid failed", { order_id: order.id, paymentId, error: rpcErr.message })
      } else {
        logInfo("Order created and marked paid", { order_id: order.id, paymentId, session_id })
      }

      // Newsletter opt-in (idempotent by PK: email)
      if (metadata?.newsletter_opt_in && customer?.email) {
        await supabase
          .from("newsletter_subscribers")
          .upsert({ email: customer.email, status: "subscribed" }, { onConflict: "email", ignoreDuplicates: true })
      }
    } else if (mapped === "rejected" || mapped === "pending" || mapped === "in_process") {
      // Do nothing: we only create order/customer on approved as requested
      logInfo("Non-approved payment received", { session_id, paymentId, status: mapped })
    }
  } catch (err: any) {
    logError("webhook processing error", { error: String(err?.message || err) })
  }

  return ok()
}
