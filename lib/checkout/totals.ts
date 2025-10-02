type Money = number // using decimal amounts (ARS)

export type ShippingRule = {
  flat_rate: Money
  free_threshold: Money
}

export function calcItemsSubtotal(items: Array<{ unit_price: Money; quantity: number }>): Money {
  return Number(items.reduce((acc, it) => acc + it.unit_price * it.quantity, 0).toFixed(2))
}

export function applyPercentDiscount(amount: Money, percent: number): Money {
  const pct = Math.min(Math.max(percent, 0), 100)
  return Number((amount * (pct / 100)).toFixed(2))
}

// Shipping rule (ARS): charge 8,000 unless items_total >= 100,000
export function computeShipping(items_total: Money, rule?: ShippingRule): Money {
  const r = rule ?? { flat_rate: 8000, free_threshold: 100000 }
  return items_total >= r.free_threshold ? 0 : r.flat_rate
}

// Tax rule: 10% over (items_total - discount + shipping)
export function computeTax(base_amount: Money): Money {
  return Number((base_amount * 0.10).toFixed(2))
}

export function calcOrderTotals(params: {
  items: Array<{ unit_price: Money; quantity: number }>
  shipping_cost?: Money | null // if null/undefined, it will be computed by rule
  discount_percent?: number | null
  shipping_rule?: ShippingRule
}): {
  items_total: Money
  shipping_cost: Money
  discount: Money
  tax: Money
  order_total: Money
} {
  const items_total = calcItemsSubtotal(params.items)
  const shipping = Number(((params.shipping_cost ?? computeShipping(items_total, params.shipping_rule))).toFixed(2))
  const discount = params.discount_percent ? applyPercentDiscount(items_total, params.discount_percent) : 0
  const pre_tax_total = Number((items_total - discount + shipping).toFixed(2))
  const tax = computeTax(pre_tax_total)
  const order_total = Number((pre_tax_total + tax).toFixed(2))
  return { items_total, shipping_cost: shipping, discount, tax, order_total }
}

export type OrderTotals = {
  items_total: Money
  shipping_cost: Money
  discount: Money
  tax: Money
  order_total: Money
}
