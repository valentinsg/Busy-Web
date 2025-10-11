'use client'

import { useState } from 'react'
import { Bell, Filter, Trash2, CheckCheck, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationItem } from '@/components/admin/notification-item'
import { Skeleton } from '@/components/ui/skeleton'
import { NOTIFICATION_LABELS, type NotificationType } from '@/types/notifications'
import Link from 'next/link'

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications

  // Group by type
  const groupedByType = notifications.reduce((acc, notification) => {
    const type = notification.type
    if (!acc[type]) acc[type] = []
    acc[type].push(notification)
    return acc
  }, {} as Record<NotificationType, typeof notifications>)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notificaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro de notificaciones personalizadas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/notifications/preferences">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Preferencias
            </Button>
          </Link>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">No leídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                notifications.filter(
                  (n) =>
                    new Date(n.created_at).toDateString() === new Date().toDateString()
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Esta semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                notifications.filter((n) => {
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return new Date(n.created_at) >= weekAgo
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            No leídas ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                {filter === 'all'
                  ? 'Todas tus notificaciones'
                  : 'Notificaciones sin leer'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No hay notificaciones</p>
                  <p className="text-sm mt-1">
                    {filter === 'unread'
                      ? 'Todas tus notificaciones están leídas'
                      : 'Aún no tienes notificaciones'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Grouped by type */}
      <Card>
        <CardHeader>
          <CardTitle>Por tipo</CardTitle>
          <CardDescription>Notificaciones agrupadas por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(groupedByType).map(([type, items]) => (
              <div
                key={type}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="text-sm font-medium mb-1">
                  {NOTIFICATION_LABELS[type as NotificationType]}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{items.length}</div>
                  {items.filter((i) => !i.read).length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {items.filter((i) => !i.read).length} nuevas
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
