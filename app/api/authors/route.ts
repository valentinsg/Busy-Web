import { getAllAuthors } from '@/lib/repo/authors'
import getServiceClient from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/authors
 * Get all active authors
 */
export async function GET() {
  try {
    const supabase = getServiceClient()
    const authors = await getAllAuthors(supabase)

    return NextResponse.json(authors)
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    )
  }
}
