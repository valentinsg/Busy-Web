"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContentPieces, useUpdateContentPieceStatus } from "@/hooks/use-airtable-content-pieces"
import { useToast } from "@/hooks/use-toast"
import type { ContentPiece, ContentPieceStatus } from "@/types/airtable"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, GripVertical, Image, Search } from "lucide-react"
import * as React from "react"

const STATUS_COLUMNS: { status: ContentPieceStatus; label: string; color: string }[] = [
  { status: "Idea", label: "Idea", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  { status: "En Producción", label: "En Producción", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { status: "Programado", label: "Programado", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { status: "Publicado", label: "Publicado", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { status: "Archivado", label: "Archivado", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
]

export default function ContentPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const { data: contentPieces, isLoading } = useContentPieces()
  const updateStatus = useUpdateContentPieceStatus()

  // Agrupar piezas por estado
  const piecesByStatus = React.useMemo(() => {
    if (!contentPieces) return {}
    const grouped: Record<ContentPieceStatus, ContentPiece[]> = {
      Idea: [],
      "En Producción": [],
      Programado: [],
      Publicado: [],
      Archivado: [],
    }

    contentPieces.forEach((piece) => {
      if (grouped[piece.status]) {
        grouped[piece.status].push(piece)
      }
    })

    // Filtrar por búsqueda
    if (searchQuery) {
      Object.keys(grouped).forEach((status) => {
        grouped[status as ContentPieceStatus] = grouped[status as ContentPieceStatus].filter((p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
    }

    return grouped
  }, [contentPieces, searchQuery])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const pieceId = active.id as string
    const newStatus = over.id as ContentPieceStatus

    // Encontrar la pieza actual
    const piece = contentPieces?.find((p) => p.id === pieceId)
    if (!piece || piece.status === newStatus) return

    try {
      await updateStatus.mutateAsync({ id: pieceId, status: newStatus })
      toast({
        title: "Estado actualizado",
        description: `La pieza se movió a "${newStatus}"`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    }
  }

  const activePiece = React.useMemo(() => {
    if (!activeId || !contentPieces) return null
    return contentPieces.find((p) => p.id === activeId) || null
  }, [activeId, contentPieces])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold">Contenido</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona piezas de contenido con vista kanban
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="max-w-md">
        <Label htmlFor="search">Buscar</Label>
        <div className="relative mt-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Buscar por título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">Cargando piezas...</div>
      )}

      {!isLoading && (
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {STATUS_COLUMNS.map((column) => {
              const pieces = piecesByStatus[column.status] || []
              return (
                <StatusColumn
                  key={column.status}
                  status={column.status}
                  label={column.label}
                  color={column.color}
                  pieces={pieces}
                />
              )
            })}
          </div>

          <DragOverlay>
            {activePiece && <ContentPieceCard piece={activePiece} isDragging />}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}

function StatusColumn({
  status,
  label,
  color,
  pieces,
}: {
  status: ContentPieceStatus
  label: string
  color: string
  pieces: ContentPiece[]
}) {
  return (
    <div className="space-y-2">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">{label}</CardTitle>
            <Badge variant="outline" className={color}>
              {pieces.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <SortableContext items={pieces.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {pieces.map((piece) => (
            <SortableContentPieceCard key={piece.id} piece={piece} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

function SortableContentPieceCard({ piece }: { piece: ContentPiece }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: piece.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ContentPieceCard piece={piece} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

function ContentPieceCard({
  piece,
  isDragging = false,
  dragHandleProps,
}: {
  piece: ContentPiece
  isDragging?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}) {
  return (
    <Card className={isDragging ? "shadow-lg" : ""}>
      <CardContent className="p-4 space-y-2">
        {dragHandleProps && (
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing mb-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        <h4 className="font-semibold text-sm line-clamp-2">{piece.title}</h4>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {piece.type}
          </Badge>
        </div>

        {piece.scheduledDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(piece.scheduledDate), "dd MMM", { locale: es })}
          </div>
        )}

        {piece.assetUrls.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Image className="h-3 w-3" />
            {piece.assetUrls.length} asset(s)
          </div>
        )}

        {piece.url && (
          <a
            href={piece.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Ver publicación →
          </a>
        )}
      </CardContent>
    </Card>
  )
}

