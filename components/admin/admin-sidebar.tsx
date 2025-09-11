"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/settings", label: "Settings" },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <div className="sticky top-0 h-screen p-4 flex flex-col gap-2">
      <div className="mb-2 px-2 py-1 text-sm font-heading font-semibold">Admin</div>
      <nav className="flex flex-col gap-1 text-sm">
        {nav.map((n) => {
          const active = pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href))
          return (
            <Link
              key={n.href}
              href={n.href}
              prefetch
              className={`rounded-md px-3 py-2 text-sm transition-colors ${active ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}
            >
              {n.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
