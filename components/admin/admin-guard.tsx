"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = React.useState(false)
  const [isChecking, setIsChecking] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    
    async function checkAuth() {
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
        
        if (!cancelled) {
          setIsAuthorized(true)
          setIsChecking(false)
        }
      } catch {
        if (!cancelled) router.replace(`/admin/sign-in?next=${encodeURIComponent(pathname || "/admin")}`)
      }
    }
    
    checkAuth()
    
    return () => {
      cancelled = true
    }
  }, [router, pathname])

  if (isChecking) {
    return <LoadingSpinner fullScreen text="Cargando..." subtext="Verificando acceso" />
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
