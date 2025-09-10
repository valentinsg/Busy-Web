import React from "react"
import Link from "next/link"
import AdminLayoutGuard from "@/components/admin/admin-layout-guard"
import QuickNewMenu from "@/components/admin/quick-new-menu"
import AdminQuickFAB from "@/components/admin/admin-quick-fab"

export const dynamic = "force-dynamic"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayoutGuard>
      <div className="min-h-screen flex flex-col">
        {/* Transparent header that appears on hover */}
        <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-background/0 hover:bg-background/95 backdrop-blur-sm hover:shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="font-heading text-2xl font-bold opacity-0 hover:opacity-100 transition-opacity">Admin</h1>
              <nav className="flex gap-4 text-sm font-body text-muted-foreground">
                <Link href="/admin" className="opacity-0 hover:opacity-100 transition-opacity hover:text-foreground">Dashboard</Link>
                <Link href="/admin/products" className="opacity-0 hover:opacity-100 transition-opacity hover:text-foreground">Productos</Link>
                <Link href="/admin/stock" className="opacity-0 hover:opacity-100 transition-opacity hover:text-foreground">Stock</Link>
                <Link href="/admin/media" className="opacity-0 hover:opacity-100 transition-opacity hover:text-foreground">Media</Link>
                <Link href="/admin/newsletter" className="opacity-0 hover:opacity-100 transition-opacity hover:text-foreground">Newsletter</Link>
                <Link href="/admin/newsletter/campaigns" className="opacity-0 hover:opacity-100 transition-opacity hover:text-foreground">Campañas</Link>
                <Link href="/admin/blog" className="opacity-0 hover:opacity-100 transition-opacity hover:text-foreground">Blog</Link>
                <Link href="/admin/popovers" className="opacity-0 hover:opacity-100 transition-opacity hover:text-foreground">Popovers</Link>
                <Link href="/admin/coupons" className="opacity-0 hover:opacity-100 transition-opacity hover:text-foreground">Cupones</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main content with padding to account for fixed header */}
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </AdminLayoutGuard>
  )
}

