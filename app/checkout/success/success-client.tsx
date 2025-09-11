"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function SuccessClient() {
  const q = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const sessionId = q.get("session_id") || q.get("external_reference") || q.get("merchant_order_id")
    if (sessionId) {
      try { window.sessionStorage.setItem("mp_session_id", sessionId) } catch {}
      router.replace(`/order?session_id=${encodeURIComponent(sessionId)}`)
    } else {
      router.replace("/order")
    }
  }, [q, router])

  return null
}
