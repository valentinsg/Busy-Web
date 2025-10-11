import { NextResponse } from "next/server"
import { getOrders } from "@/lib/repo/orders"

// Disable caching for this endpoint
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Optional filters
    const status = searchParams.get('status') || undefined
    const channel = searchParams.get('channel') || undefined
    const customer_id = searchParams.get('customer_id') || undefined
    const payment_method = searchParams.get('payment_method') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { orders, total } = await getOrders({
      status,
      channel,
      customer_id,
      payment_method,
      limit,
      offset,
    })

    return NextResponse.json(
      { 
        orders,
        total,
        limit,
        offset
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    )
  } catch (error: unknown) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
