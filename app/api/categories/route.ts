import { NextResponse } from 'next/server'
import { getActiveCategories } from '@/lib/repo/categories'

export async function GET() {
  try {
    const categories = await getActiveCategories()
    // Expose only needed fields to clients
    return NextResponse.json(categories.map(c => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      display_order: c.display_order,
    })))
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load categories' }, { status: 500 })
  }
}
