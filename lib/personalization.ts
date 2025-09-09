import type { Product } from '@/lib/types'
import type { BusySession } from '@/lib/session'

// --- Internal helpers ---
function hashToJitter(id: string): number {
  // Deterministic small jitter in [-1, 1]
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0
  }
  const r = Math.abs(h) % 3 // 0,1,2
  return r - 1 // -1,0,1
}

export type ScoredProduct = Product & { __score?: number }

export function scoreProducts(products: Product[], session: BusySession): ScoredProduct[] {
  const clicks = session.clicks || {}
  const lastCategory = session.lastCategory || null
  const wishlistSet = new Set(session.wishlist || [])
  const recentSet = new Set((session.recent || []).map((r) => r.id))
  const lastShownTop = session.lastShownTop || null

  return products.map((p) => {
    let score = 0

    // +5 same lastCategory
    if (lastCategory && p.category === lastCategory) score += 5

    // +2 * clicks[category] (max +10)
    const catClicks = Math.max(0, Math.min(5, (clicks[p.category] ?? 0))) // cap 0..5
    score += 2 * catClicks

    // +3 if in recent
    if (recentSet.has(p.id)) score += 3

    // +4 if in wishlist
    if (wishlistSet.has(p.id)) score += 4

    // -3 if matches lastShownTop
    if (lastShownTop && lastShownTop === p.id) score -= 3

    // small deterministic jitter ±1
    score += hashToJitter(p.id)

    return { ...p, __score: score }
  })
}

export function rankProducts(products: Product[], session: BusySession): Product[] {
  const scored = scoreProducts(products, session)
  // Stable sort by score desc, then by id asc for determinism
  return [...scored].sort((a, b) => {
    const sa = a.__score ?? 0
    const sb = b.__score ?? 0
    if (sb !== sa) return sb - sa
    return a.id.localeCompare(b.id)
  })
}

export function shouldShowPromo(cat: string, session: BusySession, threshold = 3): boolean {
  if (!cat) return false
  const clicks = session.clicks || {}
  return (clicks[cat] ?? 0) > threshold
}
