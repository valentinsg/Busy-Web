/**
 * React Query hooks para Piezas de Contenido de Airtable
 */

import type { ContentPiece, ContentPieceFilters } from "@/types/airtable"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useContentPieces(filters?: ContentPieceFilters) {
  return useQuery({
    queryKey: ["airtable", "content-pieces", filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters?.status) {
        params.append("status", filters.status.join(","))
      }
      if (filters?.type) {
        params.append("type", filters.type.join(","))
      }
      if (filters?.campaignId) {
        params.append("campaignId", filters.campaignId)
      }
      if (filters?.channelId) {
        params.append("channelId", filters.channelId)
      }
      if (filters?.search) {
        params.append("search", filters.search)
      }

      const res = await fetch(`/api/airtable/content-pieces?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch content pieces")
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || "Failed to fetch content pieces")
      return data.items as ContentPiece[]
    },
  })
}

export function useUpdateContentPieceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContentPiece["status"] }) => {
      const res = await fetch(`/api/airtable/content-pieces?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update content piece")
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || "Failed to update content piece")
      return data.item as ContentPiece
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airtable", "content-pieces"] })
    },
  })
}

