import getServiceClient from "@/lib/supabase/server"

export type Coupon = {
  code: string
  percent: number
}

/**
 * Validates a coupon code against the database.
 * Only returns active coupons that haven't expired and haven't reached max uses.
 * This function is now async and queries the database instead of using hardcoded values.
 */
export async function validateCoupon(input: string): Promise<Coupon | null> {
  const code = (input || "").trim().toUpperCase()
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
  
  return {
    code: data.code,
    percent: data.percent
  }
}
