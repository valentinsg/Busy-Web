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

    // Update order status to 'paid'
    const { data: order, error: updateErr } = await supabase
      .from("orders")
      .update({
        status: "paid",
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

    // TODO: Send confirmation email to customer
    // TODO: Trigger order fulfillment workflow

    return NextResponse.json({ 
      success: true, 
      order,
      message: "Order confirmed successfully" 
    })
  } catch (error: unknown) {
    console.error("Error confirming order:", error)
    return NextResponse.json(
      { error: "Failed to confirm order" },
      { status: 500 }
    )
  }
}
