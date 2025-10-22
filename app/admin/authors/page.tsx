"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Loader2, Plus, Pencil, Trash2, Instagram, Twitter, Linkedin } from "lucide-react"

interface Author {
  id: string
  name: string
  avatar?: string
  bio?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  medium?: string
  active: boolean
  created_at: string
}

export default function AuthorsPage() {
  const [loading, setLoading] = useState(true)
  const [authors, setAuthors] = useState<Author[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState("")
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    bio: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    medium: "",
    active: true,
  })

  useEffect(() => {
    loadAuthors()
  }, [])

  async function loadAuthors() {
    try {
      const res = await fetch("/api/admin/authors", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load authors")

      const data = await res.json()
      setAuthors(data)
    } catch (error) {
      console.error("Error loading authors:", error)
      setToast("Error al cargar autores")
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingAuthor(null)
    setFormData({
      id: "",
      name: "",
      email: "",
      bio: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      medium: "",
      active: true,
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(author: Author) {
    setEditingAuthor(author)
    setFormData({
      id: author.id,
      name: author.name,
      email: "",
      bio: author.bio || "",
      instagram: author.instagram || "",
      twitter: author.twitter || "",
      linkedin: author.linkedin || "",
      medium: author.medium || "",
      active: author.active,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setToast("")

    try {
      if (editingAuthor) {
        // Update existing author
        const res = await fetch(`/api/admin/authors/${editingAuthor.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            bio: formData.bio,
            instagram: formData.instagram,
            twitter: formData.twitter,
            linkedin: formData.linkedin,
            medium: formData.medium,
            active: formData.active,
          }),
        })

        if (!res.ok) throw new Error("Failed to update author")
        setToast("✓ Autor actualizado")
      } else {
        // Create new author
        const res = await fetch("/api/admin/authors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (!res.ok) throw new Error("Failed to create author")
        setToast("✓ Autor creado")
      }

      setIsDialogOpen(false)
      await loadAuthors()
    } catch (error) {
      console.error("Error saving author:", error)
      setToast("Error al guardar el autor")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este autor?")) return

    try {
      const res = await fetch(`/api/admin/authors/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete author")

      setToast("✓ Autor eliminado")
      await loadAuthors()
    } catch (error) {
      console.error("Error deleting author:", error)
      setToast("Error al eliminar el autor")
    }
  }

  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Autores</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los autores del blog y usuarios del panel
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Autor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAuthor ? "Editar Autor" : "Crear Nuevo Autor"}
              </DialogTitle>
              <DialogDescription>
                {editingAuthor
                  ? "Actualiza la información del autor"
                  : "Crea un nuevo perfil de autor para el blog"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id">ID (slug)</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    placeholder="ej: juan-perez"
                    required
                    disabled={!!editingAuthor}
                  />
                  <p className="text-xs text-muted-foreground">
                    Identificador único (sin espacios, minúsculas)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="juan@ejemplo.com"
                />
                <p className="text-xs text-muted-foreground">
                  Email para acceso al panel admin (opcional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Breve descripción del autor..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                    placeholder="https://instagram.com/..."
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) =>
                      setFormData({ ...formData, twitter: e.target.value })
                    }
                    placeholder="https://x.com/..."
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/..."
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medium">Medium</Label>
                  <Input
                    id="medium"
                    value={formData.medium}
                    onChange={(e) =>
                      setFormData({ ...formData, medium: e.target.value })
                    }
                    placeholder="https://medium.com/@..."
                    type="url"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Activo
                </Label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : editingAuthor ? (
                    "Actualizar"
                  ) : (
                    "Crear Autor"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {toast && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            toast.startsWith("✓")
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Autores</CardTitle>
          <CardDescription>
            {authors.length} autor{authors.length !== 1 ? "es" : ""} registrado
            {authors.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Autor</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Redes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={author.avatar} alt={author.name} />
                        <AvatarFallback className="bg-accent-brand/10 text-accent-brand text-xs">
                          {getInitials(author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{author.name}</div>
                        {author.bio && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {author.bio}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {author.id}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {author.instagram && (
                        <a
                          href={author.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Instagram className="h-4 w-4" />
                        </a>
                      )}
                      {author.twitter && (
                        <a
                          href={author.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                      {author.linkedin && (
                        <a
                          href={author.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={author.active ? "default" : "secondary"}>
                      {author.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(author)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(author.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {authors.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No hay autores registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
