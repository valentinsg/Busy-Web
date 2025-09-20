export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price)
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function slugify(text: string): string {
  // Remove accents/diacritics, keep alphanumerics and hyphens, collapse spaces to '-'
  return (text || "")
    .toString()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function capitalize(text?: string | null): string {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1)
}
