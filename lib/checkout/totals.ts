type Money = number // using decimal amounts (ARS)

export function calcItemsSubtotal(items: Array<{ unit_price: Money; quantity: number }>): Money {
  return Number(items.reduce((acc, it) => acc + it.unit_price * it.quantity, 0).toFixed(2))
}

export function applyPercentDiscount(amount: Money, percent: number): Money {
  const pct = Math.min(Math.max(percent, 0), 100)
  return Number((amount * (pct / 100)).toFixed(2))
}

export function calcOrderTotals(params: {
  items: Array<{ unit_price: Money; quantity: number }>
  shipping_cost?: Money | null
  discount_percent?: number | null
}) {
  const items_total = calcItemsSubtotal(params.items)
  const shipping = Number((params.shipping_cost ?? 0).toFixed(2))
  const discount = params.discount_percent ? applyPercentDiscount(items_total, params.discount_percent) : 0
  const order_total = Number((items_total - discount + shipping).toFixed(2))
  return { items_total, shipping_cost: shipping, discount, order_total }
}
