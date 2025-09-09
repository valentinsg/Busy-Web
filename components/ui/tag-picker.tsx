"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase/client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type TagCount = { tag: string; count: number }

interface TagPickerProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  status?: string // optional status filter to compute tag counts
}

export function TagPicker({ value, onChange, placeholder = "Buscar tags...", className = "", status }: TagPickerProps) {
  const [query, setQuery] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<TagCount[]>([])
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      if (!open) return
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (query) params.set("q", query)
        // si se provee status, filtra conteos por ese estado
        if (status) params.set("status", status)
        else params.set("status", "subscribed")
        const { data: session } = await supabase.auth.getSession()
        const token = session.session?.access_token
        const res = await fetch(`/api/admin/newsletter/tags?${params.toString()}`, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const json = await res.json()
        if (!cancelled) setSuggestions(json.items || [])
      } catch {
        if (!cancelled) setSuggestions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [query, status, open])

  const addTag = (t: string) => {
    if (!value.includes(t)) onChange([...value, t])
    setQuery("")
  }

  const removeTag = (t: string) => {
    onChange(value.filter(v => v !== t))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 bg-transparent hover:bg-accent hover:text-accent-foreground ${className}`}>
          <span className="text-sm">Filtrar por tags</span>
          {value.length > 0 && (
            <span className="text-xs rounded-full px-1.5 py-0.5 bg-accent/30">{value.length}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map(t => (
            <span key={t} className="inline-flex items-center gap-2 rounded-full bg-accent/20 text-accent-foreground px-2 py-1 text-xs">
              {t}
              <button type="button" className="opacity-70 hover:opacity-100" onClick={() => removeTag(t)}>×</button>
            </span>
          ))}
        </div>
        <input
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder={placeholder}
          className="mb-2 w-full border rounded px-2 py-1 bg-transparent text-sm"
        />
        <div className="max-h-48 overflow-auto rounded border">
          {loading ? (
            <p className="text-xs text-muted-foreground px-2 py-1">Cargando...</p>
          ) : suggestions.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 py-1">Sin resultados</p>
          ) : (
            <ul className="text-sm divide-y divide-border/40">
              {suggestions.map(s => (
                <li key={s.tag}>
                  <button
                    type="button"
                    className="w-full text-left px-2 py-1 hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                    onClick={() => addTag(s.tag)}
                  >
                    <span>{s.tag}</span>
                    <span className="text-xs text-muted-foreground">{s.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

