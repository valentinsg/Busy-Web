import { supabase as client } from "@/lib/supabase/client"
import getServiceClient from "@/lib/supabase/server"

export type ShopSettings = {
  shipping_flat_rate: number
  shipping_free_threshold: number
  christmas_mode: boolean
}

export async function getSettingsServer(): Promise<ShopSettings> {
  const sb = getServiceClient()
  const { data, error } = await sb.from("shop_settings").select("shipping_flat_rate, shipping_free_threshold, christmas_mode").limit(1).maybeSingle()
  if (error) throw error
  if (!data) return { shipping_flat_rate: 25000, shipping_free_threshold: 100000, christmas_mode: false }
  return {
    shipping_flat_rate: Number(data.shipping_flat_rate ?? 25000),
    shipping_free_threshold: Number(data.shipping_free_threshold ?? 100000),
    christmas_mode: Boolean(data.christmas_mode ?? false),
  }
}

export async function getSettingsClient(): Promise<ShopSettings> {
  const { data, error } = await client.from("shop_settings").select("shipping_flat_rate, shipping_free_threshold, christmas_mode").limit(1).maybeSingle()
  if (error) throw error
  if (!data) return { shipping_flat_rate: 25000, shipping_free_threshold: 100000, christmas_mode: false }
  return {
    shipping_flat_rate: Number(data.shipping_flat_rate ?? 25000),
    shipping_free_threshold: Number(data.shipping_free_threshold ?? 100000),
    christmas_mode: Boolean(data.christmas_mode ?? false),
  }
}

export async function upsertSettingsServer(values: ShopSettings) {
  const sb = getServiceClient()
  // Update existing row if present; otherwise insert a new one (avoid explicit id for identity column)
  const { data: existing, error: selectError } = await sb
    .from("shop_settings")
    .select("id")
    .limit(1)
    .maybeSingle()
  if (selectError) throw selectError
  if (existing?.id) {
    const { error: updateError } = await sb
      .from("shop_settings")
      .update(values)
      .eq("id", existing.id)
    if (updateError) throw updateError
  } else {
    const { error: insertError } = await sb
      .from("shop_settings")
      .insert(values)
    if (insertError) throw insertError
  }
}
