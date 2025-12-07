'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeletePopoverButtonProps {
  id: number
  title: string
}

export function DeletePopoverButton({ id, title }: DeletePopoverButtonProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Get auth token
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token

      if (!token) {
        throw new Error('No auth token')
      }

      const res = await fetch(`/api/admin/popovers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar')
      }

      // Refresh the page to show updated list
      router.refresh()
      setShowDeleteDialog(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar el popup')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDeleteDialog(true)}
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        title="Eliminar popup"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar popup?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás por eliminar el popup <strong>&quot;{title}&quot;</strong>.
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
