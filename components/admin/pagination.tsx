"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function AdminPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  if (totalPages <= 1) return null

  function go(to: number) {
    const sp = new URLSearchParams(params.toString())
    sp.set("page", String(to))
    router.replace(`${pathname}?${sp.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button disabled={page <= 1} onClick={() => go(page - 1)} className="rounded-md border px-2 py-1 disabled:opacity-40">
        Anterior
      </button>
      <span className="text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <button disabled={page >= totalPages} onClick={() => go(page + 1)} className="rounded-md border px-2 py-1 disabled:opacity-40">
        Siguiente
      </button>
    </div>
  )
}
