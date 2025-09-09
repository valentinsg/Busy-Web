import { NextResponse } from "next/server"
import { getCustomerOrders } from "@/lib/repo/customers"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customer_id")
    const limit = Number(searchParams.get("limit") || 10)
    if (!customerId) return NextResponse.json({ error: "customer_id requerido" }, { status: 400 })
    const orders = await getCustomerOrders(customerId, limit)
    return NextResponse.json({ ok: true, orders })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}
