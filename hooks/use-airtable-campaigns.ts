/**
 * React Query hooks para Campañas de Airtable
 */

import type { Campaign, CampaignFilters } from "@/types/airtable"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: ["airtable", "campaigns", filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters?.status) {
        params.append("status", filters.status.join(","))
      }
      if (filters?.type) {
        params.append("type", filters.type.join(","))
      }
      if (filters?.startDateFrom) {
        params.append("startDateFrom", filters.startDateFrom)
      }
      if (filters?.startDateTo) {
        params.append("startDateTo", filters.startDateTo)
      }
      if (filters?.search) {
        params.append("search", filters.search)
      }

      const res = await fetch(`/api/airtable/campaigns?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch campaigns")
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || "Failed to fetch campaigns")
      return data.items as Campaign[]
    },
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["airtable", "campaigns", id],
    queryFn: async () => {
      const res = await fetch(`/api/airtable/campaigns?id=${id}`)
      if (!res.ok) throw new Error("Failed to fetch campaign")
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || "Failed to fetch campaign")
      return data.item as Campaign
    },
    enabled: !!id,
  })
}

export function useUpdateCampaignStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Campaign["status"] }) => {
      const res = await fetch(`/api/airtable/campaigns?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update campaign")
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || "Failed to update campaign")
      return data.item as Campaign
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["airtable", "campaigns"] })
      queryClient.setQueryData(["airtable", "campaigns", data.id], data)
    },
  })
}

