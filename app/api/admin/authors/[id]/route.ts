import { deleteAuthor, getAuthorById, updateAuthor } from '@/lib/repo/authors'
import getServiceClient from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/authors/[id]
 * Get author by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const author = await getAuthorById(supabase, params.id)

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    return NextResponse.json(author)
  } catch (error) {
    console.error('Error fetching author:', error)
    return NextResponse.json(
      { error: 'Failed to fetch author' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/authors/[id]
 * Update author
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, email, avatar_url, bio, instagram, twitter, linkedin, medium, active } =
      body

    const author = await updateAuthor(supabase, params.id, {
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
        { error: 'Failed to update author' },
        { status: 500 }
      )
    }

    return NextResponse.json(author)
  } catch (error) {
    console.error('Error updating author:', error)
    return NextResponse.json(
      { error: 'Failed to update author' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/authors/[id]
 * Delete author (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await deleteAuthor(supabase, params.id)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete author' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting author:', error)
    return NextResponse.json(
      { error: 'Failed to delete author' },
      { status: 500 }
    )
  }
}
