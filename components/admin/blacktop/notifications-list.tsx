'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, Calendar, Trophy, ExternalLink, CheckCheck } from 'lucide-react';
import type { Notification } from '@/types/notifications';
import type { BlacktopTeamRegistrationMetadata } from '@/types/notifications';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function BlacktopNotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const response = await fetch('/api/blacktop/notifications?limit=20');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      const response = await fetch(`/api/blacktop/notifications/${id}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      const response = await fetch('/api/blacktop/notifications', {
        method: 'PATCH',
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'blacktop_team_registration':
        return <Users className="h-5 w-5" />;
      case 'blacktop_match_upcoming':
        return <Calendar className="h-5 w-5" />;
      case 'blacktop_match_result':
        return <Trophy className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Cargando notificaciones...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones de Blacktop
          </CardTitle>
          {notifications.some(n => !n.read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay notificaciones
          </p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.read
                    ? 'bg-muted/30 border-border'
                    : 'bg-accent/10 border-accent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      notification.read ? 'bg-muted' : 'bg-accent/20'
                    }`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold">{notification.title}</h4>
                      {!notification.read && (
                        <Badge variant="default" className="shrink-0">
                          Nuevo
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>

                    {notification.type === 'blacktop_team_registration' && (
                      <div className="text-xs text-muted-foreground space-y-1 mb-2">
                        <p>
                          Capitán: {(notification.metadata as BlacktopTeamRegistrationMetadata).captain_name} 
                          {' '}(@{(notification.metadata as BlacktopTeamRegistrationMetadata).captain_instagram})
                        </p>
                        <p>
                          Jugadores: {(notification.metadata as BlacktopTeamRegistrationMetadata).players_count}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>

                      {notification.action_url && (
                        <Link href={notification.action_url}>
                          <Button variant="ghost" size="sm" className="h-7 gap-1">
                            Ver detalles
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}

                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7"
                        >
                          Marcar como leída
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
