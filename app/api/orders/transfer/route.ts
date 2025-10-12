import { NextRequest, NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"
import { validateCouponPercent } from "@/lib/checkout/coupons"
import { logError, logInfo } from "@/lib/checkout/logger"
import crypto from "node:crypto"

const CURRENCY = "ARS"

function badRequest(message: string, meta?: Record<string, unknown>) {
  logError(message, meta)
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      items: Array<{ product_id: string; quantity: number; variant_size?: string | null }>
      coupon_code?: string | null
      shipping_cost?: number
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

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return badRequest("Invalid items")
    }

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
    if (!products || products.length !== productIds.length) {
      return badRequest("Some products not found")
    }

    const itemsDetailed = body.items.map((it) => {
      const p = products.find((pp) => pp.id === it.product_id)!
      const unit_price = Number(p.price)
      return {
        product_id: it.product_id,
        product_name: p.name as string,
        quantity: it.quantity,
        unit_price,
        variant_size: it.variant_size ?? null,
      }
    })

    // Coupon validation
    const discount_percent = await validateCouponPercent(body.coupon_code)

    // Calculate totals (NO TAX for transfers)
    const subtotal = itemsDetailed.reduce((acc, i) => acc + i.unit_price * i.quantity, 0)
    const discount = discount_percent ? Number((subtotal * (discount_percent / 100)).toFixed(2)) : 0
    const shipping_cost = Number((body.shipping_cost ?? 0).toFixed(2))
    const tax = 0 // NO TAX for bank transfers
    const total = Number((subtotal - discount + shipping_cost).toFixed(2))

    // Create or find customer
    let customer_id: string | null = null
    const customer = body.customer

    if (customer?.email) {
      // Try to find existing customer
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("email", customer.email)
        .maybeSingle()

      if (existing?.id) {
        customer_id = existing.id
        // Update customer info
        await supabase
          .from("customers")
          .update({
            full_name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || null,
            phone: customer.phone ?? null,
            last_seen_at: new Date().toISOString(),
          })
          .eq("id", customer_id)
      } else {
        // Create new customer
        const { data: created, error: custErr } = await supabase
          .from("customers")
          .insert({
            email: customer.email,
            full_name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || null,
            phone: customer.phone ?? null,
            last_seen_at: new Date().toISOString(),
          })
          .select("id")
          .single()
        if (custErr) throw custErr
        customer_id = created.id
      }
    }

    // Create order with status "pending" for transfers
    const order_id = crypto.randomUUID()

    // Try to insert with payment_method, fallback if column doesn't exist
    let order: { id: string } | null = null
    let orderErr: Error | null = null

    const orderPayload = {
      id: order_id,
      customer_id,
      channel: "web" as const,
      status: "pending", // Pending until transfer is verified
      currency: CURRENCY,
      subtotal,
      discount,
      shipping: shipping_cost,
      tax, // 0 for transfers
      total,
      notes: `Pago por transferencia. Cliente: ${customer?.first_name} ${customer?.last_name}. Email: ${customer?.email}. Tel: ${customer?.phone}. DNI: ${customer?.dni || "N/A"}. Dirección: ${customer?.address || ""}, ${customer?.city || ""}, ${customer?.state || ""}, CP: ${customer?.zip || ""}`,
      placed_at: new Date().toISOString(),
    }

    // Try with payment_method first
    const firstTry = await supabase
      .from("orders")
      .insert({ ...orderPayload, payment_method: "transfer" })
      .select("*")
      .single()

    order = firstTry.data
    orderErr = firstTry.error

    // If payment_method column doesn't exist, retry without it
    if (orderErr && String(orderErr.message || "").toLowerCase().includes("payment_method")) {
      const secondTry = await supabase
        .from("orders")
        .insert(orderPayload)
        .select("*")
        .single()
      order = secondTry.data
      orderErr = secondTry.error
    }

    if (orderErr) throw orderErr
    if (!order) throw new Error("Failed to create order")

    // TypeScript narrowing: order is guaranteed to be non-null here
    const createdOrder = order

    // Insert order items
    const itemsPayload = itemsDetailed.map((it) => ({
      order_id: createdOrder.id,
      product_id: it.product_id,
      product_name: it.product_name,
      variant_size: it.variant_size,
      quantity: it.quantity,
      unit_price: it.unit_price,
      total: it.unit_price * it.quantity,
    }))

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(itemsPayload)

    if (itemsErr) throw itemsErr

    // Decrement stock
    for (const it of itemsDetailed) {
      const stockResult = await supabase.rpc("decrement_product_stock", {
        p_product_id: it.product_id,
        p_size: it.variant_size ?? null,
        p_qty: it.quantity,
      })
      // Ignore stock errors for now
      if (stockResult.error) {
        logError("Stock decrement failed", { product_id: it.product_id, error: stockResult.error })
      }
    }

    // Handle newsletter opt-in
    if (body.newsletter_opt_in && customer?.email && customer_id) {
      const newsletterResult = await supabase
        .from("customers")
        .update({ newsletter_opt_in: true })
        .eq("id", customer_id)
      // Ignore newsletter errors
      if (newsletterResult.error) {
        logError("Newsletter opt-in failed", { customer_id, error: newsletterResult.error })
      }
    }

    logInfo("Transfer order created", { order_id, customer_id, total })

    return NextResponse.json({
      order_id,
      total,
      customer_email: customer?.email,
    })
  } catch (err: unknown) {
    logError("create-transfer-order failed", { error: String(err?.toString() || err) })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
