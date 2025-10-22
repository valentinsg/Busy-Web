import { NextRequest, NextResponse } from 'next/server'
import { getAllCategories, createCategory, type CreateCategoryInput } from '@/lib/repo/categories'

/**
 * GET /api/admin/categories
 * Get all categories (including inactive)
 */
export async function GET() {
  try {
    const categories = await getAllCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/categories
 * Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.slug || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields: slug and name' },
        { status: 400 }
      )
    }
    
    const input: CreateCategoryInput = {
      slug: body.slug,
      name: body.name,
      description: body.description || null,
      display_order: body.display_order || 0,
      is_active: body.is_active !== undefined ? body.is_active : true,
    }
    
    const category = await createCategory(input)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create category' },
      { status: 500 }
    )
  }
}
