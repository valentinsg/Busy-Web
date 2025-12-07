"use client"
import { trackPurchase } from "@/lib/analytics/ecommerce"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

interface OrderItem {
  product_id: string
  product_name: string
  unit_price?: number
  quantity: number
  variant_size?: string
  variant_color?: string
}

export function SuccessClient() {
  const q = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const sessionId = q?.get("session_id") || q?.get("external_reference") || q?.get("merchant_order_id") || null
    if (sessionId) {
      try { window.sessionStorage.setItem("mp_session_id", sessionId) } catch {}
      // Try to fetch order info to fire purchase once before redirect
      ;(async () => {
        try {
          const already = typeof window !== 'undefined' && window.sessionStorage.getItem(`purchase_tracked_${sessionId}`)
          const res = await fetch(`/api/mp/order-status?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
          if (res.ok) {
            const data = await res.json()
            const status: string = data?.status || 'unknown'
            const order = data?.order
            const orderItems = data?.items || []
            if (!already && order && (status === 'approved' || status === 'accredited')) {
              trackPurchase({
                transaction_id: String(order.id),
                currency: order.currency || 'ARS',
                value: Number(order.total || 0),
                tax: Number(order.tax || 0),
                shipping: Number(order.shipping || 0),
                coupon: null,
                items: orderItems.map((item: OrderItem) => ({
                  item_id: item.product_id,
                  item_name: item.product_name,
                  price: Number(item.unit_price || 0),
                  quantity: item.quantity,
                  item_variant: item.variant_size && item.variant_color ? `${item.variant_size}|${item.variant_color}` : undefined,
                })),
              })
              try { window.sessionStorage.setItem(`purchase_tracked_${sessionId}`, '1') } catch {}
            }
          }
        } catch {}
        router.replace(`/order?session_id=${encodeURIComponent(sessionId)}`)
      })()
    } else {
      router.replace("/order")
    }
  }, [q, router])

  return null
}
