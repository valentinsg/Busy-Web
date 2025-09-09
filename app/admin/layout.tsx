import React from "react"
import Link from "next/link"
import AdminLayoutGuard from "@/components/admin/admin-layout-guard"
import QuickNewMenu from "@/components/admin/quick-new-menu"

export const dynamic = "force-dynamic"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayoutGuard>
      <div className="container px-4 py-8 pt-20">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="font-heading text-3xl font-bold">Admin</h1>
            <nav className="flex gap-4 text-sm font-body text-muted-foreground">
              <Link href="/admin">Dashboard</Link>
              <Link href="/admin/products">Productos</Link>
              <Link href="/admin/stock">Stock</Link>
              <Link href="/admin/media">Media</Link>
              <QuickNewMenu />
              <Link href="/admin/newsletter">Newsletter</Link>
              <Link href="/admin/newsletter/campaigns">Campañas</Link>
              <Link href="/admin/blog">Blog</Link>
              <Link href="/admin/coupons">Cupones</Link>
            </nav>
          </header>
          {children}
        </div>
      </div>
    </AdminLayoutGuard>
  )
}

