import getServiceClient from "@/lib/supabase/server"

export async function validateCouponPercent(code: string | null | undefined): Promise<number | null> {
  if (!code) return null
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("coupons")
    .select("code, percent, active, expires_at, max_uses, used_count")
    .eq("code", code)
    .maybeSingle()
  if (error || !data) return null
  if (!data.active) return null
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null
  if (data.max_uses && data.used_count >= data.max_uses) return null
  return data.percent
}
