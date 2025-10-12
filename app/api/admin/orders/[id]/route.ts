import { NextRequest, NextResponse } from "next/server"
import { getOrderById, updateOrder } from "@/lib/repo/orders"
import { z } from "zod"

const updateSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "completed", "cancelled"]).optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/admin/orders/[id]
 * Get order by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await getOrderById(params.id)
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error: unknown) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Update order
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const success = await updateOrder(params.id, data)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
