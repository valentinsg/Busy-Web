"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import type { CartItemInput } from "@/lib/checkout/types"
import { trackPurchase } from "@/lib/analytics/ecommerce"

export default function PayWithTransfer(props: {
  items: CartItemInput[]
  couponCode?: string | null
  shippingCost?: number
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

  async function handleConfirm() {
    // Validar datos del cliente
    if (!props.customer?.first_name || !props.customer?.last_name || !props.customer?.email || !props.customer?.phone) {
      setError("Por favor completá todos los campos requeridos")
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Suscribir a newsletter si está marcado
      if (props.newsletterOptIn && props.customer?.email) {
        await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: props.customer.email }),
        }).catch(() => {
          // Ignorar errores de newsletter, no debe bloquear el checkout
        })
      }

      const res = await fetch("/api/orders/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: props.items,
          coupon_code: props.couponCode ?? null,
          shipping_cost: props.shippingCost ?? 0,
          customer: props.customer,
          newsletter_opt_in: !!props.newsletterOptIn,
        }),
      })
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Error creando orden")
      }
      
      const data = (await res.json()) as { order_id: string; total: number }
      
      // Limpiar el carrito después de confirmar la orden
      clearCart()
      
      // Track purchase for bank transfer (status: pending until verified)
      try {
        const already = typeof window !== 'undefined' && window.sessionStorage.getItem(`purchase_tracked_${data.order_id}`)
        if (!already) {
          trackPurchase({
            transaction_id: String(data.order_id),
            currency: 'ARS',
            value: Number(data.total || 0),
            tax: 0,
            shipping: Number(props.shippingCost ?? 0),
            coupon: props.couponCode ?? null,
            items: [],
          })
          try { window.sessionStorage.setItem(`purchase_tracked_${data.order_id}`, '1') } catch {}
        }
      } catch {}

      // Redirigir a página de confirmación con instrucciones de transferencia
      window.location.href = `/order/transfer?order_id=${data.order_id}&total=${data.total}`
    } catch (err: unknown) {
      setError(err?.toString() || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleConfirm} 
        disabled={loading || props.disabled}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          "Confirmar pedido"
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
      
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>Al confirmar, recibirás los datos bancarios para realizar la transferencia.</p>
        <p className="font-medium">Tu pedido se confirmará una vez que verifiquemos el pago.</p>
      </div>
    </div>
  )
}
