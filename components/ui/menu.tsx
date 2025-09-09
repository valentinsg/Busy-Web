"use client"

import * as React from "react"

export interface MenuItem {
  label: string
  onClick: () => void
}

export function Menu({ items, buttonLabel, className = "", icon, ariaLabel }: { items: MenuItem[]; buttonLabel?: string; className?: string; icon?: React.ReactNode; ariaLabel?: string }) {
  const [open, setOpen] = React.useState(false)
  const btnRef = React.useRef<HTMLButtonElement | null>(null)
  const popRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return
      const t = e.target as Node
      if (btnRef.current?.contains(t)) return
      if (popRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  const defaultIcon = (
    <svg className="h-4 w-4 opacity-80" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></svg>
  )

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 rounded-md px-2.5 py-2 bg-transparent hover:bg-accent hover:text-accent-foreground"
        aria-label={ariaLabel || buttonLabel || "Abrir menú"}
      >
        {buttonLabel ?? icon ?? defaultIcon}
      </button>
      {open && (
        <div ref={popRef} className="absolute right-0 z-50 mt-2 min-w-[180px] rounded-md border bg-popover text-popover-foreground shadow-lg overflow-hidden">
          {items.map((it, idx) => (
            <button
              key={idx}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => { setOpen(false); it.onClick() }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

