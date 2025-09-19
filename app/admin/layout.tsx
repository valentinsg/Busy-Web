"use client"

import AdminLayoutGuard from "@/components/admin/admin-layout-guard"
import AdminSidebarMenu from "@/components/admin/admin-sidebar-menu"
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from "@/components/ui/sidebar"
import React from "react"
import { usePathname } from "next/navigation"

export const dynamic = "force-dynamic"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  const isSignIn = pathname.startsWith("/admin/sign-in")

  // For the sign-in page, we must not show the sidebar at all.
  if (isSignIn) {
    return (
      <div className="relative h-[auto] min-h-screen">
        {/* subtle pattern background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.25] bg-repeat"
          style={{ backgroundImage: "url(/pattern-black.jpg)" }}
        />
        <div className="relative container mx-auto px-0 py-6 pt-24 md:pt-8 font-body">
          {children}
        </div>
      </div>
    )
  }

  return (
    <AdminLayoutGuard>
      <SidebarProvider>
        <Sidebar collapsible="icon" className="font-body">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1.5 pt-8">
              <SidebarTrigger />
              <span className="font-heading text-base">Admin</span>
            </div>
          </SidebarHeader>
          <AdminSidebarMenu />

          <SidebarFooter>
            <div className="px-2 py-2 text-xs text-sidebar-foreground/70">
              Sidebar (Ctrl/Cmd + B)
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <div className="relative h-[auto] min-h-screen">
            {/* subtle pattern background */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.25] bg-repeat"
              style={{ backgroundImage: "url(/pattern-black.jpg)" }}
            />
            <div className="relative container mx-auto px-0 py-6 pt-24 md:pt-8 font-body">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminLayoutGuard>
  )
}

