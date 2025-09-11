"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function AdminShortcuts() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"
      if (isCmdK) {
        e.preventDefault()
        // placeholder: open command palette (future)
        console.log("Command palette (placeholder)")
        return
      }
      if (e.key === "Escape") {
        // Close modal if present
        const hasModal = document.getElementById("admin-modal-root")
        if (hasModal) {
          e.preventDefault()
          router.back()
        }
        return
      }
      if (e.key.toLowerCase() === "n") {
        // Contextual new shortcut based on current section
        if (pathname.startsWith("/admin/coupons")) {
          e.preventDefault()
          router.push("/admin/coupons/new")
          return
        }
        if (pathname.startsWith("/admin/products")) {
          e.preventDefault()
          router.push("/admin/products/new")
          return
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router, pathname])

  return null
}
