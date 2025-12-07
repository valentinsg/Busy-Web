import { supabase as client } from "@/lib/supabase/client"
import getServiceClient from "@/lib/supabase/server"

export type ProvinceRate = {
  rate: number
  enabled: boolean
}

export type ProvinceRates = Record<string, ProvinceRate>

export type ShopSettings = {
  shipping_flat_rate: number
  shipping_free_threshold: number
  christmas_mode: boolean
  // New shipping config fields
  free_shipping_enabled: boolean
  free_shipping_message: string
  mar_del_plata_rate: number
  default_carrier: string
  province_rates: ProvinceRates
}

const DEFAULT_SETTINGS: ShopSettings = {
  shipping_flat_rate: 25000,
  shipping_free_threshold: 100000,
  christmas_mode: false,
  free_shipping_enabled: false,
  free_shipping_message: 'Envío gratis en todas las compras',
  mar_del_plata_rate: 10000,
  default_carrier: 'correo_argentino',
  province_rates: {},
}

function mapDbToSettings(data: Record<string, unknown>): ShopSettings {
  return {
    shipping_flat_rate: Number(data.shipping_flat_rate ?? DEFAULT_SETTINGS.shipping_flat_rate),
    shipping_free_threshold: Number(data.shipping_free_threshold ?? DEFAULT_SETTINGS.shipping_free_threshold),
    christmas_mode: Boolean(data.christmas_mode ?? DEFAULT_SETTINGS.christmas_mode),
    free_shipping_enabled: Boolean(data.free_shipping_enabled ?? DEFAULT_SETTINGS.free_shipping_enabled),
    free_shipping_message: String(data.free_shipping_message ?? DEFAULT_SETTINGS.free_shipping_message),
    mar_del_plata_rate: Number(data.mar_del_plata_rate ?? DEFAULT_SETTINGS.mar_del_plata_rate),
    default_carrier: String(data.default_carrier ?? DEFAULT_SETTINGS.default_carrier),
    province_rates: (data.province_rates as ProvinceRates) ?? DEFAULT_SETTINGS.province_rates,
  }
}

export async function getSettingsServer(): Promise<ShopSettings> {
  const sb = getServiceClient()
  const { data, error } = await sb
    .from("shop_settings")
    .select("*")
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) return DEFAULT_SETTINGS
  return mapDbToSettings(data)
}

export async function getSettingsClient(): Promise<ShopSettings> {
  const { data, error } = await client
    .from("shop_settings")
    .select("*")
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) return DEFAULT_SETTINGS
  return mapDbToSettings(data)
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
