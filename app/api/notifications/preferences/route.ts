import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getNotificationPreferences,
  updateNotificationPreference,
} from '@/lib/repo/notifications'
import type { NotificationType } from '@/types/notifications'
/**
 * GET /api/notifications/preferences
 * Get all notification preferences
 */
export async function GET() {
  try {
    const preferences = await getNotificationPreferences()
    return NextResponse.json({ ok: true, preferences })
  } catch (error: unknown) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications/preferences
 * Update notification preference
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const schema = z.object({
      notification_type: z.string(),
      enabled: z.boolean().optional(),
      push_enabled: z.boolean().optional(),
      email_enabled: z.boolean().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      config: z.record(z.any()).optional(),
    })

    const { notification_type, ...updates } = schema.parse(body)

    const success = await updateNotificationPreference(notification_type as NotificationType, updates)

    if (!success) {
      throw new Error('Failed to update notification preference')
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('Error updating notification preference:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}
