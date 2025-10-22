import { NextRequest, NextResponse } from 'next/server'
import { updateCategory, deleteCategory, type UpdateCategoryInput } from '@/lib/repo/categories'
import { getServiceClient } from '@/lib/supabase/server'

/**
 * PATCH /api/admin/categories/[id]
 * Update a category
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params
    
    const input: UpdateCategoryInput = {}
    
    if (body.slug !== undefined) input.slug = body.slug
    if (body.name !== undefined) input.name = body.name
    if (body.description !== undefined) input.description = body.description
    // If reordering, swap with the category currently occupying that position to avoid duplicates
    if (body.display_order !== undefined) {
      const supabase = getServiceClient()
      // Fetch current category to know previous order
      const { data: current } = await supabase
        .from('product_categories')
        .select('id, display_order')
        .eq('id', id)
        .maybeSingle()

      const targetOrder = Number(body.display_order)
      if (current && current.display_order !== targetOrder) {
        // Find category with the target order
        const { data: other } = await supabase
          .from('product_categories')
          .select('id, display_order')
          .eq('display_order', targetOrder)
          .neq('id', id)
          .maybeSingle()

        // Move the other category to current order first (if exists)
        if (other?.id) {
          await supabase
            .from('product_categories')
            .update({ display_order: current.display_order })
            .eq('id', other.id)
        }

        input.display_order = targetOrder
      } else {
        input.display_order = targetOrder
      }
    }
    if (body.is_active !== undefined) input.is_active = body.is_active
    
    const category = await updateCategory(id, input)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update category' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await deleteCategory(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    )
  }
}
