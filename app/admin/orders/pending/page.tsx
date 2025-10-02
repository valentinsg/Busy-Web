"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, Clock, Eye, RefreshCw } from "lucide-react"
import { formatPrice } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type PendingOrder = {
  id: string
  customer_id: string | null
  total: number
  subtotal: number
  shipping: number
  discount: number
  placed_at: string
  notes: string | null
  customer?: {
    full_name: string | null
    email: string | null
    phone: string | null
  }
  items?: Array<{
    product_name: string
    quantity: number
    unit_price: number
    variant_size: string | null
  }>
}

export default function PendingTransfersPage() {
  const [orders, setOrders] = React.useState<PendingOrder[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedOrder, setSelectedOrder] = React.useState<PendingOrder | null>(null)
  const [actionLoading, setActionLoading] = React.useState(false)
  const { toast } = useToast()

  const fetchOrders = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/orders/pending")
      if (!res.ok) throw new Error("Error cargando órdenes")
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes pendientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleConfirmOrder = async (orderId: string) => {
    setActionLoading(true)
    try {
      const res = await fetch("/api/admin/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      })

      if (!res.ok) throw new Error("Error confirmando orden")

      toast({
        title: "Orden confirmada",
        description: "La orden ha sido marcada como pagada",
      })

      setSelectedOrder(null)
      fetchOrders()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo confirmar la orden",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectOrder = async (orderId: string) => {
    setActionLoading(true)
    try {
      const res = await fetch("/api/admin/orders/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      })

      if (!res.ok) throw new Error("Error rechazando orden")

      toast({
        title: "Orden rechazada",
        description: "La orden ha sido cancelada",
      })

      setSelectedOrder(null)
      fetchOrders()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo rechazar la orden",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`
    if (diffHours > 0) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`
    return "Hace menos de 1 hora"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Transferencias Pendientes</h1>
          <p className="text-muted-foreground">
            Órdenes esperando confirmación de pago
          </p>
        </div>
        <Button onClick={fetchOrders} disabled={loading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cargando órdenes...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No hay órdenes pendientes</h3>
            <p className="text-muted-foreground">
              Todas las transferencias han sido procesadas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-sm transition-shadow border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading font-semibold text-sm">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Pendiente
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.placed_at)} • {getTimeSince(order.placed_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{formatPrice(order.total)}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                {/* Customer Info */}
                {order.customer && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Cliente</div>
                      <div className="font-medium">
                        {order.customer.full_name || "Sin nombre"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="font-medium">
                        {order.customer.email || "Sin email"}
                      </div>
                    </div>
                    {order.customer.phone && (
                      <div className="col-span-2">
                        <div className="text-xs text-muted-foreground">Teléfono</div>
                        <div className="font-medium">{order.customer.phone}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span>{formatPrice(order.shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">Ver detalles</span>
                    <span className="sm:hidden">Detalles</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleConfirmOrder(order.id)}
                    disabled={actionLoading}
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">Confirmar</span>
                    <span className="sm:hidden">✓</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRejectOrder(order.id)}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Orden #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Detalles completos de la orden
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Details */}
              {selectedOrder.customer && (
                <div>
                  <h4 className="font-semibold mb-2">Información del Cliente</h4>
                  <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nombre: </span>
                      <span className="font-medium">
                        {selectedOrder.customer.full_name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      <span className="font-medium">
                        {selectedOrder.customer.email || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Teléfono: </span>
                      <span className="font-medium">
                        {selectedOrder.customer.phone || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Productos</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg text-sm"
                      >
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.variant_size && `Talle: ${item.variant_size} • `}
                            Cantidad: {item.quantity}
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatPrice(item.unit_price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notas</h4>
                  <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div>
                <h4 className="font-semibold mb-2">Resumen</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{formatPrice(selectedOrder.shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedOrder(null)}
              disabled={actionLoading}
            >
              Cerrar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedOrder && handleRejectOrder(selectedOrder.id)}
              disabled={actionLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rechazar
            </Button>
            <Button
              onClick={() => selectedOrder && handleConfirmOrder(selectedOrder.id)}
              disabled={actionLoading}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
