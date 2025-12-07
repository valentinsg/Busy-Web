import { logError, logInfo } from "@/lib/checkout/logger"
import { getEnviaClient } from "@/lib/envia"
import getServiceClient from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * GET /api/shipping/tracking?order_id=xxx
 * Get tracking information for an order
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const order_id = url.searchParams.get("order_id")

    if (!order_id) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 })
    }

    const supabase = getServiceClient()
    const envia = getEnviaClient()

    // Get order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, tracking_number, carrier, shipping_status, shipped_at, delivered_at")
      .eq("id", order_id)
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!order.tracking_number || !order.carrier) {
      return NextResponse.json({
        success: true,
        status: order.shipping_status || "pending",
        message: "No tracking information available yet",
      })
    }

    // If Envia is not configured, return stored data only
    if (!envia.isConfigured()) {
      return NextResponse.json({
        success: true,
        tracking_number: order.tracking_number,
        carrier: order.carrier,
        status: order.shipping_status,
        shipped_at: order.shipped_at,
        delivered_at: order.delivered_at,
        source: "database",
      })
    }

    // Get live tracking from Envia
    try {
      const tracking = await envia.getTracking(order.tracking_number, order.carrier)

      // Map Envia status to our status
      let newStatus = order.shipping_status
      const enviaStatus = tracking.status?.toLowerCase() || ""

      if (enviaStatus.includes("delivered") || enviaStatus.includes("entregado")) {
        newStatus = "delivered"
      } else if (enviaStatus.includes("transit") || enviaStatus.includes("tránsito")) {
        newStatus = "in_transit"
      } else if (enviaStatus.includes("out for delivery") || enviaStatus.includes("en camino")) {
        newStatus = "out_for_delivery"
      } else if (enviaStatus.includes("shipped") || enviaStatus.includes("despachado")) {
        newStatus = "shipped"
      } else if (enviaStatus.includes("failed") || enviaStatus.includes("fallido")) {
        newStatus = "failed"
      } else if (enviaStatus.includes("returned") || enviaStatus.includes("devuelto")) {
        newStatus = "returned"
      }

      // Update order if status changed
      if (newStatus !== order.shipping_status) {
        const updateData: Record<string, unknown> = {
          shipping_status: newStatus,
          updated_at: new Date().toISOString(),
        }

        if (newStatus === "delivered" && !order.delivered_at) {
          updateData.delivered_at = new Date().toISOString()
        }
        if (newStatus === "shipped" && !order.shipped_at) {
          updateData.shipped_at = new Date().toISOString()
        }

        await supabase.from("orders").update(updateData).eq("id", order_id)

        logInfo("Order shipping status updated", {
          order_id,
          old_status: order.shipping_status,
          new_status: newStatus,
        })
      }

      return NextResponse.json({
        success: true,
        tracking_number: order.tracking_number,
        carrier: order.carrier,
        status: newStatus,
        status_description: tracking.statusDescription,
        events: tracking.events || [],
        shipped_at: order.shipped_at,
        delivered_at: newStatus === "delivered" ? order.delivered_at || new Date().toISOString() : null,
        source: "envia",
      })
    } catch (trackingErr) {
      logError("Failed to get live tracking", {
        order_id,
        error: String((trackingErr as Error)?.message || trackingErr),
      })

      // Return stored data on error
      return NextResponse.json({
        success: true,
        tracking_number: order.tracking_number,
        carrier: order.carrier,
        status: order.shipping_status,
        shipped_at: order.shipped_at,
        delivered_at: order.delivered_at,
        source: "database",
        error: "Could not fetch live tracking",
      })
    }
  } catch (err: unknown) {
    logError("shipping/tracking error", {
      error: String((err as Error)?.message || err),
    })
    return NextResponse.json(
      { error: "Failed to get tracking information" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/shipping/tracking
 * Manually update shipping status (for admin)
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      order_id: string
      status: string
      tracking_number?: string
      carrier?: string
    }

    if (!body.order_id || !body.status) {
      return NextResponse.json(
        { error: "order_id and status are required" },
        { status: 400 }
      )
    }

    const validStatuses = [
      "pending",
      "label_created",
      "shipped",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "failed",
      "returned",
    ]

    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()

    const updateData: Record<string, unknown> = {
      shipping_status: body.status,
      updated_at: new Date().toISOString(),
    }

    if (body.tracking_number) {
      updateData.tracking_number = body.tracking_number
    }
    if (body.carrier) {
      updateData.carrier = body.carrier
    }
    if (body.status === "shipped" ) {
      updateData.shipped_at = new Date().toISOString()
    }
    if (body.status === "delivered") {
      updateData.delivered_at = new Date().toISOString()
    }

    const { error: updateErr } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", body.order_id)

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to update shipping status" },
        { status: 500 }
      )
    }

    logInfo("Shipping status manually updated", {
      order_id: body.order_id,
      new_status: body.status,
    })

    return NextResponse.json({
      success: true,
      order_id: body.order_id,
      status: body.status,
    })
  } catch (err: unknown) {
    logError("shipping/tracking POST error", {
      error: String((err as Error)?.message || err),
    })
    return NextResponse.json(
      { error: "Failed to update shipping status" },
      { status: 500 }
    )
  }
}
