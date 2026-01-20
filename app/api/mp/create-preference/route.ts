import { validateCouponPercent } from "@/lib/checkout/coupons"
import { logError, logInfo } from "@/lib/checkout/logger"
import { calcOrderTotals } from "@/lib/checkout/totals"
import { getPreferenceClient } from "@/lib/mp/client"
import { getFinalPrice } from "@/lib/pricing"
import { getSettingsServer } from "@/lib/repo/settings"
import getServiceClient from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

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
      .select("id, name, price, discount_percentage, discount_active, images")
      .in("id", productIds)
    if (prodErr) throw prodErr
    if (!products || products.length !== productIds.length) return badRequest("Some products not found")

    const itemsDetailed = body.items.map((it) => {
      const p = products.find((pp) => pp.id === it.product_id)!
      // Usar getFinalPrice para aplicar descuentos de producto
      const productForPricing = {
        price: Number(p.price),
        discountPercentage: p.discount_percentage ?? undefined,
        discountActive: Boolean(p.discount_active),
      }
      const unit_price = getFinalPrice(productForPricing)
      return {
        product_id: it.product_id,
        title: p.name as string,
        quantity: it.quantity,
        unit_price,
        original_price: Number(p.price),
        picture_url: Array.isArray(p.images) && p.images.length > 0 ? (p.images[0] as string) : undefined,
        variant_size: it.variant_size ?? null,
      }
    })

    // Coupon validation
    const discount_percent = await validateCouponPercent(body.coupon_code)

    // Load store settings (shipping)
    const settings = await getSettingsServer().catch(() => ({ shipping_flat_rate: 25000, shipping_free_threshold: 100000, christmas_mode: false }))

    // Totals
    const totals = calcOrderTotals({
      items: itemsDetailed.map((i) => ({ unit_price: i.unit_price, quantity: i.quantity })),
      shipping_cost: body.shipping_cost ?? undefined,
      shipping_rule: {
        flat_rate: Number(settings.shipping_flat_rate ?? 25000),
        free_threshold: Number(settings.shipping_free_threshold ?? 100000),
      },
      discount_percent: discount_percent ?? null,
    })

    // ---------------------------------------------------------
    // 1. Resolve Customer (Create or Update)
    // ---------------------------------------------------------
    let customer_id: string | null = null
    const customerData = body.customer
    if (customerData?.email) {
      const { data: existing } = await supabase.from("customers").select("id").eq("email", customerData.email).maybeSingle()
      if (existing?.id) {
        customer_id = existing.id
        // Update customer info (best effort)
        await supabase.from("customers").update({
          full_name: `${customerData.first_name ?? ""} ${customerData.last_name ?? ""}`.trim() || null,
          phone: customerData.phone ?? null,
          last_seen_at: new Date().toISOString(),
        }).eq("id", customer_id)
      } else {
        const { data: created, error: custErr } = await supabase
          .from("customers")
          .insert({
            email: customerData.email,
            full_name: `${customerData.first_name ?? ""} ${customerData.last_name ?? ""}`.trim(),
            phone: customerData.phone ?? null,
            last_seen_at: new Date().toISOString()
          })
          .select("id")
          .single()
        if (!custErr && created?.id) customer_id = created.id
      }
    }

    // ---------------------------------------------------------
    // 2. Prepare Shipping Address & Notes
    // ---------------------------------------------------------
    const shippingAddress = customerData ? {
      name: `${customerData.first_name ?? ""} ${customerData.last_name ?? ""}`.trim(),
      street: customerData.address ?? "",
      city: customerData.city ?? "",
      state: customerData.state ?? "",
      postal_code: customerData.zip ?? "",
      country: "AR",
      phone: customerData.phone ?? null,
      dni: customerData.dni ?? null,
      notes: null,
    } : null

    const orderNotes = customerData?.email
      ? `Pago online (Mercado Pago). Cliente: ${customerData.first_name ?? ""} ${customerData.last_name ?? ""}. Email: ${customerData.email}.`
      : "Pago online sin datos de cliente completos."


    // ---------------------------------------------------------
    // 3. Create Order (PENDING)
    // ---------------------------------------------------------
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        customer_id,
        channel: "web",
        status: "pending", // Initially pending, waiting for MP webhook
        currency: "ARS",
        subtotal: totals.items_total,
        discount: totals.discount,
        shipping: totals.shipping_cost,
        tax: totals.tax,
        total: totals.order_total,
        notes: orderNotes,
        placed_at: new Date().toISOString(),
        payment_method: "mercadopago",
        shipping_address: shippingAddress,
        shipping_status: "pending",
      })
      .select("id")
      .single()

    if (orderErr || !order?.id) {
      throw new Error(`Failed to create order: ${orderErr?.message}`)
    }

    const order_id = order.id

    // ---------------------------------------------------------
    // 4. Create Order Items
    // ---------------------------------------------------------
    const itemsPayload = itemsDetailed.map((i) => ({
      order_id,
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
      // If items fail, we should probably delete the order or log critical error
      logError("Failed to insert order items", { order_id, error: itemsErr.message })
      // Delete order to avoid ghost orders? Or just throw.
      await supabase.from("orders").delete().eq("id", order_id)
      throw new Error("Failed to create order items")
    }

    // ---------------------------------------------------------
    // 5. Handle Newsletter Opt-in
    // ---------------------------------------------------------
    if (body.newsletter_opt_in && customerData?.email) {
      await supabase
        .from("newsletter_subscribers")
        .upsert({ email: customerData.email, status: "subscribed" }, { onConflict: "email", ignoreDuplicates: true })
    }

    // ---------------------------------------------------------
    // 6. Create Mercado Pago Preference
    // ---------------------------------------------------------
    const pref = getPreferenceClient()

    // Build payer from provided customer data
    const payer = customerData
      ? {
        email: customerData.email ?? undefined,
        name: customerData.first_name ?? undefined,
        surname: customerData.last_name ?? undefined,
        phone: customerData.phone ? { area_code: undefined, number: customerData.phone } : undefined,
        identification: customerData.dni ? { type: "DNI", number: customerData.dni } : undefined,
        address: (customerData.address || customerData.city || customerData.state || customerData.zip)
          ? {
            street_name: customerData.address ?? undefined,
            zip_code: customerData.zip ?? undefined,
            city: customerData.city ?? undefined,
            state: customerData.state ?? undefined,
          }
          : undefined,
      }
      : undefined

    const binaryMode = IS_PROD ? false : String(process.env.MP_BINARY_MODE ?? "true").toLowerCase() !== "false"

    const mpPayload = {
      items: [
        ...itemsDetailed.map((i) => ({
          id: i.product_id,
          title: i.variant_size ? `${i.title} - Talle ${i.variant_size}` : i.title,
          description: i.variant_size ? `Producto: ${i.title} / Talle: ${i.variant_size}` : `Producto: ${i.title}`,
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
      binary_mode: binaryMode,
      auto_return: "approved" as const,
      external_reference: order_id, // LINKING ID HERE!
      back_urls: {
        success: `${BASE_URL}/order?session_id=${order_id}`, // Keep param name compatible with frontend check
        failure: `${BASE_URL}/order?session_id=${order_id}`,
        pending: `${BASE_URL}/order?session_id=${order_id}`,
      },
      notification_url: `${BASE_URL}/api/mp/webhook?token=${encodeURIComponent(process.env.MP_WEBHOOK_SECRET_TOKEN || "")}`,
      payer,
      metadata: {
        order_id, // Redundant but good for debugging
        session_id: order_id, // Keep for backward compat
        items: itemsDetailed.map((i) => ({ product_id: i.product_id, quantity: i.quantity, variant_size: i.variant_size })),
        coupon_code: body.coupon_code ?? null,
        shipping_cost: totals.shipping_cost,
        totals,
        customer: body.customer ?? null,
      },
    }

    logInfo("Creating MP preference for Order", {
      order_id,
      items: mpPayload.items,
      total: totals.order_total,
    })

    const preference = await pref.create({
      body: mpPayload,
    })

    const init_point = (preference as unknown as { init_point: string })?.init_point || (preference as unknown as { body: { init_point: string } })?.body?.init_point
    const preference_id = (preference as unknown as { id: string })?.id || (preference as unknown as { body: { id: string } })?.body?.id

    if (!init_point || !preference_id) throw new Error("Failed to create preference")

    // Update order with preference_id if you have a column for it (optional, skipped for now to keep schema unchanged)

    logInfo("Preference created", { order_id, preference_id })

    return NextResponse.json({ init_point, order_id })
  } catch (err: unknown) {
    logError("create-preference failed", { error: String(err?.toString() || err) })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
