import { assertAdmin } from "@/app/api/admin/_utils"
import { NextRequest, NextResponse } from "next/server"

// Disable caching for this endpoint
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const auth = await assertAdmin(req)
  if (!auth.ok) return auth.res

  try {
    const supabase = auth.svc

    // Fetch pending orders with customer and items data
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select(`
        id,
        customer_id,
        total,
        subtotal,
        shipping,
        discount,
        tax,
        placed_at,
        notes,
        customers:customer_id (
          full_name,
          email,
          phone
        )
      `)
      .eq("status", "pending")
      .order("placed_at", { ascending: false })

    if (ordersErr) throw ordersErr

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: items } = await supabase
          .from("order_items")
          .select("product_name, quantity, unit_price, variant_size")
          .eq("order_id", order.id)

        return {
          ...order,
          customer: Array.isArray(order.customers) ? order.customers[0] : order.customers,
          items: items || [],
        }
      })
    )

    return NextResponse.json(
      { orders: ordersWithItems },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    )
  } catch (error: unknown) {
    console.error("Error fetching pending orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch pending orders" },
      { status: 500 }
    )
  }
}
