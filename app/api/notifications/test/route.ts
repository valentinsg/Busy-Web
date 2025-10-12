import { NextRequest, NextResponse } from 'next/server'
import { createNotification } from '@/lib/repo/notifications'
import { sendPushNotification } from '@/lib/notifications/server'
import { z } from 'zod'

/**
 * POST /api/notifications/test
 * Send a test notification (for development/testing)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const schema = z.object({
      type: z.enum([
        'new_order',
        'pending_transfer',
        'artist_submission',
        'low_stock',
        'newsletter_subscription',
        'order_cancelled',
        'payment_error',
        'weekly_report',
        'monthly_report',
        'newsletter_reminder',
      ]),
      title: z.string().optional(),
      message: z.string().optional(),
    })

    const { type, title, message } = schema.parse(body)

    // Create notification in database
    const notificationId = await createNotification({
      type,
      title: title || `Test: ${type}`,
      message: message || 'This is a test notification',
      metadata: { test: true, timestamp: new Date().toISOString() },
      action_url: '/admin/notifications',
    })

    if (!notificationId) {
      throw new Error('Failed to create notification')
    }

    // Send push notification
    const pushResult = await sendPushNotification({
      title: title || `Test: ${type}`,
      body: message || 'This is a test notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        url: '/admin/notifications',
        notificationId,
      },
      tag: 'test-notification',
      requireInteraction: false,
    })

    return NextResponse.json({
      ok: true,
      notificationId,
      pushResult,
    })
  } catch (error: unknown) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
