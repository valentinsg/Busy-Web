import React from "react"
import AdminLayoutGuard from "@/components/admin/admin-layout-guard"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminTopbar from "@/components/admin/admin-topbar"
import AdminShortcuts from "@/components/admin/admin-shortcuts"

export const dynamic = "force-dynamic"

export default function AdminLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <AdminLayoutGuard>
      <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        {/* Sidebar (persistent) */}
        <aside className="hidden lg:block border-r bg-background/60 backdrop-blur-sm">
          <AdminSidebar />
        </aside>

        {/* Content area */}
        <div className="flex min-h-screen flex-col">
          <AdminTopbar />
          <div className="flex-1 px-4 sm:px-6 py-4">
            {children}
          </div>
        </div>

        {/* Parallel route slot for modals/drawers */}
        {modal}
      </div>
      {/* Global shortcuts within admin */}
      <AdminShortcuts />
    </AdminLayoutGuard>
  )
}

