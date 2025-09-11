"use client"
import { useSearchParams } from "next/navigation"

export function PendingClient() {
  const q = useSearchParams()
  const payment_id = q.get("payment_id")
  const status = q.get("status")
  const external_reference = q.get("external_reference") || q.get("merchant_order_id")

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Pago pendiente</h1>
      <p className="mt-2 text-sm text-gray-600">Tu pago está en revisión o pendiente de confirmación.</p>
      <div className="mt-4 space-y-1 text-sm">
        <div><b>payment_id:</b> {payment_id}</div>
        <div><b>status:</b> {status}</div>
        <div><b>order_id:</b> {external_reference}</div>
      </div>
      <p className="mt-6 text-sm text-gray-500">La confirmación final la realiza el webhook de Mercado Pago.</p>
    </div>
  )
}
