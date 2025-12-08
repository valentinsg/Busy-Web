"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { FAQ } from "@/lib/repo/faqs"
import { FAQ_CATEGORIES } from "@/lib/repo/faqs"
import {
    ChevronDown,
    ChevronUp,
    Edit2,
    Eye,
    EyeOff,
    GripVertical,
    HelpCircle,
    Plus,
    Save,
    Trash2,
    X
} from "lucide-react"
import Link from "next/link"
import * as React from "react"

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = React.useState<FAQ[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [showNewForm, setShowNewForm] = React.useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = React.useState({
    question: "",
    answer: "",
    category: "general",
  })

  // Load FAQs
  React.useEffect(() => {
    loadFAQs()
  }, [])

  async function loadFAQs() {
    try {
      const res = await fetch("/api/admin/faqs")
      if (!res.ok) throw new Error("Error loading FAQs")
      const data = await res.json()
      setFaqs(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las FAQs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Create new FAQ
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Error creating FAQ")

      toast({ title: "✅ FAQ creada" })
      setFormData({ question: "", answer: "", category: "general" })
      setShowNewForm(false)
      loadFAQs()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo crear la FAQ",
        variant: "destructive",
      })
    }
  }

  // Update FAQ
  async function handleUpdate(id: string, data: Partial<FAQ>) {
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Error updating FAQ")

      toast({ title: "✅ FAQ actualizada" })
      setEditingId(null)
      loadFAQs()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la FAQ",
        variant: "destructive",
      })
    }
  }

  // Toggle active
  async function handleToggle(id: string) {
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "PATCH" })
      if (!res.ok) throw new Error("Error toggling FAQ")

      const updated = await res.json()
      toast({
        title: updated.is_active ? "✅ FAQ activada" : "FAQ desactivada"
      })
      loadFAQs()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado",
        variant: "destructive",
      })
    }
  }

  // Delete FAQ
  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta FAQ?")) return

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error deleting FAQ")

      toast({ title: "FAQ eliminada" })
      loadFAQs()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la FAQ",
        variant: "destructive",
      })
    }
  }

  // Move FAQ up/down
  async function handleMove(id: string, direction: "up" | "down") {
    const index = faqs.findIndex(f => f.id === id)
    if (index === -1) return

    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= faqs.length) return

    const newOrder = [...faqs]
    const [moved] = newOrder.splice(index, 1)
    newOrder.splice(newIndex, 0, moved)

    // Optimistic update
    setFaqs(newOrder)

    try {
      const res = await fetch("/api/admin/faqs/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: newOrder.map(f => f.id) }),
      })
      if (!res.ok) throw new Error("Error reordering")
    } catch (error) {
      console.error(error)
      loadFAQs() // Revert on error
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">FAQs</h1>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Preguntas Frecuentes
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las FAQs que se muestran en{" "}
            <Link href="/faq" className="text-accent-brand hover:underline" target="_blank">
              /faq
            </Link>
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)} disabled={showNewForm}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva FAQ
        </Button>
      </div>

      {/* New FAQ Form */}
      {showNewForm && (
        <Card className="border-accent-brand/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Nueva Pregunta Frecuente
              <Button variant="ghost" size="sm" onClick={() => setShowNewForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Pregunta *</Label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData(p => ({ ...p, question: e.target.value }))}
                  placeholder="¿Cuál es tu pregunta?"
                  required
                />
              </div>
              <div>
                <Label>Respuesta *</Label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData(p => ({ ...p, answer: e.target.value }))}
                  placeholder="Escribe la respuesta..."
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label>Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowNewForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{faqs.length}</div>
          <div className="text-sm text-muted-foreground">Total FAQs</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-500">
            {faqs.filter(f => f.is_active).length}
          </div>
          <div className="text-sm text-muted-foreground">Activas</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-muted-foreground">
            {faqs.filter(f => !f.is_active).length}
          </div>
          <div className="text-sm text-muted-foreground">Inactivas</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">
            {new Set(faqs.map(f => f.category)).size}
          </div>
          <div className="text-sm text-muted-foreground">Categorías</div>
        </Card>
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <FAQItem
            key={faq.id}
            faq={faq}
            isEditing={editingId === faq.id}
            isFirst={index === 0}
            isLast={index === faqs.length - 1}
            onEdit={() => setEditingId(faq.id)}
            onCancelEdit={() => setEditingId(null)}
            onSave={(data) => handleUpdate(faq.id, data)}
            onToggle={() => handleToggle(faq.id)}
            onDelete={() => handleDelete(faq.id)}
            onMoveUp={() => handleMove(faq.id, "up")}
            onMoveDown={() => handleMove(faq.id, "down")}
          />
        ))}
      </div>

      {faqs.length === 0 && (
        <Card className="p-8 text-center">
          <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay FAQs todavía</p>
          <Button className="mt-4" onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear primera FAQ
          </Button>
        </Card>
      )}
    </div>
  )
}

// FAQ Item Component
function FAQItem({
  faq,
  isEditing,
  isFirst,
  isLast,
  onEdit,
  onCancelEdit,
  onSave,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  faq: FAQ
  isEditing: boolean
  isFirst: boolean
  isLast: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onSave: (data: Partial<FAQ>) => void
  onToggle: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const [editData, setEditData] = React.useState({
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
  })

  React.useEffect(() => {
    if (isEditing) {
      setEditData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      })
    }
  }, [isEditing, faq])

  const categoryLabel = FAQ_CATEGORIES.find(c => c.value === faq.category)?.label || faq.category

  if (isEditing) {
    return (
      <Card className="border-accent-brand">
        <CardContent className="p-4 space-y-4">
          <div>
            <Label>Pregunta</Label>
            <Input
              value={editData.question}
              onChange={(e) => setEditData(p => ({ ...p, question: e.target.value }))}
            />
          </div>
          <div>
            <Label>Respuesta</Label>
            <Textarea
              value={editData.answer}
              onChange={(e) => setEditData(p => ({ ...p, answer: e.target.value }))}
              rows={3}
            />
          </div>
          <div>
            <Label>Categoría</Label>
            <Select
              value={editData.category}
              onValueChange={(v) => setEditData(p => ({ ...p, category: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FAQ_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onSave(editData)}>
              <Save className="h-4 w-4 mr-1" />
              Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={!faq.is_active ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag handle & order buttons */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className="p-1 hover:bg-muted rounded disabled:opacity-30"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className="p-1 hover:bg-muted rounded disabled:opacity-30"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium leading-tight">{faq.question}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {faq.answer}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-muted whitespace-nowrap">
                {categoryLabel}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" variant="ghost" onClick={onEdit}>
                <Edit2 className="h-3 w-3 mr-1" />
                Editar
              </Button>
              <Button size="sm" variant="ghost" onClick={onToggle}>
                {faq.is_active ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Mostrar
                  </>
                )}
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
                <Trash2 className="h-3 w-3 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
