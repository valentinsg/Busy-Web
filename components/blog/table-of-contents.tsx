"use client"

import { useEffect, useMemo, useState } from "react"
import { List } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TocItem { id: string; text: string; level: number }

export default function TableOfContents({ targetSelector = "#post-content" }: { targetSelector?: string }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<TocItem[]>([])

  useEffect(() => {
    const root = document.querySelector(targetSelector) || document
    const headings = Array.from(root.querySelectorAll("h2, h3")) as HTMLElement[]
    const mapped = headings.map((el) => {
      if (!el.id) {
        el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") || ""
      }
      return { id: el.id, text: el.textContent || "", level: el.tagName === "H2" ? 2 : 3 }
    })
    setItems(mapped)
  }, [targetSelector])

  const hasItems = items.length > 0
  const grouped = useMemo(() => items, [items])

  if (!hasItems) return null

  return (
    <div className="w-full font-body">
      <Button
        type="button"
        size="lg"
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        aria-label="Tabla de contenidos"
        title="Tabla de contenidos"
        data-label="Tabla de contenidos"
        aria-expanded={open}
        className={`w-full justify-start bg-muted/20 py-2 text-md transition-[border-radius,border-color] ${
          open ? "rounded-b-none border-b-0" : ""
        }`}
      >
        <List className="h-4 w-4 -ml-2" />
        Tabla de Contenidos
      </Button>
      <nav aria-label="Tabla de contenidos" className="text-md">
        <div
          className={`border bg-transparent transition-all duration-300 ${
            open
              ? "opacity-100 rounded-b-md -mt-px border-t-0 max-h-[45vh] md:max-h-[55vh] overflow-y-auto overscroll-contain"
              : "max-h-0 opacity-0 rounded-md overflow-hidden"
          }`}
        >
          <div className="p-3">
            <ul className="space-y-2">
              {grouped.map((it) => (
                <li key={it.id} className={it.level === 3 ? "pl-4" : ""}>
                  <a className="text-accent-brand hover:underline" href={`#${it.id}`}>{it.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  )
}
