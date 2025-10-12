'use client'

import { useEffect, useState, useCallback } from 'react'
import { Settings, TestTube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import {
  NOTIFICATION_LABELS,
  NOTIFICATION_ICONS,
  type NotificationPreference,
  type NotificationType,
} from '@/types/notifications'
import { Input } from '@/components/ui/input'

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { supported, permission, subscribed, loading: pushLoading, subscribe, unsubscribe } =
    usePushNotifications()

  const fetchPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      const data = await response.json()

      if (data.ok) {
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las preferencias',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Fetch preferences
  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  // Update preference
  const updatePreference = async (
    type: NotificationType,
    updates: Partial<NotificationPreference>
  ) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_type: type,
          ...updates,
        }),
      })

      if (!response.ok) throw new Error('Failed to update preference')

      setPreferences((prev) =>
        prev.map((p) => (p.notification_type === type ? { ...p, ...updates } : p))
      )

      toast({
        title: 'Guardado',
        description: 'Preferencia actualizada correctamente',
      })
    } catch (error) {
      console.error('Error updating preference:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la preferencia',
        variant: 'destructive',
      })
    }
  }

  // Send test notification
  const sendTestNotification = async (type: NotificationType) => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) throw new Error('Failed to send test notification')

      toast({
        title: 'Notificación enviada',
        description: 'Revisa tu campana de notificaciones',
      })
    } catch (error) {
      console.error('Error sending test notification:', error)
      toast({
        title: 'Error',
        description: 'No se pudo enviar la notificación de prueba',
        variant: 'destructive',
      })
    }
  }

  // Handle push subscription
  const handlePushToggle = async () => {
    try {
      if (subscribed) {
        await unsubscribe()
        toast({
          title: 'Desuscrito',
          description: 'Ya no recibirás notificaciones push',
        })
      } else {
        await subscribe()
        toast({
          title: 'Suscrito',
          description: 'Ahora recibirás notificaciones push',
        })
      }
    } catch (error: Error | unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al gestionar suscripción',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Preferencias de Notificaciones
        </h1>
        <p className="text-muted-foreground mt-1">
          Configura qué notificaciones quieres recibir y cómo
        </p>
      </div>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones Push</CardTitle>
          <CardDescription>
            Recibe notificaciones en tiempo real en tu navegador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!supported ? (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Tu navegador no soporta notificaciones push
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar notificaciones push</Label>
                  <p className="text-sm text-muted-foreground">
                    Estado: {permission === 'granted' ? '✅ Permitido' : '⚠️ No permitido'}
                  </p>
                </div>
                <Switch
                  checked={subscribed}
                  onCheckedChange={handlePushToggle}
                  disabled={pushLoading}
                />
              </div>

              {permission === 'denied' && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">
                    Has bloqueado las notificaciones. Debes habilitarlas desde la configuración
                    de tu navegador.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificaciones</CardTitle>
          <CardDescription>
            Activa o desactiva cada tipo de notificación
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {preferences.map((pref) => (
                <div
                  key={pref.notification_type}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">
                      {NOTIFICATION_ICONS[pref.notification_type]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">
                          {NOTIFICATION_LABELS[pref.notification_type]}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {pref.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {getNotificationDescription(pref.notification_type)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => sendTestNotification(pref.notification_type)}
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>

                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={(enabled) =>
                        updatePreference(pref.notification_type, { enabled })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración Avanzada</CardTitle>
          <CardDescription>Ajustes específicos por tipo de notificación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Low Stock Threshold */}
          <div className="space-y-2">
            <Label>Umbral de stock bajo</Label>
            <p className="text-sm text-muted-foreground">
              Notificar cuando el stock sea menor o igual a:
            </p>
            <Input
              type="number"
              min="1"
              max="50"
              defaultValue={
                preferences.find((p) => p.notification_type === 'low_stock')?.config
                  ?.threshold || 5
              }
              onChange={(e) => {
                const threshold = parseInt(e.target.value)
                if (threshold > 0) {
                  updatePreference('low_stock', {
                    config: { threshold },
                  })
                }
              }}
              className="w-32"
            />
          </div>

          {/* Newsletter Reminder Days */}
          <div className="space-y-2">
            <Label>Recordatorio de newsletter</Label>
            <p className="text-sm text-muted-foreground">
              Recordar enviar newsletter después de (días):
            </p>
            <Input
              type="number"
              min="1"
              max="30"
              defaultValue={
                preferences.find((p) => p.notification_type === 'newsletter_reminder')?.config
                  ?.days_since_last || 7
              }
              onChange={(e) => {
                const days = parseInt(e.target.value)
                if (days > 0) {
                  updatePreference('newsletter_reminder', {
                    config: { days_since_last: days },
                  })
                }
              }}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getNotificationDescription(type: NotificationType): string {
  const descriptions: Record<NotificationType, string> = {
    new_order: 'Cuando alguien realiza una compra',
    pending_transfer: 'Cuando hay una transferencia pendiente de confirmación',
    artist_submission: 'Cuando un artista envía una propuesta de colaboración',
    low_stock: 'Cuando un producto tiene poco stock disponible',
    newsletter_subscription: 'Cuando alguien se suscribe al newsletter',
    order_cancelled: 'Cuando una orden es cancelada o reembolsada',
    payment_error: 'Cuando hay un error en un pago',
    weekly_report: 'Resumen semanal de ventas y métricas',
    monthly_report: 'Análisis mensual completo del negocio',
    newsletter_reminder: 'Recordatorio para enviar campaña de newsletter',
  }
  return descriptions[type]
}
