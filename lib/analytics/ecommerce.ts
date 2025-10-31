export type EcommerceItem = {
  item_id: string
  item_name: string
  item_category?: string | null
  price: number
  quantity: number
  item_variant?: string | null
}

function pushEvent(data: Record<string, unknown>) {
  try {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      ;(window as any).dataLayer.push(data)
    }
  } catch {}
}

export function trackBeginCheckout(params: {
  currency: string
  value: number
  items: EcommerceItem[]
}) {
  pushEvent({ event: 'begin_checkout', ecommerce: params })
}

export function trackPurchase(params: {
  transaction_id: string
  affiliation?: string | null
  currency: string
  value: number
  tax?: number | null
  shipping?: number | null
  coupon?: string | null
  items: EcommerceItem[]
}) {
  pushEvent({ event: 'purchase', ecommerce: params })
}
