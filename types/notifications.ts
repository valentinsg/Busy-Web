// =====================================================
// NOTIFICATION TYPES
// =====================================================

export type NotificationType =
  | 'new_order'
  | 'pending_transfer'
  | 'artist_submission'
  | 'low_stock'
  | 'newsletter_subscription'
  | 'order_cancelled'
  | 'payment_error'
  | 'weekly_report'
  | 'monthly_report'
  | 'newsletter_reminder'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'

export type NotificationChannel = 'push' | 'email' | 'sms'

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'expired'

// =====================================================
// NOTIFICATION INTERFACES
// =====================================================

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  metadata: Record<string, any>
  action_url?: string | null
  read: boolean
  read_at?: string | null
  created_at: string
  expires_at?: string | null
}

export interface NotificationPreference {
  id: string
  notification_type: NotificationType
  enabled: boolean
  push_enabled: boolean
  email_enabled: boolean
  priority: NotificationPriority
  config: Record<string, any>
  updated_at: string
}

export interface PushSubscription {
  id: string
  endpoint: string
  p256dh: string
  auth: string
  user_agent?: string | null
  last_used_at: string
  created_at: string
}

export interface NotificationLog {
  id: string
  notification_id: string
  channel: NotificationChannel
  status: NotificationStatus
  error_message?: string | null
  sent_at?: string | null
  created_at: string
}

// =====================================================
// NOTIFICATION METADATA TYPES
// =====================================================

export interface NewOrderMetadata {
  order_id: string
  total: number
  channel: string
  customer_id?: string | null
  customer_name?: string | null
  payment_method?: string | null
  status?: string | null
}

export interface PendingTransferMetadata {
  order_id: string
  total: number
  customer_name?: string | null
}

export interface ArtistSubmissionMetadata {
  submission_id: string
  artist_name: string
  email: string
  genre?: string | null
  phone?: string | null
  track_url?: string | null
  spotify_url?: string | null
  instagram?: string | null
  youtube?: string | null
  message?: string | null
}

export interface LowStockMetadata {
  product_id: string
  product_name: string
  stock: number
  sku: string
}

export interface NewsletterSubscriptionMetadata {
  email: string
  subscriber_id: string
}

export interface OrderCancelledMetadata {
  order_id: string
  total: number
  customer_name?: string | null
  reason?: string | null
}

export interface PaymentErrorMetadata {
  order_id?: string
  error_code?: string
  error_message: string
  payment_provider?: string
}

export interface WeeklyReportMetadata {
  week_start: string
  week_end: string
  total_sales: number
  total_orders: number
  top_product?: string
}

export interface MonthlyReportMetadata {
  month: string
  year: number
  total_revenue: number
  total_expenses: number
  profit: number
  orders_count: number
}

export interface NewsletterReminderMetadata {
  days_since_last: number
  last_campaign_date?: string
}

// =====================================================
// NOTIFICATION SUMMARY
// =====================================================

export interface NotificationSummary {
  type: NotificationType
  total: number
  unread: number
  last_notification: string | null
}

// =====================================================
// NOTIFICATION HELPERS
// =====================================================

// Icon names from lucide-react
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  new_order: 'ShoppingBag',
  pending_transfer: 'CreditCard',
  artist_submission: 'Music',
  low_stock: 'AlertTriangle',
  newsletter_subscription: 'Mail',
  order_cancelled: 'XCircle',
  payment_error: 'AlertOctagon',
  weekly_report: 'BarChart3',
  monthly_report: 'TrendingUp',
  newsletter_reminder: 'BellRing',
}

export const NOTIFICATION_COLORS: Record<NotificationPriority, string> = {
  low: 'text-muted-foreground',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  critical: 'text-red-500',
}

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  new_order: 'Nueva Orden',
  pending_transfer: 'Transferencia Pendiente',
  artist_submission: 'Propuesta de Artista',
  low_stock: 'Stock Bajo',
  newsletter_subscription: 'Nueva Suscripción',
  order_cancelled: 'Orden Cancelada',
  payment_error: 'Error de Pago',
  weekly_report: 'Reporte Semanal',
  monthly_report: 'Reporte Mensual',
  newsletter_reminder: 'Recordatorio Newsletter',
}

// =====================================================
// WEB PUSH TYPES
// =====================================================

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  tag?: string
  requireInteraction?: boolean
}
