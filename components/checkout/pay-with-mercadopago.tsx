"use client"
import { useCart } from "@/hooks/use-cart"
import type { CartItemInput } from "@/lib/checkout/types"
import { useState } from "react"

export default function PayWithMercadoPago(props: {
  items: CartItemInput[]
  couponCode?: string | null
  shippingCost?: number | null
  buttonText?: string
  disabled?: boolean
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
  const { clearCart } = useCart()

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
          shipping_cost: props.shippingCost ?? null,
          customer: props.customer ?? null,
          newsletter_opt_in: !!props.newsletterOptIn,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Error creando preferencia")
      }
      const data = (await res.json()) as { init_point: string; order_id?: string }
      if (data.order_id) {
        try { window.sessionStorage.setItem("mp_session_id", data.order_id) } catch {}
      }

      // Limpiar el carrito antes de redirigir a Mercado Pago
      clearCart()

      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        throw new Error("No se recibió init_point")
      }
    } catch (err: unknown) {
      setError(err?.toString() || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading || props.disabled}
        className="w-full inline-flex items-center justify-center rounded-lg bg-black px-4 py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/90 transition-colors"
      >
        {loading ? "Redirigiendo..." : props.buttonText ?? "Pagar con Mercado Pago"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
