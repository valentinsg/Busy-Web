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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronsUpDown } from "lucide-react"
import React, { useState } from "react"
import { usePathname } from "next/navigation"

export const dynamic = "force-dynamic"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  const isSignIn = pathname.startsWith("/admin/sign-in")
  const [allSectionsOpen, setAllSectionsOpen] = useState(true)

  const toggleAllSections = () => {
    setAllSectionsOpen(!allSectionsOpen)
  }

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
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="icon" className="font-body">
          <SidebarHeader className="border-b border-border/50 bg-black relative z-20">
            <div className="flex items-center justify-between gap-2 px-2 py-3 pt-4 sm:pt-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
                <SidebarTrigger className="h-8 w-8 group-data-[collapsible=icon]:mx-auto" />
                <span className="font-heading text-base sm:text-lg font-bold text-white group-data-[collapsible=icon]:hidden tracking-wider">ADMIN PANEL</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleAllSections}
                      className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors group-data-[collapsible=icon]:mx-auto"
                    >
                      <ChevronsUpDown className="h-4 w-4 text-white" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{allSectionsOpen ? 'Cerrar todas las secciones' : 'Abrir todas las secciones'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </SidebarHeader>
          <AdminSidebarMenu allSectionsOpen={allSectionsOpen} />

          <SidebarFooter className="border-t border-border/50 bg-black relative z-20">
            <div className="px-3 py-2 text-[10px] sm:text-xs text-white/60 group-data-[collapsible=icon]:hidden">
              <span className="hidden sm:inline">Sidebar (Ctrl/Cmd + B)</span>
              <span className="sm:hidden">Menú</span>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="overflow-x-hidden">
          {/* Mobile header con trigger */}
          <div className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 md:hidden">
            <SidebarTrigger className="h-8 w-8" />
            <span className="font-heading text-sm font-semibold">Admin</span>
          </div>
          
          <div className="relative h-[auto] min-h-screen">
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
      </SidebarProvider>
    </AdminLayoutGuard>
  )
}

