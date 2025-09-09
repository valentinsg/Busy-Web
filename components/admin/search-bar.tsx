"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function AdminSearchBar({ placeholder = "Buscar..." }: { placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const qParam = params.get("q") || ""
  const [q, setQ] = useState(qParam)

  useEffect(() => setQ(qParam), [qParam])

  // simple debounce
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams(params.toString())
      if (q) sp.set("q", q)
      else sp.delete("q")
      sp.set("page", "1")
      router.replace(`${pathname}?${sp.toString()}`)
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  return (
    <input
      className="w-full sm:w-64 rounded-md border bg-background px-3 py-2 text-sm"
      placeholder={placeholder}
      value={q}
      onChange={(e) => setQ(e.target.value)}
    />
  )
}
