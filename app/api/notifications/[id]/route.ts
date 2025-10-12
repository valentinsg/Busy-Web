import { NextRequest, NextResponse } from 'next/server'
import {
  getNotificationById,
  markNotificationRead,
  deleteNotification,
} from '@/lib/repo/notifications'

/**
 * GET /api/notifications/[id]
 * Get single notification
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notification = await getNotificationById(params.id)

    if (!notification) {
      return NextResponse.json(
        { ok: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true, notification })
  } catch (error: unknown) {
    console.error('Error fetching notification:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await markNotificationRead(params.id)

    if (!success) {
      throw new Error('Failed to mark notification as read')
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete notification
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteNotification(params.id)

    if (!success) {
      throw new Error('Failed to delete notification')
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
