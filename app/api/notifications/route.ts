import { NextRequest, NextResponse } from 'next/server'
import { getNotifications, getUnreadCount, markAllNotificationsRead } from '@/lib/repo/notifications'
import type { NotificationType } from '@/types/notifications'

export const dynamic = 'force-dynamic'

/**
 * GET /api/notifications
 * Get all notifications with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unread') === 'true'
    const type = searchParams.get('type') || undefined

    const notifications = await getNotifications({
      limit,
      offset,
      unreadOnly,
      type: type as NotificationType | undefined,
    })

    const unreadCount = await getUnreadCount()

    return NextResponse.json({
      ok: true,
      notifications,
      unreadCount,
      pagination: {
        limit,
        offset,
        total: notifications.length,
      },
    })
  } catch (error: unknown) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 * Mark all notifications as read
 */
export async function PATCH() {
  try {
    const success = await markAllNotificationsRead()

    if (!success) {
      throw new Error('Failed to mark all notifications as read')
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
