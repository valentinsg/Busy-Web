import { NextResponse } from "next/server"
import { getAllPromotionsAsync, createPromotionAsync } from "@/lib/repo/promotions"
import getServiceClient from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/promotions
 * Obtiene todas las promociones (admin)
 */
export async function GET() {
  try {
    // Verificar autenticación
    const supabase = await getServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const promotions = await getAllPromotionsAsync()
    return NextResponse.json(promotions)
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }
}

/**
 * POST /api/admin/promotions
 * Crea una nueva promoción
 */
export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const supabase = await getServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const promotion = await createPromotionAsync(body)
    
    if (!promotion) {
      return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 })
    }

    return NextResponse.json(promotion, { status: 201 })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 })
  }
}
