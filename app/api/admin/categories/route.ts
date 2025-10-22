import { NextRequest, NextResponse } from 'next/server'
import { getAllCategories, createCategory, type CreateCategoryInput } from '@/lib/repo/categories'
import { getServiceClient } from '@/lib/supabase/server'

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
    
    // Compute next display_order if not provided
    let nextOrder = 0
    try {
      const supabase = getServiceClient()
      const { data: maxRow } = await supabase
        .from('product_categories')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle()
      nextOrder = (maxRow?.display_order ?? 0) + 1
    } catch {
      nextOrder = 0
    }

    const input: CreateCategoryInput = {
      slug: body.slug,
      name: body.name,
      description: body.description || null,
      display_order: (body.display_order ?? nextOrder),
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
