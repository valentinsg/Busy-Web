"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

function Breadcrumb() {
  const pathname = usePathname()
  const parts = pathname.split("/").filter(Boolean)
  const items = [] as Array<{ href: string; label: string }>
  let acc = ""
  for (const p of parts) {
    acc += `/${p}`
    items.push({ href: acc, label: p })
  }
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
      <ol className="flex items-center gap-2">
        <li>
          <Link className="hover:underline" href="/admin">admin</Link>
        </li>
        {items.slice(1).map((it) => (
          <li key={it.href} className="flex items-center gap-2">
            <span>/</span>
            <Link className="hover:underline" href={it.href} prefetch>
              {it.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function AdminTopbar() {
  const router = useRouter()
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-12">
        <Breadcrumb />
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => router.push("/admin/new")}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Nuevo
          </button>
        </div>
      </div>
    </header>
  )
}
