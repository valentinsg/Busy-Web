import { NextRequest, NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"

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
  try {
    const body = await req.json()
    const { order_id } = body

    if (!order_id) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 })
    }

    const supabase = getServiceClient()

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

    // Update order status to 'paid' and link customer
    const { data: updatedOrder, error: updateErr } = await supabase
      .from("orders")
      .update({
        status: "paid",
        customer_id: customerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id)
      .eq("status", "pending")
      .select()
      .single()

    if (updateErr) throw updateErr

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      customer_created: !order.customer_id && !!customerId,
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
