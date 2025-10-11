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

    // Get order details before deleting (to restore stock)
    const { data: orderItems, error: itemsErr } = await supabase
      .from("order_items")
      .select("product_id, variant_size, quantity")
      .eq("order_id", order_id)

    if (itemsErr) throw itemsErr

    // Restore stock for rejected items
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

    // Delete order items first (foreign key constraint)
    const { error: deleteItemsErr } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", order_id)

    if (deleteItemsErr) {
      console.error("Error deleting order items:", deleteItemsErr)
      throw deleteItemsErr
    }

    // Delete the order itself (sin restricción de status)
    const { error: deleteOrderErr, count } = await supabase
      .from("orders")
      .delete()
      .eq("id", order_id)

    if (deleteOrderErr) {
      console.error("Error deleting order:", deleteOrderErr)
      throw deleteOrderErr
    }

    console.log(`Order ${order_id} deleted successfully. Rows affected: ${count}`)

    return NextResponse.json({ 
      success: true,
      message: "Order rejected and deleted successfully",
      deleted: true
    })
  } catch (error: unknown) {
    console.error("Error rejecting order:", error)
    return NextResponse.json(
      { error: "Failed to reject order" },
      { status: 500 }
    )
  }
}
