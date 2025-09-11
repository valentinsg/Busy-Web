import { NextRequest, NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"
import { getPreferenceClient } from "@/lib/mp/client"
import { calcOrderTotals } from "@/lib/checkout/totals"
import { validateCouponPercent } from "@/lib/checkout/coupons"
import { logError, logInfo } from "@/lib/checkout/logger"
import crypto from "node:crypto"

const BASE_URL = process.env.BASE_URL || process.env.SITE_URL
const CURRENCY = "ARS"

function badRequest(message: string, meta?: Record<string, any>) {
  logError(message, meta)
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      items: Array<{ product_id: string; quantity: number; variant_size?: string | null }>
      coupon_code?: string | null
      shipping_cost?: number | null
      customer?: {
        first_name?: string | null
        last_name?: string | null
        email?: string | null
        phone?: string | null
        address?: string | null
        city?: string | null
        state?: string | null
        zip?: string | null
      } | null
      newsletter_opt_in?: boolean | null
    }

    if (!BASE_URL) return badRequest("Missing BASE_URL env")
    if (!Array.isArray(body.items) || body.items.length === 0) return badRequest("Invalid items")

    // Validate quantities
    for (const it of body.items) {
      if (!it.product_id || !Number.isFinite(it.quantity) || it.quantity <= 0) {
        return badRequest("Invalid item payload")
      }
    }

    const supabase = getServiceClient()

    // Fetch product details and prices from server
    const productIds = [...new Set(body.items.map((i) => i.product_id))]
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price, images")
      .in("id", productIds)
    if (prodErr) throw prodErr
    if (!products || products.length !== productIds.length) return badRequest("Some products not found")

    const itemsDetailed = body.items.map((it) => {
      const p = products.find((pp) => pp.id === it.product_id)!
      const unit_price = Number(p.price)
      return {
        product_id: it.product_id,
        title: p.name as string,
        quantity: it.quantity,
        unit_price,
        picture_url: Array.isArray(p.images) && p.images.length > 0 ? (p.images[0] as string) : undefined,
        variant_size: it.variant_size ?? null,
      }
    })

    // Coupon validation
    const discount_percent = await validateCouponPercent(body.coupon_code)

    // Totals
    const totals = calcOrderTotals({
      items: itemsDetailed.map((i) => ({ unit_price: i.unit_price, quantity: i.quantity })),
      shipping_cost: body.shipping_cost ?? 0,
      discount_percent: discount_percent ?? null,
    })

    // We DO NOT create the order yet. We'll create it only if payment is approved (webhook).
    // Create a session id to correlate the flow
    const session_id = crypto.randomUUID()

    // Create Mercado Pago preference
    const pref = getPreferenceClient()
    const preference = await pref.create({
      body: {
        items: itemsDetailed.map((i) => ({
          id: i.product_id,
          title: i.title,
          quantity: i.quantity,
          unit_price: Number(i.unit_price.toFixed(2)),
          currency_id: CURRENCY,
          picture_url: i.picture_url,
        })),
        // Enviar datos del comprador ayuda a reducir rechazos por riesgo
        payer: {
          email: body.customer?.email ?? undefined,
          name: body.customer?.first_name ?? undefined,
          surname: body.customer?.last_name ?? undefined,
          phone: body.customer?.phone ? { number: body.customer.phone } : undefined,
          address: body.customer?.address || body.customer?.zip
            ? {
                street_name: body.customer?.address ?? undefined,
                zip_code: body.customer?.zip ?? undefined,
              }
            : undefined,
        },
        binary_mode: true,
        auto_return: "approved",
        external_reference: session_id,
        back_urls: {
          success: `${BASE_URL}/checkout/success`,
          failure: `${BASE_URL}/checkout/failure`,
          pending: `${BASE_URL}/checkout/pending`,
        },
        notification_url: `${BASE_URL}/api/mp/webhook?token=${encodeURIComponent(process.env.MP_WEBHOOK_SECRET_TOKEN || "")}`,
        // Descriptor del resumen de tarjeta (máx 22 chars). Configurable por env.
        statement_descriptor: (process.env.MP_STATEMENT_DESCRIPTOR || undefined),
        metadata: {
          session_id,
          items: itemsDetailed.map((i) => ({ product_id: i.product_id, quantity: i.quantity, variant_size: i.variant_size })),
          coupon_code: body.coupon_code ?? null,
          shipping_cost: totals.shipping_cost,
          totals,
          customer: body.customer ?? null,
          newsletter_opt_in: !!body.newsletter_opt_in,
        },
      },
    })

    const init_point = (preference as any)?.init_point || (preference as any)?.sandbox_init_point || (preference as any)?.body?.init_point || (preference as any)?.body?.sandbox_init_point
    const preference_id = (preference as any)?.id || (preference as any)?.body?.id
    if (!init_point || !preference_id) throw new Error("Failed to create preference")

    logInfo("Preference created", { session_id, preference_id })

    return NextResponse.json({ init_point, order_id: session_id })
  } catch (err: any) {
    logError("create-preference failed", { error: String(err?.message || err) })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
