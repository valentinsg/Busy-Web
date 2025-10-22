import { createAuthor, getAllAuthors } from '@/lib/repo/authors'
import getServiceClient from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/authors
 * Get all authors (including inactive)
 */
export async function GET() {
  try {
    const supabase = getServiceClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching authors:', error)
      return NextResponse.json(
        { error: 'Failed to fetch authors' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/authors
 * Create a new author
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, email, avatar_url, bio, instagram, twitter, linkedin, medium, active } =
      body

    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID and name are required' },
        { status: 400 }
      )
    }

    const author = await createAuthor(supabase, {
      id,
      name,
      email,
      avatar_url,
      bio,
      instagram,
      twitter,
      linkedin,
      medium,
      active,
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Failed to create author' },
        { status: 500 }
      )
    }

    return NextResponse.json(author, { status: 201 })
  } catch (error) {
    console.error('Error creating author:', error)
    return NextResponse.json(
      { error: 'Failed to create author' },
      { status: 500 }
    )
  }
}
