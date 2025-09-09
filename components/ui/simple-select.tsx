"use client"

import * as React from "react"

type Option = { label: string; value: string }

interface SimpleSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
}

export function SimpleSelect({ value, onChange, options, placeholder = "Seleccionar", className = "" }: SimpleSelectProps) {
  const [open, setOpen] = React.useState(false)
  const btnRef = React.useRef<HTMLButtonElement | null>(null)
  const menuRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return
      const t = e.target as Node
      if (btnRef.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  const current = options.find(o => o.value === value)

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between border rounded-md px-3 py-2 bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">{current ? current.label : <span className="text-muted-foreground">{placeholder}</span>}</span>
        <svg className="ml-2 h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/></svg>
      </button>
      {open && (
        <div
          ref={menuRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-lg overflow-hidden"
          role="listbox"
        >
          {options.map(opt => (
            <button
              key={opt.value}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${opt.value === value ? "bg-accent/20" : ""}`}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
