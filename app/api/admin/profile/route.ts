import { getAuthorByEmail, updateAuthor, uploadAuthorAvatar } from '@/lib/repo/authors'
import getServiceClient from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/profile
 * Get current user's author profile
 */
export async function GET() {
  try {
    const supabase = getServiceClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const author = await getAuthorByEmail(supabase, user.email)

    if (!author) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(author)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/profile
 * Update current user's author profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getServiceClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current author profile
    const currentAuthor = await getAuthorByEmail(supabase, user.email)
    if (!currentAuthor) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, bio, instagram, twitter, linkedin, medium } = body

    const updatedAuthor = await updateAuthor(supabase, currentAuthor.id, {
      name,
      bio,
      instagram,
      twitter,
      linkedin,
      medium,
    })

    if (!updatedAuthor) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedAuthor)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
