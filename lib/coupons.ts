export type Coupon = {
  code: string
  percent: number
}

/**
 * Validates a coupon code against the database via API endpoint.
 * Only returns active coupons that haven't expired and haven't reached max uses.
 * This function is client-safe and makes a request to the server API.
 */
export async function validateCoupon(input: string): Promise<Coupon | null> {
  const code = (input || "").trim().toUpperCase()
  if (!code) return null
  
  try {
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    return {
      code: data.code,
      percent: data.percent
    }
  } catch (error) {
    console.error("Error validating coupon:", error)
    return null
  }
}
