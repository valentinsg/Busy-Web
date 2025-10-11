"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Truck, CheckCircle2, XCircle, Clock, MapPin, User, CreditCard, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type Order = {
  id: string
  created_at: string
  status: string
  payment_method: string
  channel: string
  currency: string
  total: number
  subtotal: number
  shipping_cost: number
  discount: number
  customer_id: string | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  shipping_address: any
  items: any[]
  notes: string | null
}

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
  paid: { label: "Pagado", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
  shipped: { label: "Enviado", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Truck },
  completed: { label: "Completado", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Package },
  cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
}

const paymentMethodLabels: Record<string, string> = {
  transfer: "Transferencia",
  mercadopago: "Mercado Pago",
  cash: "Efectivo",
  card: "Tarjeta",
}

// Helper para formatear fechas de forma segura
function formatSafeDate(dateString: string | null | undefined, formatStr: string): string {
  if (!dateString) return 'Fecha no disponible'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Fecha no disponible'
  return format(date, formatStr, { locale: es })
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [params.id])

  async function loadOrder() {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`)
      if (!res.ok) throw new Error("Order not found")
      const data = await res.json()
      setOrder(data)
    } catch (error) {
      console.error("Error loading order:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(newStatus: string) {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      await loadOrder()
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <XCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Orden no encontrada</p>
        <Button onClick={() => router.push("/admin/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a órdenes
        </Button>
      </div>
    )
  }

  const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading">Orden #{order.id.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground">
              {formatSafeDate(order.created_at, "PPP 'a las' p")}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={statusInfo.color}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusInfo.label}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.variant && `${item.variant} • `}
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.price * item.quantity, order.currency)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span>{formatCurrency(order.shipping_cost, order.currency)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento</span>
                    <span>-{formatCurrency(order.discount, order.currency)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total, order.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actualizar Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.status === "pending" && (
                <Button className="w-full" onClick={() => updateStatus("paid")}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como Pagado
                </Button>
              )}
              {order.status === "paid" && (
                <Button className="w-full" onClick={() => updateStatus("shipped")}>
                  <Truck className="h-4 w-4 mr-2" />
                  Marcar como Enviado
                </Button>
              )}
              {order.status === "shipped" && (
                <Button className="w-full" onClick={() => updateStatus("completed")}>
                  <Package className="h-4 w-4 mr-2" />
                  Marcar como Completado
                </Button>
              )}
              {order.status !== "cancelled" && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => updateStatus("cancelled")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Orden
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.customer_name && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{order.customer_name}</p>
                    {order.customer_email && (
                      <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                    )}
                    {order.customer_phone && (
                      <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                    )}
                  </div>
                </div>
              )}
              {order.shipping_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Dirección de envío</p>
                    <p className="text-xs text-muted-foreground">
                      {order.shipping_address.street}
                      {order.shipping_address.city && `, ${order.shipping_address.city}`}
                      {order.shipping_address.postal_code && ` ${order.shipping_address.postal_code}`}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Método de pago</p>
                  <p className="text-xs text-muted-foreground">
                    {paymentMethodLabels[order.payment_method] || order.payment_method}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Canal</p>
                  <p className="text-xs text-muted-foreground capitalize">{order.channel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fecha</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSafeDate(order.created_at, "PPP")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
