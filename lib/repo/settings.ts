import { supabase as client } from "@/lib/supabase/client"
import getServiceClient from "@/lib/supabase/server"

export type ShopSettings = {
  shipping_flat_rate: number
  shipping_free_threshold: number
}

export async function getSettingsServer(): Promise<ShopSettings> {
  const sb = getServiceClient()
  const { data, error } = await sb.from("shop_settings").select("shipping_flat_rate, shipping_free_threshold").limit(1).maybeSingle()
  if (error) throw error
  if (!data) return { shipping_flat_rate: 20000, shipping_free_threshold: 80000 }
  return {
    shipping_flat_rate: Number(data.shipping_flat_rate ?? 20000),
    shipping_free_threshold: Number(data.shipping_free_threshold ?? 80000),
  }
}

export async function getSettingsClient(): Promise<ShopSettings> {
  const { data, error } = await client.from("shop_settings").select("shipping_flat_rate, shipping_free_threshold").limit(1).maybeSingle()
  if (error) throw error
  if (!data) return { shipping_flat_rate: 20000, shipping_free_threshold: 80000 }
  return {
    shipping_flat_rate: Number(data.shipping_flat_rate ?? 20000),
    shipping_free_threshold: Number(data.shipping_free_threshold ?? 80000),
  }
}

export async function upsertSettingsServer(values: ShopSettings) {
  const sb = getServiceClient()
  // ensure singleton by upserting into first row
  const { error } = await sb.from("shop_settings").upsert({ id: 1, ...values }, { onConflict: "id" })
  if (error) throw error
}
