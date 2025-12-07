"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Promotion } from "@/types"
import { Edit, Plus, Power, PowerOff, Trash2 } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

export default function PromotionsAdminPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadPromotions = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/promotions')
      if (response.ok) {
        const data = await response.json()
        setPromotions(data)
      }
    } catch (error) {
      console.error('Error loading promotions:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las promociones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadPromotions()
  }, [loadPromotions])

  async function togglePromotion(id: string, currentState: boolean) {
    try {
      const response = await fetch(`/api/admin/promotions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentState }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Promoción ${!currentState ? 'activada' : 'desactivada'}`,
        })
        loadPromotions()
      }
    } catch (error) {
      console.error('Error toggling promotion:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la promoción",
        variant: "destructive",
      })
    }
  }

  async function deletePromotion(id: string) {
    try {
      const response = await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Promoción eliminada",
        })
        loadPromotions()
      }
    } catch (error) {
      console.error('Error deleting promotion:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la promoción",
        variant: "destructive",
      })
    }
  }

  const getPromoTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'nxm': 'NxM (2x1, 3x2)',
      'percentage_off': '% Descuento',
      'fixed_amount': '$ Fijo',
      'combo': 'Combo',
      'bundle': 'Bundle',
      'nth_unit_discount': 'N° Unidad Desc.',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando promociones...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Promociones</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las promociones activas de tu tienda
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/promotions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Promoción
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {promotions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                No hay promociones creadas
              </p>
              <Button asChild>
                <Link href="/admin/promotions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Promoción
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          promotions.map((promo) => (
            <Card key={promo.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="font-heading">{promo.name}</CardTitle>
                      <Badge variant={promo.active ? "success" : "secondary"}>
                        {promo.active ? "Activa" : "Inactiva"}
                      </Badge>
                      <Badge variant="outline">
                        {getPromoTypeLabel(promo.promo_type)}
                      </Badge>
                      <Badge variant="secondary">
                        Prioridad: {promo.priority}
                      </Badge>
                    </div>
                    {promo.description && (
                      <p className="text-sm text-muted-foreground">
                        {promo.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePromotion(promo.id, promo.active)}
                      title={promo.active ? "Desactivar" : "Activar"}
                    >
                      {promo.active ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/promotions/${promo.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar promoción?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. La promoción será eliminada permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deletePromotion(promo.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">SKUs Elegibles</div>
                    <div className="font-medium">
                      {promo.eligible_skus.length} SKUs ({promo.sku_match_type})
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Usos</div>
                    <div className="font-medium">
                      {promo.current_uses}
                      {promo.max_total_uses && ` / ${promo.max_total_uses}`}
                    </div>
                  </div>
                  {promo.starts_at && (
                    <div>
                      <div className="text-muted-foreground">Inicia</div>
                      <div className="font-medium">
                        {new Date(promo.starts_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {promo.ends_at && (
                    <div>
                      <div className="text-muted-foreground">Termina</div>
                      <div className="font-medium">
                        {new Date(promo.ends_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
