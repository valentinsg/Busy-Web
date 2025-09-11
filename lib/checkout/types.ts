export type CartItemInput = {
  product_id: string
  title?: string
  quantity: number
  variant_size?: string | null
}

export type CreatePreferenceBody = {
  items: CartItemInput[]
  coupon_code?: string | null
  shipping_cost?: number | null
  customer?: {
    first_name?: string | null
    last_name?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    zip?: string | null
  } | null
  newsletter_opt_in?: boolean | null
}

export type CreatePreferenceResponse = {
  init_point: string
  order_id: string
}
