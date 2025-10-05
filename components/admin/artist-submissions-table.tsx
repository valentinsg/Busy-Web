'use client'

import { useState } from 'react'
import type { ArtistSubmission } from '@/types/playlists'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ExternalLink, Instagram, Youtube, Music2, Mail, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ArtistSubmissionsTableProps {
  submissions: ArtistSubmission[]
}

export function ArtistSubmissionsTable({ submissions }: ArtistSubmissionsTableProps) {
  const router = useRouter()
  const [selectedSubmission, setSelectedSubmission] = useState<ArtistSubmission | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [adminNotes, setAdminNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function openDialog(submission: ArtistSubmission) {
    setSelectedSubmission(submission)
    setStatus(submission.status)
    setAdminNotes(submission.admin_notes || '')
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setSelectedSubmission(null)
  }

  async function handleUpdateStatus() {
    if (!selectedSubmission) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/artist-submissions/${selectedSubmission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: adminNotes }),
      })

      const data = await res.json()

      if (data.ok) {
        closeDialog()
        router.refresh()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error updating submission:', error)
      alert('Error al actualizar la propuesta')
    } finally {
      setIsSaving(false)
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">Pendiente</Badge>
      case 'reviewed':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">Revisada</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">Aprobada</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">Rechazada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <Music2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay propuestas de artistas aún</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artista</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Género</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">{submission.artist_name}</TableCell>
                <TableCell>{submission.email}</TableCell>
                <TableCell>{submission.genre || '-'}</TableCell>
                <TableCell>{getStatusBadge(submission.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(submission.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDialog(submission)}
                  >
                    Ver detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Propuesta de {selectedSubmission?.artist_name}</DialogTitle>
            <DialogDescription>
              Enviada el {selectedSubmission && formatDate(selectedSubmission.created_at)}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="text-sm">{selectedSubmission.email}</p>
                </div>

                {selectedSubmission.phone && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </Label>
                    <p className="text-sm">{selectedSubmission.phone}</p>
                  </div>
                )}

                {selectedSubmission.genre && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Music2 className="h-4 w-4" />
                      Género
                    </Label>
                    <p className="text-sm">{selectedSubmission.genre}</p>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Enlaces</Label>
                
                <div className="space-y-2">
                  <a
                    href={selectedSubmission.track_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Track: {selectedSubmission.track_url}
                  </a>

                  {selectedSubmission.spotify_artist_url && (
                    <a
                      href={selectedSubmission.spotify_artist_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-green-500 hover:underline"
                    >
                      <Music2 className="h-4 w-4" />
                      Perfil de Spotify: {selectedSubmission.spotify_artist_url}
                    </a>
                  )}

                  {selectedSubmission.social_instagram && (
                    <a
                      href={
                        selectedSubmission.social_instagram.startsWith('http')
                          ? selectedSubmission.social_instagram
                          : `https://instagram.com/${selectedSubmission.social_instagram.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-pink-500 hover:underline"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram: {selectedSubmission.social_instagram}
                    </a>
                  )}

                  {selectedSubmission.social_youtube && (
                    <a
                      href={
                        selectedSubmission.social_youtube.startsWith('http')
                          ? selectedSubmission.social_youtube
                          : `https://youtube.com/${selectedSubmission.social_youtube}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-red-500 hover:underline"
                    >
                      <Youtube className="h-4 w-4" />
                      YouTube: {selectedSubmission.social_youtube}
                    </a>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Mensaje del artista</Label>
                <div className="p-4 rounded-md bg-muted text-sm whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Status & Notes */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="reviewed">Revisada</SelectItem>
                      <SelectItem value="approved">Aprobada</SelectItem>
                      <SelectItem value="rejected">Rechazada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_notes">Notas del administrador</Label>
                  <Textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    placeholder="Agrega notas internas sobre esta propuesta..."
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateStatus} disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
