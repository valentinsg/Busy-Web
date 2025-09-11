"use client"
import { useSearchParams } from "next/navigation"

export function FailureClient() {
  const q = useSearchParams()
  const payment_id = q.get("payment_id")
  const status = q.get("status")
  const external_reference = q.get("external_reference") || q.get("merchant_order_id")

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Pago rechazado</h1>
      <p className="mt-2 text-sm text-gray-600">Tu pago no pudo ser procesado. Podés intentar nuevamente.</p>
      <div className="mt-4 space-y-1 text-sm">
        <div><b>payment_id:</b> {payment_id}</div>
        <div><b>status:</b> {status}</div>
        <div><b>order_id:</b> {external_reference}</div>
      </div>
      <p className="mt-6 text-sm text-gray-500">La verificación real se realiza por webhook; esta página es informativa.</p>
    </div>
  )
}
