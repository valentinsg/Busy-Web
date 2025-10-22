import { NextRequest, NextResponse } from 'next/server'
import { updateCategory, deleteCategory, type UpdateCategoryInput } from '@/lib/repo/categories'

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
    if (body.display_order !== undefined) input.display_order = body.display_order
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
