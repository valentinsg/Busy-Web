"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

export default function SitePopover({ section }: { section?: string }) {
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<null | {
    id: string
    title: string
    body?: string | null
    discount_code?: string | null
  }>(null)
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/popovers/active?path=${encodeURIComponent(pathname)}${section ? `&section=${encodeURIComponent(section)}` : ""}`)
        const json = await res.json()
        const p = json?.popover
        if (p) {
          const lsKey = `dismiss_popover_${p.id}`
          const already = typeof window !== "undefined" ? localStorage.getItem(lsKey) : null
          if (!already) {
            setData({ id: p.id, title: p.title, body: p.body, discount_code: p.discount_code })
          }
        }
      } catch (e) {
        // silent
      } finally {
        setLoading(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, section])

  if (loading || !data || dismissed) return null

  const onDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(`dismiss_popover_${data.id}`, "1")
    } catch {}
  }

  const onCopy = async () => {
    if (!data.discount_code) return
    try {
      await navigator.clipboard.writeText(data.discount_code)
      // optionally show toast if available
    } catch {}
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl rounded-lg border bg-background shadow-xl">
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1">
          <h4 className="font-heading text-base font-semibold">{data.title}</h4>
          {data.body && <p className="font-body text-sm text-muted-foreground mt-1">{data.body}</p>}
          {data.discount_code && (
            <div className="mt-2 flex items-center gap-2">
              <code className="rounded bg-muted px-2 py-1 text-sm">{data.discount_code}</code>
              <button onClick={onCopy} className="rounded border px-2 py-1 text-xs hover:bg-accent">Copiar</button>
            </div>
          )}
        </div>
        <button onClick={onDismiss} className="rounded border px-2 py-1 text-xs hover:bg-accent">Cerrar</button>
      </div>
    </div>
  )
}
