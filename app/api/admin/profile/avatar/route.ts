import { getAuthorByEmail, updateAuthor, uploadAuthorAvatar, deleteAuthorAvatar } from '@/lib/repo/authors'
import getServiceClient from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/profile/avatar
 * Upload avatar for current user
 */
export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Delete old avatar if exists
    if (currentAuthor.avatar && currentAuthor.avatar.includes('/authors/')) {
      await deleteAuthorAvatar(supabase, currentAuthor.avatar)
    }

    // Upload new avatar
    const avatarUrl = await uploadAuthorAvatar(supabase, currentAuthor.id, file)

    if (!avatarUrl) {
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      )
    }

    // Update author with new avatar URL
    const updatedAuthor = await updateAuthor(supabase, currentAuthor.id, {
      avatar_url: avatarUrl,
    })

    if (!updatedAuthor) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ avatar_url: avatarUrl })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/profile/avatar
 * Delete avatar for current user
 */
export async function DELETE() {
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

    // Delete avatar from storage
    if (currentAuthor.avatar && currentAuthor.avatar.includes('/authors/')) {
      await deleteAuthorAvatar(supabase, currentAuthor.avatar)
    }

    // Update author to remove avatar URL
    const updatedAuthor = await updateAuthor(supabase, currentAuthor.id, {
      avatar_url: null,
    })

    if (!updatedAuthor) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting avatar:', error)
    return NextResponse.json(
      { error: 'Failed to delete avatar' },
      { status: 500 }
    )
  }
}
