import { NextResponse } from "next/server"
import getServiceClient from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get("limit") || 3)
    const from = searchParams.get("from") || ""
    const to = searchParams.get("to") || ""

    const supabase = getServiceClient()

    // Query para obtener los mejores clientes basado en revenue total
    let query = supabase
      .from("orders")
      .select(`
        customer_id,
        total,
        customers!inner(
          id,
          full_name,
          email
        )
      `)
      .eq("status", "completed")

    // Aplicar filtros de fecha si existen
    if (from) query = query.gte("placed_at", from)
    if (to) query = query.lte("placed_at", to)

    const { data: orders, error } = await query

    if (error) throw error

    // Agrupar por customer_id y sumar totales
    const customerMap = new Map<string, { 
      id: string
      name: string
      email: string
      total_spent: number
      orders_count: number
    }>()

    orders?.forEach((order: any) => {
      const customerId = order.customer_id
      if (!customerId) return

      const customer = order.customers
      if (!customer) return

      if (customerMap.has(customerId)) {
        const existing = customerMap.get(customerId)!
        existing.total_spent += Number(order.total || 0)
        existing.orders_count += 1
      } else {
        customerMap.set(customerId, {
          id: customerId,
          name: customer.full_name || customer.email || "Cliente sin nombre",
          email: customer.email || "",
          total_spent: Number(order.total || 0),
          orders_count: 1
        })
      }
    })

    // Convertir a array y ordenar por total_spent
    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, limit)

    return NextResponse.json({ 
      ok: true, 
      customers: topCustomers 
    })
  } catch (error: unknown) {
    console.error("Error fetching top customers:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}
