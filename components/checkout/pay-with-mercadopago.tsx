"use client"
import { useState } from "react"
import type { CartItemInput } from "@/lib/checkout/types"

export default function PayWithMercadoPago(props: {
  items: CartItemInput[]
  couponCode?: string | null
  shippingCost?: number | null
  buttonText?: string
  customer?: {
    first_name?: string | null
    last_name?: string | null
    email?: string | null
    phone?: string | null
    dni?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    zip?: string | null
  } | null
  newsletterOptIn?: boolean | null
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: props.items,
          coupon_code: props.couponCode ?? null,
          shipping_cost: props.shippingCost ?? 0,
          customer: props.customer ?? null,
          newsletter_opt_in: !!props.newsletterOptIn,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Error creando preferencia")
      }
      const data = (await res.json()) as { init_point: string }
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        throw new Error("No se recibió init_point")
      }
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handlePay} disabled={loading} className="inline-flex items-center rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {loading ? "Redirigiendo..." : props.buttonText ?? "Pagar con Mercado Pago"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
