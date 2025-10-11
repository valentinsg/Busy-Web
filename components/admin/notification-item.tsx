'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  X, 
  ExternalLink,
  ShoppingBag,
  CreditCard,
  Music,
  AlertTriangle,
  Mail,
  XCircle,
  AlertOctagon,
  BarChart3,
  TrendingUp,
  BellRing,
  type LucideIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/notifications'
import { NOTIFICATION_ICONS, NOTIFICATION_COLORS } from '@/types/notifications'

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingBag,
  CreditCard,
  Music,
  AlertTriangle,
  Mail,
  XCircle,
  AlertOctagon,
  BarChart3,
  TrendingUp,
  BellRing,
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }

    if (notification.action_url) {
      window.location.href = notification.action_url
    }
  }

  const iconName = NOTIFICATION_ICONS[notification.type] || 'BellRing'
  const IconComponent = ICON_MAP[iconName] || BellRing
  const priorityColor = NOTIFICATION_COLORS[notification.priority]

  return (
    <div
      className={cn(
        'p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group',
        !notification.read && 'bg-accent/5'
      )}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-brand animate-pulse" />
      )}

      <div className="flex items-start gap-3 pl-4">
        {/* Icon */}
        <div className={cn('p-2 rounded-lg bg-muted/50', priorityColor)}>
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                'text-sm font-heading font-medium line-clamp-1',
                !notification.read && 'font-bold'
              )}
            >
              {notification.title}
            </h4>

            {/* Delete button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(notification.id)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 font-body">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground font-body">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: es,
              })}
            </span>

            {notification.action_url && (
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
