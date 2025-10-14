import { NextResponse } from "next/server"
import { getPromotionByIdAsync, updatePromotionAsync, deletePromotionAsync } from "@/lib/repo/promotions"
import getServiceClient from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/promotions/[id]
 * Obtiene una promoción por ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar autenticación
    const supabase = await getServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const promotion = await getPromotionByIdAsync(id)
    
    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    return NextResponse.json(promotion)
  } catch (error) {
    console.error('Error fetching promotion:', error)
    return NextResponse.json({ error: 'Failed to fetch promotion' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/promotions/[id]
 * Actualiza una promoción
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar autenticación
    const supabase = await getServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const promotion = await updatePromotionAsync(id, body)
    
    if (!promotion) {
      return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 })
    }

    return NextResponse.json(promotion)
  } catch (error) {
    console.error('Error updating promotion:', error)
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/promotions/[id]
 * Elimina una promoción
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar autenticación
    const supabase = await getServiceClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await deletePromotionAsync(id)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promotion:', error)
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 })
  }
}
