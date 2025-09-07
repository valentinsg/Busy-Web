"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function check() {
      try {
        const { data: auth } = await supabase.auth.getUser()
        const user = auth?.user
        if (!user) {
          if (!cancelled) router.replace(`/admin/sign-in?next=${encodeURIComponent(pathname || "/admin")}`)
          return
        }
        const res = await fetch("/api/admin/is-admin", { cache: "no-store" })
        const json = await res.json()
        const admins: string[] = json.admins || []
        const isAdmin = !!user.email && admins.includes(user.email)
        if (!isAdmin) {
          if (!cancelled) router.replace(`/admin/sign-in?next=${encodeURIComponent(pathname || "/admin")}`)
          return
        }
      } catch (e) {
        if (!cancelled) router.replace(`/admin/sign-in?next=${encodeURIComponent(pathname || "/admin")}`)
        return
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [router, pathname])

  if (loading) {
    return (
      <div className="container px-4 py-8 pt-20">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
