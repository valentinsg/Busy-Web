import { logError, logInfo } from "@/lib/checkout/logger"
import { getEnviaClient, type EnviaAddress } from "@/lib/envia"
import getServiceClient from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type LabelRequestBody = {
  order_id: string
  carrier: string
  service: string
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LabelRequestBody

    if (!body.order_id) {
      return badRequest("order_id is required")
    }
    if (!body.carrier || !body.service) {
      return badRequest("carrier and service are required")
    }

    const supabase = getServiceClient()
    const envia = getEnviaClient()

    // Check if Envia is configured
    if (!envia.isConfigured()) {
      return NextResponse.json(
        { error: "Envia.com is not configured. Please set ENVIA_API_KEY." },
        { status: 503 }
      )
    }

    // Get order with items
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", body.order_id)
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if label already exists
    if (order.label_url && order.tracking_number) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        label_url: order.label_url,
        tracking_number: order.tracking_number,
        carrier: order.carrier,
        shipment_id: order.shipment_id,
      })
    }

    // Get order items for package info
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, product_name, quantity")
      .eq("order_id", body.order_id)

    const itemCount = items?.reduce((sum, it) => sum + it.quantity, 0) || 1

    // Parse shipping address from order
    const shippingAddr = order.shipping_address as {
      name?: string
      street?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
      phone?: string
    } | null

    if (!shippingAddr || !shippingAddr.city || !shippingAddr.postal_code) {
      return badRequest("Order does not have a valid shipping address")
    }

    // Build destination address
    const destination: EnviaAddress = {
      name: shippingAddr.name || "Cliente",
      phone: shippingAddr.phone || "",
      street: shippingAddr.street || "",
      city: shippingAddr.city,
      state: shippingAddr.state || shippingAddr.city,
      country: shippingAddr.country || "AR",
      postalCode: shippingAddr.postal_code,
    }

    // Build package
    const pkg = envia.buildPackage({
      itemCount,
      totalValue: order.total || 0,
      description: `Pedido #${order.id.slice(0, 8)} - Busy Streetwear`,
    })

    logInfo("Creating Envia shipment", {
      order_id: body.order_id,
      carrier: body.carrier,
      service: body.service,
      destination: destination.city,
    })

    // Create shipment with Envia
    const shipment = await envia.createShipment({
      origin: envia.getOriginAddress(),
      destination,
      packages: [pkg],
      carrier: body.carrier,
      service: body.service,
    })

    logInfo("Envia shipment created", {
      order_id: body.order_id,
      shipmentId: shipment.shipmentId,
      trackingNumber: shipment.trackingNumber,
    })

    // Update order with shipping info
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        carrier: shipment.carrier || body.carrier,
        tracking_number: shipment.trackingNumber,
        label_url: shipment.label,
        shipment_id: shipment.shipmentId,
        shipping_status: "label_created",
        shipping_cost_actual: shipment.totalPrice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.order_id)

    if (updateErr) {
      logError("Failed to update order with shipping info", {
        order_id: body.order_id,
        error: updateErr.message,
      })
    }

    return NextResponse.json({
      success: true,
      label_url: shipment.label,
      tracking_number: shipment.trackingNumber,
      carrier: shipment.carrier || body.carrier,
      shipment_id: shipment.shipmentId,
      shipping_cost: shipment.totalPrice,
      track_url: shipment.trackUrl,
    })
  } catch (err: unknown) {
    logError("shipping/label error", {
      error: String((err as Error)?.message || err),
    })
    return NextResponse.json(
      { error: "Failed to create shipping label", details: String((err as Error)?.message || err) },
      { status: 500 }
    )
  }
}
