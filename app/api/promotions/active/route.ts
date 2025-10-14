import { NextResponse } from "next/server"
import { getActivePromotionsAsync } from "@/lib/repo/promotions"

export const dynamic = 'force-dynamic'

/**
 * GET /api/promotions/active
 * Obtiene todas las promociones activas
 */
export async function GET() {
  try {
    const promotions = await getActivePromotionsAsync()
    return NextResponse.json(promotions)
  } catch (error) {
    console.error('Error fetching active promotions:', error)
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }
}
