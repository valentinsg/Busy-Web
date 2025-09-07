"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AdminGuard } from "@/components/admin/admin-guard"

export default function AdminLayoutGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  // Do not guard the sign-in page
  const isSignIn = pathname.startsWith("/admin/sign-in")
  if (isSignIn) return <>{children}</>
  return <AdminGuard>{children}</AdminGuard>
}
