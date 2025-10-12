"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CheckCircle2, XCircle, Clock, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"
import { formatPrice } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"

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

// Helper to parse customer info from notes
function parseCustomerFromNotes(notes: string | null): {
  full_name: string | null
  email: string | null
  phone: string | null
  dni: string | null
  address: string | null
  paymentMethod: string | null
} {
  if (!notes) return { full_name: null, email: null, phone: null, dni: null, address: null, paymentMethod: null }

  const emailMatch = notes.match(/Email:\s*([^\s,]+@[^\s,]+)/i)
  const phoneMatch = notes.match(/Tel:\s*([0-9]+)/i)
  const dniMatch = notes.match(/DNI:\s*([0-9]+)/i)
  const nameMatch = notes.match(/Cliente:\s*([^,\.]+)/i)
  const addressMatch = notes.match(/Dirección:\s*([^\.]+)/i)
  const paymentMatch = notes.match(/Pago por\s+([^\.]+)/i)

  return {
    full_name: nameMatch ? nameMatch[1].trim() : null,
    email: emailMatch ? emailMatch[1].trim() : null,
    phone: phoneMatch ? phoneMatch[1].trim() : null,
    dni: dniMatch ? dniMatch[1].trim() : null,
    address: addressMatch ? addressMatch[1].trim() : null,
    paymentMethod: paymentMatch ? paymentMatch[1].trim() : null,
  }
}

export default function PendingTransfersPage() {
  const [orders, setOrders] = React.useState<PendingOrder[]>([])
  const [loading, setLoading] = React.useState(true)
  const [expandedOrders, setExpandedOrders] = React.useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)
  const { toast } = useToast()

  const fetchOrders = React.useCallback(async () => {
    setLoading(true)
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime()
      const res = await fetch(`/api/admin/orders/pending?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      if (!res.ok) throw new Error("Error cargando órdenes")
      const data = await res.json()
      setOrders(data.orders || [])
    } catch {
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

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const handleConfirmOrder = async (orderId: string) => {
    setActionLoading(orderId)
    try {
      const res = await fetch("/api/admin/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      })

      if (!res.ok) throw new Error("Error confirmando orden")

      toast({
        title: "Orden confirmada",
        description: "La orden ha sido marcada como pagada y sumada a ingresos",
      })

      fetchOrders()
    } catch {
      toast({
        title: "Error",
        description: "No se pudo confirmar la orden",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectOrder = async (orderId: string) => {
    setActionLoading(orderId)
    try {
      const res = await fetch("/api/admin/orders/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      })

      if (!res.ok) throw new Error("Error rechazando orden")

      toast({
        title: "Orden rechazada",
        description: "La orden ha sido cancelada y NO se sumó a ingresos",
      })

      fetchOrders()
    } catch {
      toast({
        title: "Error",
        description: "No se pudo rechazar la orden",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
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
        <LoadingSpinner text="Cargando órdenes..." />
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
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order.id)
            const isLoading = actionLoading === order.id

            return (
              <Card key={order.id} className="border-l-4 border-l-yellow-500/70 overflow-hidden">
                <CardContent className="p-0">
                  {/* Header compacto */}
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-semibold text-sm">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                          Pendiente
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatDate(order.placed_at)} • {getTimeSince(order.placed_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatPrice(order.total)}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(order.id)}
                        className="shrink-0"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Detalles expandibles */}
                  {isExpanded && (
                    <div className="border-t bg-muted/30 p-4 space-y-4">
                      {/* Customer Info */}
                      {(() => {
                        const parsedCustomer = parseCustomerFromNotes(order.notes)
                        const customerData = order.customer || parsedCustomer
                        const hasCustomerInfo = customerData.full_name || customerData.email || customerData.phone

                        return hasCustomerInfo ? (
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground mb-2">CLIENTE</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {customerData.full_name && (
                                <div>
                                  <div className="text-xs text-muted-foreground">Nombre</div>
                                  <div className="font-medium">{customerData.full_name}</div>
                                </div>
                              )}
                              {customerData.email && (
                                <div>
                                  <div className="text-xs text-muted-foreground">Email</div>
                                  <div className="font-medium truncate text-xs">{customerData.email}</div>
                                </div>
                              )}
                              {customerData.phone && (
                                <div>
                                  <div className="text-xs text-muted-foreground">Teléfono</div>
                                  <div className="font-medium">{customerData.phone}</div>
                                </div>
                              )}
                              {parsedCustomer.dni && (
                                <div>
                                  <div className="text-xs text-muted-foreground">DNI</div>
                                  <div className="font-medium">{parsedCustomer.dni}</div>
                                </div>
                              )}
                              {parsedCustomer.address && (
                                <div className="col-span-2">
                                  <div className="text-xs text-muted-foreground">Dirección</div>
                                  <div className="font-medium text-sm">{parsedCustomer.address}</div>
                                </div>
                              )}
                              {parsedCustomer.paymentMethod && (
                                <div className="col-span-2">
                                  <div className="text-xs text-muted-foreground">Método de pago</div>
                                  <div className="font-medium">
                                    <Badge variant="outline" className="text-xs">
                                      {parsedCustomer.paymentMethod}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null
                      })()}

                      {/* Items */}
                      {order.items && order.items.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2">PRODUCTOS</h4>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-start text-sm bg-background rounded p-2">
                                <div className="flex-1">
                                  <div className="font-medium">{item.product_name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.variant_size && `Talle: ${item.variant_size} • `}
                                    Cantidad: {item.quantity} × {formatPrice(item.unit_price)}
                                  </div>
                                </div>
                                <div className="font-semibold">
                                  {formatPrice(item.unit_price * item.quantity)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}


                      {/* Totals */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">RESUMEN</h4>
                        <div className="space-y-1.5 text-sm">
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
                          <div className="h-px bg-border my-2" />
                          <div className="flex justify-between font-bold text-base">
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleConfirmOrder(order.id)}
                          disabled={isLoading}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Confirmar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRejectOrder(order.id)}
                          disabled={isLoading}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
