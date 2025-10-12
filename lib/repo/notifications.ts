import { getServiceClient } from '@/lib/supabase/server'
import type {
  Notification,
  NotificationPreference,
  NotificationSummary,
  NotificationType,
  NotificationPriority,
  PushSubscription,
} from '@/types/notifications'

// =====================================================
// NOTIFICATIONS CRUD
// =====================================================

/**
 * Get all notifications (paginated)
 */
export async function getNotifications(params?: {
  limit?: number
  offset?: number
  unreadOnly?: boolean
  type?: NotificationType
}): Promise<Notification[]> {
  const supabase = getServiceClient()
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  if (params?.unreadOnly) {
    query = query.eq('read', false)
  }

  if (params?.type) {
    query = query.eq('type', params.type)
  }

  if (params?.limit) {
    query = query.limit(params.limit)
  }

  if (params?.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data || []
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount(): Promise<number> {
  const supabase = getServiceClient()
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)

  if (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }

  return count || 0
}

/**
 * Get notification by ID
 */
export async function getNotificationById(id: string): Promise<Notification | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching notification:', error)
    return null
  }

  return data
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(id: string): Promise<boolean> {
  const supabase = getServiceClient()
  const { error } = await supabase.rpc('mark_notification_read', {
    p_notification_id: id,
  })

  if (error) {
    console.error('Error marking notification as read:', error)
    return false
  }

  return true
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<boolean> {
  const supabase = getServiceClient()
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }

  return true
}

/**
 * Delete notification
 */
export async function deleteNotification(id: string): Promise<boolean> {
  const supabase = getServiceClient()
  const { error } = await supabase.from('notifications').delete().eq('id', id)

  if (error) {
    console.error('Error deleting notification:', error)
    return false
  }

  return true
}

/**
 * Get notification summary (grouped by type)
 */
export async function getNotificationSummary(): Promise<NotificationSummary[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase.from('notification_summary').select('*')

  if (error) {
    console.error('Error fetching notification summary:', error)
    return []
  }

  return data || []
}

// =====================================================
// NOTIFICATION PREFERENCES
// =====================================================

/**
 * Get all notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreference[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .order('notification_type')

  if (error) {
    console.error('Error fetching notification preferences:', error)
    return []
  }

  return data || []
}

/**
 * Update notification preference
 */
export async function updateNotificationPreference(
  notificationType: NotificationType,
  updates: Partial<Omit<NotificationPreference, 'id' | 'notification_type' | 'updated_at'>>
): Promise<boolean> {
  const supabase = getServiceClient()
  const { error } = await supabase
    .from('notification_preferences')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('notification_type', notificationType)

  if (error) {
    console.error('Error updating notification preference:', error)
    return false
  }

  return true
}

// =====================================================
// PUSH SUBSCRIPTIONS
// =====================================================

/**
 * Save push subscription
 */
export async function savePushSubscription(subscription: {
  endpoint: string
  p256dh: string
  auth: string
  user_agent?: string
}): Promise<boolean> {
  const supabase = getServiceClient()
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        user_agent: subscription.user_agent || null,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' }
    )

  if (error) {
    console.error('Error saving push subscription:', error)
    return false
  }

  return true
}

/**
 * Get all push subscriptions
 */
export async function getPushSubscriptions(): Promise<PushSubscription[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .order('last_used_at', { ascending: false })

  if (error) {
    console.error('Error fetching push subscriptions:', error)
    return []
  }

  return data || []
}

/**
 * Delete push subscription
 */
export async function deletePushSubscription(endpoint: string): Promise<boolean> {
  const supabase = getServiceClient()
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)

  if (error) {
    console.error('Error deleting push subscription:', error)
    return false
  }

  return true
}

// =====================================================
// MANUAL NOTIFICATION CREATION
// =====================================================

/**
 * Create manual notification (for testing or custom events)
 */
export async function createNotification(params: {
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, unknown>
  action_url?: string
  priority?: NotificationPriority
}): Promise<string | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase.rpc('create_notification', {
    p_type: params.type,
    p_title: params.title,
    p_message: params.message,
    p_metadata: params.metadata || {},
    p_action_url: params.action_url || null,
  })

  if (error) {
    console.error('Error creating notification:', error)
    return null
  }

  return data
}

// =====================================================
// CLEANUP
// =====================================================

/**
 * Cleanup old notifications (call from cron job)
 */
export async function cleanupOldNotifications(): Promise<boolean> {
  const supabase = getServiceClient()
  const { error } = await supabase.rpc('cleanup_old_notifications')

  if (error) {
    console.error('Error cleaning up old notifications:', error)
    return false
  }

  return true
}
