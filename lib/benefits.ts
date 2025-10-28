export type PredefinedBenefit = {
  key: string
  title: string
  subtitle?: string
}

// Beneficios predefinidos comunes en ecommerce + los que ya usamos por defecto en PDP
export const PREDEFINED_BENEFITS: PredefinedBenefit[] = [
  { key: "free_shipping", title: "Envío gratis" },
  { key: "easy_returns", title: "Devoluciones fáciles", subtitle: "Política de 30 días" },
  { key: "quality_guarantee", title: "Garantía de calidad", subtitle: "Materiales premium y excelente confección" },
  { key: "made_in_argentina", title: "Hecho en Argentina", subtitle: "Producción local" },
  { key: "imported", title: "Producto importado", subtitle: "Origen internacional" },
  { key: "secure_payment", title: "Pago seguro", subtitle: "Procesamiento cifrado" },
  { key: "fast_shipping", title: "Envío rápido", subtitle: "24-48 hs hábiles" },
  { key: "store_pickup", title: "Retiro en tienda", subtitle: "Sin costo" },
  { key: "size_exchange", title: "Primer cambio sin costo", subtitle: "Dentro de los 15 días" },
]

export function buildBenefitsFromKeys(keys: string[]) {
  return keys
    .map((k) => PREDEFINED_BENEFITS.find((b) => b.key === k))
    .filter((b): b is PredefinedBenefit => !!b)
    .map((b) => (b.subtitle ? { title: b.title, subtitle: b.subtitle } : { title: b.title }))
}
