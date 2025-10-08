import getServiceClient from "@/lib/supabase/server"

/**
 * Sincroniza el código de descuento de un popover con la tabla coupons.
 * Si el código no existe, lo crea. Si existe, no hace nada.
 */
export async function syncPopoverCoupon(
  code: string | null | undefined,
  percent: number = 10,
  expiresAt?: string | null
): Promise<{ ok: boolean; error?: string }> {
  if (!code) return { ok: true } // No hay código, no hacer nada

  const normalizedCode = code.trim().toUpperCase()
  if (!normalizedCode) return { ok: true }

  try {
    const supabase = getServiceClient()

    // Verificar si el cupón ya existe
    const { data: existing } = await supabase
      .from("coupons")
      .select("code")
      .eq("code", normalizedCode)
      .maybeSingle()

    // Si ya existe, no hacer nada
    if (existing) {
      return { ok: true }
    }

    // Crear el cupón
    const { error } = await supabase.from("coupons").insert({
      code: normalizedCode,
      percent: Math.max(1, Math.min(100, percent)), // Clamp entre 1-100
      active: true,
      expires_at: expiresAt || null,
      max_uses: null, // Sin límite de usos por defecto
      used_count: 0,
    })

    if (error) {
      console.error("Error creating coupon:", error)
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err) {
    console.error("Error syncing popover coupon:", err)
    return { ok: false, error: String(err) }
  }
}
