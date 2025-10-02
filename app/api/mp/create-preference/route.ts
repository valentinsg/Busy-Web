import { NextRequest, NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"
import { getPreferenceClient } from "@/lib/mp/client"
import { calcOrderTotals } from "@/lib/checkout/totals"
import { getSettingsServer } from "@/lib/repo/settings"
import { validateCouponPercent } from "@/lib/checkout/coupons"
import { logError, logInfo } from "@/lib/checkout/logger"
import crypto from "node:crypto"

const BASE_URL = process.env.BASE_URL || process.env.SITE_URL
const CURRENCY = "ARS"
const IS_PROD = process.env.NODE_ENV === "production"

function badRequest(message: string, meta?: Record<string, unknown>) {
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
        dni?: string | null
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

    // Load store settings (shipping)
    const settings = await getSettingsServer().catch(() => ({ shipping_flat_rate: 25000, shipping_free_threshold: 100000 }))

    // Totals
    const totals = calcOrderTotals({
      items: itemsDetailed.map((i) => ({ unit_price: i.unit_price, quantity: i.quantity })),
      // If client didn't provide shipping, let server rule compute it
      shipping_cost: body.shipping_cost ?? undefined,
      shipping_rule: {
        flat_rate: Number(settings.shipping_flat_rate ?? 25000),
        free_threshold: Number(settings.shipping_free_threshold ?? 100000),
      },
      discount_percent: discount_percent ?? null,
    })

    // We DO NOT create the order yet. We'll create it only if payment is approved (webhook).
    // Create a session id to correlate the flow
    const session_id = crypto.randomUUID()

    // Create Mercado Pago preference
    const pref = getPreferenceClient()
    // Build payer from provided customer data to improve risk assessment
    const customer = body.customer ?? null
    const payer = customer
      ? {
          email: customer.email ?? undefined,
          name: customer.first_name ?? undefined,
          surname: customer.last_name ?? undefined,
          phone: customer.phone
            ? {
                area_code: undefined,
                number: customer.phone,
              }
            : undefined,
          identification: customer.dni
            ? {
                type: "DNI",
                number: customer.dni,
              }
            : undefined,
          address:
            customer.address || customer.city || customer.state || customer.zip
              ? {
                  street_name: customer.address ?? undefined,
                  zip_code: customer.zip ?? undefined,
                  city: customer.city ?? undefined,
                  state: customer.state ?? undefined,
                }
              : undefined,
        }
      : undefined

    // In production, force binary_mode = false (let payments go to review instead of auto-reject)
    // In dev, allow configuring via MP_BINARY_MODE (default true)
    const binaryMode = IS_PROD ? false : String(process.env.MP_BINARY_MODE ?? "true").toLowerCase() !== "false"

    const preference = await pref.create({
      body: {
        items: [
          ...itemsDetailed.map((i) => ({
            id: i.product_id,
            title: i.title,
            quantity: i.quantity,
            unit_price: Number(i.unit_price.toFixed(2)),
            currency_id: CURRENCY,
            picture_url: i.picture_url,
          })),
          ...(totals.shipping_cost > 0
            ? [{ id: "shipping", title: "Envío", quantity: 1, unit_price: Number(totals.shipping_cost.toFixed(2)), currency_id: CURRENCY }]
            : []),
          ...(totals.tax > 0
            ? [{ id: "online_tax", title: "Impuesto online (10%)", quantity: 1, unit_price: Number(totals.tax.toFixed(2)), currency_id: CURRENCY }]
            : []),
        ],
        // If binary_mode is true, MP will reject payments that need manual review.
        // Allow configuring it via env to reduce security rejections in production.
        binary_mode: binaryMode,
        auto_return: "approved",
        external_reference: session_id,
        back_urls: {
          success: `${BASE_URL}/order?session_id=${session_id}`,
          failure: `${BASE_URL}/order?session_id=${session_id}`,
          pending: `${BASE_URL}/order?session_id=${session_id}`,
        },
        notification_url: `${BASE_URL}/api/mp/webhook?token=${encodeURIComponent(process.env.MP_WEBHOOK_SECRET_TOKEN || "")}`,
        payer,
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

    // Only use production init_point; avoid sandbox fallback
    const init_point = (preference as unknown as { init_point: string })?.init_point || (preference as unknown as { body: { init_point: string } })?.body?.init_point
    const preference_id = (preference as unknown as { id: string })?.id || (preference as unknown as { body: { id: string } })?.body?.id
    if (!init_point || !preference_id) throw new Error("Failed to create preference")

    logInfo("Preference created", { session_id, preference_id })

    return NextResponse.json({ init_point, order_id: session_id })
  } catch (err: unknown) {
    logError("create-preference failed", { error: String(err?.toString() || err) })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
