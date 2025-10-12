"use client"

import AdminLayoutGuard from "@/components/admin/admin-layout-guard"
import AdminSidebarMenu from "@/components/admin/admin-sidebar-menu"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronsUpDown } from "lucide-react"
import React, { useState } from "react"
import { usePathname } from "next/navigation"

export const dynamic = "force-dynamic"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  const [allSectionsOpen, setAllSectionsOpen] = useState(true)
  const { state } = useSidebar()
  const isSidebarCollapsed = state === "collapsed"

  const toggleAllSections = () => {
    setAllSectionsOpen(!allSectionsOpen)
  }

  return (
    <>
      <Sidebar collapsible="icon" className="font-body h-screen">
        <SidebarHeader className="border-b border-white/10 bg-black relative z-20 shrink-0">
          <div className="flex items-center justify-between gap-2 px-3 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
            <div className="flex items-center gap-2 flex-1 min-w-0 group-data-[collapsible=icon]:justify-center">
              <SidebarTrigger className="h-8 w-8 shrink-0 hover:bg-white/10 rounded-lg transition-all duration-200" />
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="font-heading text-sm font-bold text-white tracking-wider truncate">ADMIN</span>
                <span className="text-[10px] text-white/50 tracking-wide">Panel de control</span>
              </div>
            </div>
            {!isSidebarCollapsed && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleAllSections}
                      className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all duration-200"
                    >
                      <ChevronsUpDown className="h-3.5 w-3.5 text-white/70" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{allSectionsOpen ? 'Cerrar todas' : 'Abrir todas'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </SidebarHeader>
        <AdminSidebarMenu allSectionsOpen={allSectionsOpen} />

        <SidebarFooter className="border-t border-white/10 bg-black relative z-20 shrink-0">
          <div className="px-3 py-3 text-xs text-white/50 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded">Ctrl</kbd>
              <span className="text-white/30">+</span>
              <kbd className="px-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded">B</kbd>
              <span className="ml-2">Toggle Sidebar</span>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="overflow-x-hidden">
        {/* Mobile header con trigger */}
        <div className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 md:hidden">
          <SidebarTrigger className="h-8 w-8" />
          <span className="font-heading text-sm font-semibold">Admin</span>
          <div className="ml-auto">
            <AdminHeader />
          </div>
        </div>

        {/* Desktop header con notificaciones */}
        <div className="sticky top-0 z-10 hidden md:flex h-14 items-center justify-end gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <AdminHeader />
        </div>

        <div className="relative h-[auto] min-h-screen" key={pathname}>
          {/* subtle pattern background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.25] bg-repeat"
            style={{ backgroundImage: "url(/pattern-black.jpg)" }}
          />
          <div className="relative container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:pt-8 font-body">
            {children}
          </div>
        </div>
      </SidebarInset>
    </>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  const isSignIn = pathname.startsWith("/admin/sign-in")

  // Read sidebar state from cookie - initialize with cookie value if available
  const sidebarDefaultOpen = (() => {
    if (typeof window === 'undefined') return false
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }
    const savedState = getCookie('sidebar:state')
    return savedState === 'true'
  })()

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
      <SidebarProvider defaultOpen={sidebarDefaultOpen}>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SidebarProvider>
    </AdminLayoutGuard>
  )
}

