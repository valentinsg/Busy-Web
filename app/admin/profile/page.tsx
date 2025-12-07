"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import type { Author } from "@/types"
import { Loader2, Upload, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState<Author | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    medium: "",
  })
  const { toast } = useToast()

  const loadProfile = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")

      const res = await fetch("/api/admin/profile", {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to load profile")

      const data = await res.json()
      setProfile(data)
      setFormData({
        name: data.name || "",
        bio: data.bio || "",
        instagram: data.instagram || "",
        twitter: data.twitter || "",
        linkedin: data.linkedin || "",
        medium: data.medium || "",
      })
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "❌ Error",
        description: "Error al cargar el perfil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")

      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to update profile")

      const updated = await res.json()
      setProfile(updated)
      toast({
        title: "✅ Perfil actualizado",
        description: "Los cambios se guardaron correctamente",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "❌ Error",
        description: "Error al actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "⚠️ Archivo inválido",
        description: "Por favor selecciona una imagen",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "⚠️ Archivo muy grande",
        description: "La imagen debe ser menor a 2MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")

      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const res = await fetch("/api/admin/profile/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadFormData,
      })

      if (!res.ok) throw new Error("Failed to upload avatar")

      const data = await res.json()
      setProfile((prev) => (prev ? { ...prev, avatar: data.avatar_url } : null))
      toast({
        title: "✅ Avatar actualizado",
        description: "La imagen se subió correctamente",
      })
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "❌ Error",
        description: "Error al subir la imagen",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleAvatarDelete() {
    if (!confirm("¿Estás seguro de eliminar tu avatar?")) return

    setUploading(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error("No auth token")

      const res = await fetch("/api/admin/profile/avatar", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Failed to delete avatar")

      setProfile((prev) => (prev ? { ...prev, avatar: undefined } : null))
      toast({
        title: "✅ Avatar eliminado",
        description: "El avatar se eliminó correctamente",
      })
    } catch (error) {
      console.error("Error deleting avatar:", error)
      toast({
        title: "❌ Error",
        description: "Error al eliminar el avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontró tu perfil</p>
        <p className="text-sm text-muted-foreground mt-2">
          Contacta al administrador para crear tu perfil de autor
        </p>
      </div>
    )
  }

  const getInitials = (name: string) => {
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Administra tu información personal y redes sociales
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Cuenta</CardTitle>
            <CardDescription>
              Detalles de tu cuenta de autor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm font-medium">{profile.email || "No disponible"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Miembro desde</Label>
                <p className="text-sm font-medium">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : "No disponible"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>
              Tu foto aparecerá en los artículos del blog que escribas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 ring-2 ring-accent-brand/20">
                <AvatarImage src={profile.avatar || ""} alt={profile.name} />
                <AvatarFallback className="bg-accent-brand/10 text-accent-brand text-2xl font-semibold">
                  {getInitials(profile.name || "")}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-3">
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    asChild
                  >
                    <span className="cursor-pointer">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Subir Imagen
                    </span>
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>

                {profile.avatar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAvatarDelete}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              JPG, PNG o GIF. Máximo 2MB.
            </p>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Esta información se mostrará públicamente en el blog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Cuéntanos sobre ti..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Breve descripción que aparecerá en tus artículos
                </p>
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

              <div className="flex items-center gap-3 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
