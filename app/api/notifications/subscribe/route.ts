import { NextRequest, NextResponse } from 'next/server'
import { savePushSubscription, deletePushSubscription } from '@/lib/repo/notifications'
import { z } from 'zod'

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  userAgent: z.string().optional(),
})

/**
 * POST /api/notifications/subscribe
 * Subscribe to push notifications
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { endpoint, keys, userAgent } = subscribeSchema.parse(body)

    const success = await savePushSubscription({
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_agent: userAgent,
    })

    if (!success) {
      throw new Error('Failed to save push subscription')
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Error subscribing to push notifications:', error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/notifications/subscribe
 * Unsubscribe from push notifications
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { endpoint } = z.object({ endpoint: z.string() }).parse(body)

    const success = await deletePushSubscription(endpoint)

    if (!success) {
      throw new Error('Failed to delete push subscription')
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Error unsubscribing from push notifications:', error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    )
  }
}
