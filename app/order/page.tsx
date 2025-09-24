"use client"

import * as React from "react"
import { formatPrice } from "@/lib/format"

type OrderSummary = {
  id: string
  placed_at: string
  shipping: number
  tax: number
  discount: number
  total: number
}

type OrderStatusResponse = {
  status?: string
  status_detail?: string
  payment_id?: string | null
  order?: OrderSummary | null
}

export default function OrderStatusPage() {
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [data, setData] = React.useState<OrderStatusResponse | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const url = new URL(window.location.href)
    const sid = url.searchParams.get("session_id") || window.sessionStorage.getItem("mp_session_id")
    if (sid) {
      setSessionId(sid)
      fetchStatus(sid)
    } else {
      setError("Falta session_id")
    }
  }, [])

  async function fetchStatus(sid: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/mp/order-status?session_id=${encodeURIComponent(sid)}`)
      const json = await res.json()
      setData(json as OrderStatusResponse)
    } catch (err: unknown) {
      setError(String(err?.toString() || err))
    } finally {
      setLoading(false)
    }
  }

  function renderStatus() {
    const status = (data?.status || "unknown") as string
    if (status === "approved") {
      const order = data?.order
      return (
        <div className="space-y-4">
          <div className="text-green-600 text-xl">✅ Pago aprobado</div>
          {order ? (
            <div className="rounded border p-4 bg-background">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">N° de pedido</div>
                <div className="text-right font-medium">{order.id}</div>
                <div className="text-muted-foreground">Fecha</div>
                <div className="text-right">{new Date(order.placed_at).toLocaleString()}</div>
                <div className="text-muted-foreground">Envío</div>
                <div className="text-right">{formatPrice(order.shipping)}</div>
                <div className="text-muted-foreground">Impuesto (10%)</div>
                <div className="text-right">{formatPrice(order.tax)}</div>
                {order.discount > 0 && <>
                  <div className="text-muted-foreground">Descuento</div>
                  <div className="text-right">-{formatPrice(order.discount)}</div>
                </>}
                <div className="col-span-2 border-t my-1" />
                <div className="text-muted-foreground">Total</div>
                <div className="text-right text-lg font-semibold">{formatPrice(order.total)}</div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                ID de pago: {data?.payment_id}
              </div>
            </div>
          ) : (
            <div className="rounded border p-3 text-sm">Estamos finalizando tu orden. Este estado se refrescará cuando llegue la confirmación.</div>
          )}
        </div>
      )
    }
    if (status === "pending" || status === "in_process") {
      return <div className="text-amber-600 text-xl">⏳ Pago en revisión</div>
    }
    if (status === "rejected") {
      return (
        <div className="space-y-2">
          <div className="text-red-600 text-xl">❌ Pago rechazado</div>
          {data?.status_detail && (
            <div className="text-sm text-muted-foreground">Motivo: {String(data.status_detail)}</div>
          )}
        </div>
      )
    }
    return <div className="text-muted-foreground text-xl">Esperando confirmación…</div>
  }

  return (
    <div className="container px-4 py-16 font-body">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold font-heading">Estado de tu pedido</h1>
        <div className="font-body text-sm text-muted-foreground">Session ID: {sessionId ?? "-"}</div>

        <div className="p-4 rounded border bg-background">
          {loading && <div>Cargando…</div>}
          {!loading && error && <div className="text-red-600">{error}</div>}
          {!loading && !error && renderStatus()}
        </div>

        {sessionId && (
          <button
            className="px-4 py-2 rounded bg-black text-white"
            onClick={() => fetchStatus(sessionId)}
          >
            Refrescar estado
          </button>
        )}
      </div>
    </div>
  )
}
