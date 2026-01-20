"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCampaigns, useUpdateCampaignStatus } from "@/hooks/use-airtable-campaigns"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/format"
import type { Campaign, CampaignFilters, CampaignStatus, CampaignType } from "@/types/airtable"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Filter, Search, TrendingUp } from "lucide-react"
import * as React from "react"

export default function CampaignsPage() {
  const { toast } = useToast()
  const [filters, setFilters] = React.useState<CampaignFilters>({})
  const [searchQuery, setSearchQuery] = React.useState("")

  const { data: campaigns, isLoading, error } = useCampaigns(filters)
  const updateStatus = useUpdateCampaignStatus()

  const handleStatusChange = async (campaignId: string, newStatus: CampaignStatus) => {
    try {
      await updateStatus.mutateAsync({ id: campaignId, status: newStatus })
      toast({
        title: "Estado actualizado",
        description: "La campaña se actualizó correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    }
  }

  // Filtrar por búsqueda local
  const filteredCampaigns = React.useMemo(() => {
    if (!campaigns) return []
    if (!searchQuery) return campaigns
    return campaigns.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [campaigns, searchQuery])

  const statusColors: Record<CampaignStatus, string> = {
    Idea: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    Planificando: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Activa: "bg-green-500/10 text-green-400 border-green-500/20",
    Pausada: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Finalizada: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Cancelada: "bg-red-500/10 text-red-400 border-red-500/20",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold">Campañas</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona campañas de marketing desde Airtable
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={filters.status?.join(",") || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilters((prev) => {
                      const { status, ...rest } = prev
                      return rest
                    })
                  } else {
                    setFilters((prev) => ({
                      ...prev,
                      status: value.split(",") as CampaignStatus[],
                    }))
                  }
                }}
              >
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Idea">Idea</SelectItem>
                  <SelectItem value="Planificando">Planificando</SelectItem>
                  <SelectItem value="Activa">Activa</SelectItem>
                  <SelectItem value="Pausada">Pausada</SelectItem>
                  <SelectItem value="Finalizada">Finalizada</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={filters.type?.join(",") || "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setFilters((prev) => {
                      const { type, ...rest } = prev
                      return rest
                    })
                  } else {
                    setFilters((prev) => ({
                      ...prev,
                      type: value.split(",") as CampaignType[],
                    }))
                  }
                }}
              >
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Promoción">Promoción</SelectItem>
                  <SelectItem value="Lanzamiento">Lanzamiento</SelectItem>
                  <SelectItem value="Evento">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de campañas */}
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">Cargando campañas...</div>
      )}

      {error && (
        <Card>
          <CardContent className="py-12 text-center text-destructive">
            Error al cargar campañas: {error instanceof Error ? error.message : "Error desconocido"}
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay campañas que coincidan con los filtros
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredCampaigns.length > 0 && (
        <div className="grid gap-4">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              statusColors={statusColors}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CampaignCard({
  campaign,
  statusColors,
  onStatusChange,
}: {
  campaign: Campaign
  statusColors: Record<CampaignStatus, string>
  onStatusChange: (id: string, status: CampaignStatus) => void
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg">{campaign.name}</h3>
              <Badge variant="outline" className={statusColors[campaign.status]}>
                {campaign.status}
              </Badge>
              <Badge variant="outline">{campaign.type}</Badge>
            </div>

            {campaign.objective && (
              <p className="text-sm text-muted-foreground">{campaign.objective}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {campaign.startDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(campaign.startDate), "dd MMM yyyy", { locale: es })}
                </div>
              )}
              {campaign.budget && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Presupuesto: {formatPrice(campaign.budget)}
                </div>
              )}
              {campaign.relatedProductIds.length > 0 && (
                <div>
                  {campaign.relatedProductIds.length} producto(s) relacionado(s)
                </div>
              )}
            </div>

            {campaign.channels.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Canales:</span>
                {campaign.channels.map((channel) => (
                  <Badge key={channel} variant="outline" className="text-xs">
                    {channel}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Select
              value={campaign.status}
              onValueChange={(value) => onStatusChange(campaign.id, value as CampaignStatus)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Idea">Idea</SelectItem>
                <SelectItem value="Planificando">Planificando</SelectItem>
                <SelectItem value="Activa">Activa</SelectItem>
                <SelectItem value="Pausada">Pausada</SelectItem>
                <SelectItem value="Finalizada">Finalizada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

