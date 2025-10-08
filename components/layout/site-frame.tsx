"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageTransition } from "@/components/layout/page-transition"

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  const isAdmin = pathname.startsWith("/admin")

  return (
    <div className="relative flex min-h-screen flex-col">
      {!isAdmin && <Header />}
      <PageTransition>
        <main className={`flex-1 ${isAdmin ? "pt-0" : ""}`}>{children}</main>
      </PageTransition>
      {!isAdmin && <Footer />}
    </div>
  )
}
