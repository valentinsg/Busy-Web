import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "../../_utils"

// Helper to parse customer info from notes
function parseCustomerFromNotes(notes: string | null): {
  full_name: string | null
  email: string | null
  phone: string | null
  dni: string | null
  address: string | null
} {
  if (!notes) return { full_name: null, email: null, phone: null, dni: null, address: null }

  const emailMatch = notes.match(/Email:\s*([^\s,]+@[^\s,]+)/i)
  const phoneMatch = notes.match(/Tel:\s*([0-9]+)/i)
  const dniMatch = notes.match(/DNI:\s*([0-9]+)/i)
  const nameMatch = notes.match(/Cliente:\s*([^,\.]+)/i)
  const addressMatch = notes.match(/Dirección:\s*([^,]+(?:,[^,]+)*)/i)

  return {
    full_name: nameMatch ? nameMatch[1].trim() : null,
    email: emailMatch ? emailMatch[1].trim() : null,
    phone: phoneMatch ? phoneMatch[1].trim() : null,
    dni: dniMatch ? dniMatch[1].trim() : null,
    address: addressMatch ? addressMatch[1].trim() : null,
  }
}

export async function POST(req: NextRequest) {
  const auth = await assertAdmin(req)
  if (!auth.ok) return auth.res

  try {
    const body = await req.json()
    const { order_id } = body

    if (!order_id) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 })
    }

    const supabase = auth.svc

    // Get order details
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("status", "pending")
      .single()

    if (orderErr) throw orderErr
    if (!order) {
      return NextResponse.json(
        { error: "Order not found or already processed" },
        { status: 404 }
      )
    }

    // Parse customer info from notes
    const customerInfo = parseCustomerFromNotes(order.notes)

    let customerId = order.customer_id

    // If no customer_id, try to find or create customer
    if (!customerId && (customerInfo.email || customerInfo.phone)) {
      // Try to find existing customer by email or phone
      let existingCustomer = null

      if (customerInfo.email) {
        const { data } = await supabase
          .from("customers")
          .select("id")
          .eq("email", customerInfo.email)
          .single()
        existingCustomer = data
      }

      if (!existingCustomer && customerInfo.phone) {
        const { data } = await supabase
          .from("customers")
          .select("id")
          .eq("phone", customerInfo.phone)
          .single()
        existingCustomer = data
      }

      if (existingCustomer) {
        customerId = existingCustomer.id
      } else {
        // Create new customer
        const { data: newCustomer, error: customerErr } = await supabase
          .from("customers")
          .insert({
            full_name: customerInfo.full_name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            dni: customerInfo.dni,
            address: customerInfo.address,
          })
          .select("id")
          .single()

        if (customerErr) {
          console.error("Failed to create customer:", customerErr)
          // Continue without customer_id
        } else {
          customerId = newCustomer.id
        }
      }
    }

    // Get order items to decrement stock
    const { data: orderItems, error: itemsErr } = await supabase
      .from("order_items")
      .select("product_id, variant_size, quantity")
      .eq("order_id", order_id)

    if (itemsErr) {
      console.error("Failed to get order items:", itemsErr)
    }

    // Decrement stock for each item
    let stockDecrementedCount = 0
    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        // Try RPC first
        const { error: stockErr } = await supabase.rpc("decrement_product_stock", {
          p_product_id: item.product_id,
          p_size: item.variant_size ?? null,
          p_qty: item.quantity,
        })

        if (stockErr) {
          console.error("RPC decrement_product_stock failed, trying direct update:", stockErr)

          // Fallback: direct update if RPC doesn't exist
          const { data: product } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.product_id)
            .single()

          if (product) {
            const newStock = Math.max(0, (product.stock || 0) - item.quantity)
            const { error: updateErr } = await supabase
              .from("products")
              .update({ stock: newStock })
              .eq("id", item.product_id)

            if (updateErr) {
              console.error("Direct stock update also failed:", updateErr)
            } else {
              console.log(`Stock decremented for ${item.product_id}: ${product.stock} -> ${newStock}`)
              stockDecrementedCount++
            }
          }
        } else {
          console.log(`Stock decremented via RPC for ${item.product_id}, qty: ${item.quantity}`)
          stockDecrementedCount++
        }
      }
    }

    // Update order status to 'paid' and link customer
    const { data: updatedOrder, error: updateErr } = await supabase
      .from("orders")
      .update({
        status: "paid",
        customer_id: customerId,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id)
      .eq("status", "pending")
      .select()
      .single()

    if (updateErr) throw updateErr

    // Auto-generate shipping label if Envia is configured
    let labelResult = null
    if (isAutoLabelEnabled()) {
      try {
        labelResult = await generateAutoLabel(order_id)
        if (labelResult.success) {
          console.log("Auto-label generated for transfer order", {
            order_id,
            tracking_number: labelResult.tracking_number,
            carrier: labelResult.carrier,
          })
        }
      } catch (labelErr) {
        console.error("Auto-label generation error for transfer", labelErr)
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      customer_created: !order.customer_id && !!customerId,
      stock_decremented: stockDecrementedCount,
      label_generated: labelResult?.success || false,
      tracking_number: labelResult?.tracking_number || null,
      message: "Order confirmed and stock updated"
    })
  } catch (error: unknown) {
    console.error("Error confirming order:", error)
    return NextResponse.json(
      { error: "Failed to confirm order" },
      { status: 500 }
    )
  }
}
