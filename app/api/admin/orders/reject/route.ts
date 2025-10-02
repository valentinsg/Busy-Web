import { NextRequest, NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_id } = body

    if (!order_id) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 })
    }

    const supabase = getServiceClient()

    // Get order details before cancelling (to restore stock)
    const { data: orderItems, error: itemsErr } = await supabase
      .from("order_items")
      .select("product_id, variant_size, quantity")
      .eq("order_id", order_id)

    if (itemsErr) throw itemsErr

    // Update order status to 'cancelled'
    const { data: order, error: updateErr } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id)
      .eq("status", "pending") // Only update if still pending
      .select()
      .single()

    if (updateErr) throw updateErr
    if (!order) {
      return NextResponse.json(
        { error: "Order not found or already processed" },
        { status: 404 }
      )
    }

    // Restore stock for cancelled items
    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        // Increment stock back
        const stockResult = await supabase.rpc("increment_product_stock", {
          p_product_id: item.product_id,
          p_size: item.variant_size ?? null,
          p_qty: item.quantity,
        })
        
        if (stockResult.error) {
          console.error("Failed to restore stock:", stockResult.error)
          // Continue even if stock restoration fails
        }
      }
    }

    // TODO: Send cancellation email to customer

    return NextResponse.json({ 
      success: true, 
      order,
      message: "Order cancelled successfully" 
    })
  } catch (error: unknown) {
    console.error("Error rejecting order:", error)
    return NextResponse.json(
      { error: "Failed to reject order" },
      { status: 500 }
    )
  }
}
