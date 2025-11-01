"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { trackPurchase } from "@/lib/analytics/ecommerce"

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
            if (!already && order && (status === 'approved' || status === 'accredited')) {
              trackPurchase({
                transaction_id: String(order.id),
                currency: order.currency || 'ARS',
                value: Number(order.total || 0),
                tax: Number(order.tax || 0),
                shipping: Number(order.shipping || 0),
                coupon: null,
                items: [],
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
