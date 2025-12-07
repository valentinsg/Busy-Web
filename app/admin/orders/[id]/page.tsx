"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Calendar, CheckCircle2, Clock, Copy, CreditCard, ExternalLink, FileText, MapPin, Package, RefreshCw, Truck, User, XCircle } from "lucide-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

type ShippingAddress = {
  name?: string
  street?: string
  city?: string
  postal_code?: string
  state?: string
  country?: string
  phone?: string
  dni?: string
}

type OrderItem = {
  id: string
  product_id: string
  name: string
  variant?: string
  quantity: number
  price: number
  image_url?: string
}

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
  shipping_address: ShippingAddress | null
  items: OrderItem[]
  notes: string | null
  // Shipping fields (Envia.com)
  carrier?: string | null
  tracking_number?: string | null
  label_url?: string | null
  shipping_status?: string | null
  shipment_id?: string | null
  shipped_at?: string | null
  delivered_at?: string | null
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

  const loadOrder = useCallback(async () => {
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
  }, [params.id])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

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
                {order.items?.map((item, idx: number) => (
                  <div key={idx} className="flex items-center gap-4">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={64}
                        height={64}
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

          {/* Shipping Info (Envia.com) */}
          <ShippingInfoCard order={order} onRefresh={loadOrder} />
        </div>
      </div>
    </div>
  )
}

// Shipping status labels
const shippingStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  label_created: { label: "Etiqueta creada", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  shipped: { label: "Enviado", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  in_transit: { label: "En tránsito", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  out_for_delivery: { label: "En camino", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  delivered: { label: "Entregado", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  failed: { label: "Fallido", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  returned: { label: "Devuelto", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
}

function ShippingInfoCard({ order, onRefresh }: { order: Order; onRefresh: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generatingLabel, setGeneratingLabel] = useState(false)

  const shippingStatus = shippingStatusConfig[order.shipping_status || "pending"] || shippingStatusConfig.pending

  async function generateLabel() {
    if (!order.shipping_address) {
      toast({
        title: "Error",
        description: "La orden no tiene dirección de envío",
        variant: "destructive",
      })
      return
    }

    setGeneratingLabel(true)
    try {
      // First get rates to find cheapest option
      const ratesRes = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: {
            name: order.shipping_address.name || order.customer_name || "Cliente",
            phone: order.shipping_address.phone || order.customer_phone || "",
            street: order.shipping_address.street || "",
            city: order.shipping_address.city || "",
            state: order.shipping_address.state || "",
            postalCode: order.shipping_address.postal_code || "",
          },
          items: [],
          totalValue: order.total,
          itemCount: order.items?.length || 1,
        }),
      })

      const ratesData = await ratesRes.json()
      if (!ratesData.options || ratesData.options.length === 0) {
        throw new Error("No hay opciones de envío disponibles")
      }

      const cheapest = ratesData.options[0]

      // Generate label with cheapest option
      const labelRes = await fetch("/api/shipping/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          carrier: cheapest.carrier,
          service: cheapest.service,
        }),
      })

      const labelData = await labelRes.json()
      if (!labelData.success) {
        throw new Error(labelData.error || "Error generando etiqueta")
      }

      toast({
        title: "Etiqueta generada",
        description: `Tracking: ${labelData.tracking_number}`,
      })

      onRefresh()
    } catch (err) {
      toast({
        title: "Error",
        description: String((err as Error)?.message || err),
        variant: "destructive",
      })
    } finally {
      setGeneratingLabel(false)
    }
  }

  async function refreshTracking() {
    setLoading(true)
    try {
      const res = await fetch(`/api/shipping/tracking?order_id=${order.id}`)
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Tracking actualizado",
          description: `Estado: ${shippingStatusConfig[data.status]?.label || data.status}`,
        })
        onRefresh()
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el tracking",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function copyTracking() {
    if (order.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number)
      toast({
        title: "Copiado",
        description: "Número de tracking copiado al portapapeles",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Envío
          </CardTitle>
          <Badge variant="outline" className={shippingStatus.color}>
            {shippingStatus.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Tracking Number */}
        {order.tracking_number ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tracking</span>
              <div className="flex items-center gap-1">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {order.tracking_number}
                </code>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyTracking}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {order.carrier && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Carrier</span>
                <span className="text-xs font-medium capitalize">{order.carrier}</span>
              </div>
            )}

            {order.shipped_at && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Enviado</span>
                <span className="text-xs">{formatSafeDate(order.shipped_at, "PPP")}</span>
              </div>
            )}

            {order.delivered_at && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Entregado</span>
                <span className="text-xs">{formatSafeDate(order.delivered_at, "PPP")}</span>
              </div>
            )}

            <Separator className="my-2" />

            <div className="flex gap-2">
              {order.label_url && (
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={order.label_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-3 w-3 mr-1" />
                    Etiqueta
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshTracking}
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              No hay etiqueta de envío generada para esta orden.
            </p>
            {order.status === "paid" && order.shipping_address && (
              <Button
                className="w-full"
                size="sm"
                onClick={generateLabel}
                disabled={generatingLabel}
              >
                {generatingLabel ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileText className="h-3 w-3 mr-2" />
                    Generar etiqueta
                  </>
                )}
              </Button>
            )}
            {!order.shipping_address && (
              <p className="text-xs text-amber-600">
                ⚠️ Esta orden no tiene dirección de envío
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
