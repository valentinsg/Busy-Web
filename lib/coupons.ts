export type Coupon = {
  code: string
  percent: number // 10 to 20
}

// Simple in-memory coupon list. You can swap this for an API later.
const COUPONS: Coupon[] = [
  { code: "BUSY10", percent: 10 },
  { code: "BUSY15", percent: 15 },
  { code: "BUSY20", percent: 20 },
]

export function validateCoupon(input: string): Coupon | null {
  const code = (input || "").trim().toUpperCase()
  const found = COUPONS.find((c) => c.code === code)
  if (!found) return null
  // Ensure within allowed range 10-20
  if (found.percent < 10 || found.percent > 20) return null
  return found
}
