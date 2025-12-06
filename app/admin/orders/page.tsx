"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
    Banknote,
    BarChart2,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    CreditCard,
    DollarSign,
    RefreshCw,
    ShoppingCart,
    XCircle
} from "lucide-react"
import * as React from "react"

type Order = {
  id: string
  customer_id: string | null
  total: number
  subtotal: number
  shipping: number
  discount: number
  tax: number
  placed_at: string
  status: string
  channel: string
  payment_method?: string | null
  notes: string | null
  is_barter?: boolean
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
    variant_color: string | null
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

const statusConfig = {
  pending: {
    label: "Pendiente",
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    icon: Clock
  },
  paid: {
    label: "Pagado",
    color: "bg-green-500/10 text-green-700 border-green-500/20",
    icon: CheckCircle2
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-500/10 text-red-700 border-red-500/20",
    icon: XCircle
  },
}

const channelConfig = {
  web: { label: "Web", icon: ShoppingCart },
  manual: { label: "Manual", icon: Banknote },
  mercadopago: { label: "MercadoPago", icon: CreditCard },
}

export default function OrdersListPage() {
  const [orders, setOrders] = React.useState<Order[]>([])
  const [loading, setLoading] = React.useState(true)
  const [expandedOrders, setExpandedOrders] = React.useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [channelFilter, setChannelFilter] = React.useState<string>("all")
  const [paymentFilter, setPaymentFilter] = React.useState<string>("all")
  const [totalCount, setTotalCount] = React.useState(0)
  const { toast } = useToast()

  // Calculate quick stats from current orders
  const stats = React.useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const pendingCount = orders.filter(o => o.status === 'pending').length
    const paidCount = orders.filter(o => o.status === 'paid').length
    const pendingTransfers = orders.filter(o => o.status === 'pending' && o.payment_method === 'transfer').length
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    return { totalRevenue, pendingCount, paidCount, pendingTransfers, avgOrderValue }
  }, [orders])

  const fetchOrders = React.useCallback(async () => {
    setLoading(true)
    try {
      const timestamp = new Date().getTime()
      const params = new URLSearchParams({ t: timestamp.toString() })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (channelFilter !== "all") {
        params.append("channel", channelFilter)
      }

      if (paymentFilter === "pending_transfer") {
        params.append("status", "pending")
        params.append("payment_method", "transfer")
      } else if (paymentFilter !== "all") {
        params.append("payment_method", paymentFilter)
      }

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })

      if (!res.ok) throw new Error("Error cargando órdenes")

      const data = await res.json()
      setOrders(data.orders || [])
      setTotalCount(data.total || 0)
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, channelFilter, paymentFilter, toast])

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

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-l-yellow-500/70'
      case 'paid': return 'border-l-green-500/70'
      case 'cancelled': return 'border-l-red-500/70'
      default: return 'border-l-gray-500/70'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} pedido{totalCount !== 1 ? 's' : ''} en total
          </p>
        </div>

        <Button onClick={fetchOrders} disabled={loading} variant="outline" size="sm" className="w-fit">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Filtros - responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full text-xs sm:text-sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="paid">Pagados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-full text-xs sm:text-sm">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="web">Web</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="mercadopago">MercadoPago</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="mercado_libre">ML</SelectItem>
            <SelectItem value="feria">Feria</SelectItem>
            <SelectItem value="marketplace">Marketplace</SelectItem>
            <SelectItem value="grupo_wsp">WhatsApp</SelectItem>
            <SelectItem value="other">Otro</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full col-span-2 sm:col-span-1 text-xs sm:text-sm">
            <SelectValue placeholder="Pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending_transfer">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-yellow-600" />
                Transf. pend.
              </span>
            </SelectItem>
            <SelectItem value="transfer">Transferencia</SelectItem>
            <SelectItem value="card">Tarjeta</SelectItem>
            <SelectItem value="cash">Efectivo</SelectItem>
            <SelectItem value="other">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase">Ingresos</p>
                  <p className="text-lg sm:text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase">Pagados</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.paidCount}</p>
                </div>
                <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase">Pendientes</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.pendingCount}</p>
                  {stats.pendingTransfers > 0 && (
                    <p className="text-[10px] text-yellow-600">
                      {stats.pendingTransfers} transf.
                    </p>
                  )}
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase">Promedio</p>
                  <p className="text-lg sm:text-2xl font-bold">{formatPrice(stats.avgOrderValue)}</p>
                </div>
                <BarChart2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Cargando pedidos..." />
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No hay pedidos</h3>
            <p className="text-muted-foreground">
              {statusFilter !== "all"
                ? `No hay pedidos con estado "${statusFilter}"`
                : "No se encontraron pedidos"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order.id)
            const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
            const channelInfo = channelConfig[order.channel as keyof typeof channelConfig] || channelConfig.web
            const StatusIcon = statusInfo.icon
            const ChannelIcon = channelInfo.icon

            return (
              <Card key={order.id} className={cn("border-l-4 overflow-hidden", getStatusBorderColor(order.status))}>
                <CardContent className="p-0">
                  {/* Header compacto */}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                          <span className="font-mono font-semibold text-xs sm:text-sm">
                            #{order.id.slice(0, 6).toUpperCase()}
                          </span>
                          <Badge variant="outline" className={cn("text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5", statusInfo.color)}>
                            <StatusIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                            {statusInfo.label}
                          </Badge>
                          {order.payment_method === 'transfer' && order.status === 'pending' && (
                            <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-yellow-500/10 text-yellow-700 border-yellow-500/30 animate-pulse">
                              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5" />
                              <span className="hidden sm:inline">Transferencia pendiente</span>
                              <span className="sm:hidden">Transf.</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {getTimeSince(order.placed_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="text-right">
                          <div className="text-base sm:text-xl font-bold">{formatPrice(order.total)}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(order.id)}
                          className="shrink-0 h-8 w-8 p-0"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
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
                                    {item.variant_size && `Talle: ${item.variant_size}`}
                                    {item.variant_size && item.variant_color && ' • '}
                                    {item.variant_color && `Color: ${item.variant_color}`}
                                    {(item.variant_size || item.variant_color) && ' • '}
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
                          {order.shipping > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Envío</span>
                              <span>{formatPrice(order.shipping)}</span>
                            </div>
                          )}
                          {order.tax > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Impuestos</span>
                              <span>{formatPrice(order.tax)}</span>
                            </div>
                          )}
                          <div className="h-px bg-border my-2" />
                          <div className="flex justify-between font-bold text-base">
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2">NOTAS</h4>
                          <p className="text-sm text-muted-foreground bg-background rounded p-2">
                            {order.notes}
                          </p>
                        </div>
                      )}
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
