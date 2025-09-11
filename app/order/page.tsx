"use client"

import * as React from "react"

export default function OrderStatusPage() {
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [data, setData] = React.useState<any>(null)
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
      setData(json)
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  function renderStatus() {
    const status = (data?.status || "unknown") as string
    if (status === "approved") {
      return (
        <div className="space-y-2">
          <div className="text-green-600 text-xl">✅ Pago aprobado</div>
          <pre className="bg-muted p-3 rounded text-sm overflow-auto">
            {JSON.stringify({
              payment_id: data?.payment_id,
              status: data?.status,
              status_detail: data?.status_detail,
              preference_id: data?.preference_id,
              merchant_order_id: data?.merchant_order_id,
            }, null, 2)}
          </pre>
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
    <div className="container px-4 py-16">
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
