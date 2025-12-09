"use client"

import { supabase } from "@/lib/supabase/client"
import { Check, Filter, Search, Users, X } from "lucide-react"
import * as React from "react"

interface AudienceSelectorProps {
  selected: string[]
  onChange: (emails: string[]) => void
  disabled?: boolean
}

type TagCount = { tag: string; count: number }

export function AudienceSelector({ selected, onChange, disabled = false }: AudienceSelectorProps) {
  const [allSubscribers, setAllSubscribers] = React.useState<string[]>([])
  const [filteredList, setFilteredList] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Tags filter
  const [availableTags, setAvailableTags] = React.useState<TagCount[]>([])
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [showTagFilter, setShowTagFilter] = React.useState(false)

  // Load all subscribers and tags on mount
  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data: session } = await supabase.auth.getSession()
        const token = session.session?.access_token
        if (!token) return

        // Load all subscribers
        const res = await fetch("/api/admin/newsletter/validate-target", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: ["subscribed"], tags: [] })
        })
        const json = await res.json()
        if (!cancelled && res.ok && json.ok) {
          const list = (json.result?.allowed as string[]) || []
          list.sort()
          setAllSubscribers(list)
          setFilteredList(list)
        }

        // Load available tags
        const tagsRes = await fetch("/api/admin/newsletter/tags?status=subscribed", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const tagsJson = await tagsRes.json()
        if (!cancelled && tagsRes.ok) {
          setAvailableTags(tagsJson.items || [])
        }
      } catch {
        if (!cancelled) {
          setAllSubscribers([])
          setFilteredList([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Filter by tags when tags change
  React.useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredList(allSubscribers)
      return
    }

    let cancelled = false
    async function filterByTags() {
      try {
        const { data: session } = await supabase.auth.getSession()
        const token = session.session?.access_token
        if (!token) return

        const res = await fetch("/api/admin/newsletter/validate-target", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: ["subscribed"], tags: selectedTags })
        })
        const json = await res.json()
        if (!cancelled && res.ok && json.ok) {
          const list = (json.result?.allowed as string[]) || []
          list.sort()
          setFilteredList(list)
        }
      } catch {
        // Keep current list on error
      }
    }
    filterByTags()
    return () => { cancelled = true }
  }, [selectedTags, allSubscribers])

  // Search filter (client-side)
  const displayList = React.useMemo(() => {
    if (!searchQuery.trim()) return filteredList
    const q = searchQuery.toLowerCase()
    return filteredList.filter(email => email.toLowerCase().includes(q))
  }, [filteredList, searchQuery])

  const toggleEmail = (email: string) => {
    if (disabled) return
    if (selected.includes(email)) {
      onChange(selected.filter(e => e !== email))
    } else {
      onChange([...selected, email])
    }
  }

  const selectAll = () => {
    if (disabled) return
    // Select all from current filtered/displayed list
    const newSelection = Array.from(new Set([...selected, ...displayList]))
    onChange(newSelection)
  }

  const deselectAll = () => {
    if (disabled) return
    // Deselect only those in current display list
    const toRemove = new Set(displayList)
    onChange(selected.filter(e => !toRemove.has(e)))
  }

  const clearAll = () => {
    if (disabled) return
    onChange([])
    setSelectedTags([])
    setSearchQuery("")
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const selectedInDisplay = displayList.filter(e => selected.includes(e)).length
  const allDisplaySelected = displayList.length > 0 && selectedInDisplay === displayList.length

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Audiencia</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {selected.length} seleccionados
          </span>
        </div>
        {selected.length > 0 && !disabled && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
          >
            <X className="h-3 w-3" />
            Limpiar todo
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="p-3 border-b bg-muted/30 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            className="w-full pl-8 pr-3 py-2 text-sm border rounded-md bg-background disabled:opacity-50"
          />
        </div>

        {/* Tags filter toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTagFilter(!showTagFilter)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors ${
              selectedTags.length > 0
                ? "bg-primary/10 border-primary/30 text-primary"
                : "hover:bg-muted"
            } disabled:opacity-50`}
          >
            <Filter className="h-3.5 w-3.5" />
            Filtrar por tags
            {selectedTags.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px]">
                {selectedTags.length}
              </span>
            )}
          </button>

          {selectedTags.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedTags([])}
              disabled={disabled}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Quitar filtros
            </button>
          )}
        </div>

        {/* Tags dropdown */}
        {showTagFilter && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {availableTags.length === 0 ? (
              <span className="text-xs text-muted-foreground">No hay tags disponibles</span>
            ) : (
              availableTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  disabled={disabled}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted border-border"
                  } disabled:opacity-50`}
                >
                  {selectedTags.includes(tag) && <Check className="h-3 w-3" />}
                  {tag}
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selection actions */}
      <div className="flex items-center justify-between px-3 py-2 border-b text-xs">
        <span className="text-muted-foreground">
          {displayList.length} suscriptores {selectedTags.length > 0 && "con filtros"}
        </span>
        {!disabled && displayList.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={allDisplaySelected ? deselectAll : selectAll}
              className="text-primary hover:underline"
            >
              {allDisplaySelected ? "Deseleccionar visibles" : "Seleccionar visibles"}
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="max-h-64 overflow-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="inline-block h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground mt-2">Cargando suscriptores...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {searchQuery || selectedTags.length > 0
              ? "No hay suscriptores que coincidan con los filtros"
              : "No hay suscriptores activos"}
          </div>
        ) : (
          <div className="divide-y">
            {displayList.map(email => {
              const isSelected = selected.includes(email)
              return (
                <label
                  key={email}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                  } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <div className={`flex items-center justify-center h-4 w-4 rounded border transition-colors ${
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-input"
                  }`}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleEmail(email)}
                    disabled={disabled}
                    className="sr-only"
                  />
                  <span className="text-sm truncate">{email}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer summary */}
      {selected.length > 0 && (
        <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground">
          {selected.length === 1
            ? "1 destinatario seleccionado"
            : `${selected.length} destinatarios seleccionados`}
          {selectedTags.length > 0 && selected.length !== selectedInDisplay && (
            <span className="ml-1">
              ({selectedInDisplay} visibles con filtros actuales)
            </span>
          )}
        </div>
      )}
    </div>
  )
}
