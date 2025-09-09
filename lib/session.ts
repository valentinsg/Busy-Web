// Session helpers for client-only personalization (no database)
// Note: These functions must be called in a browser context.

export const BUSY_SESSION_KEY = 'busy_session'

export type RecentItem = {
  id: string
  name: string
  img: string
  price: number
  category: string
}

export type BusySession = {
  lastCategory: string | null
  recent: RecentItem[]
  wishlist: string[]
  clicks: Record<string, number>
  seenModals: string[]
  updatedAt: number
  // Optional: helps down-rank items we just showed on top
  lastShownTop?: string | null
}

const now = () => Date.now()

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function readRaw(): BusySession | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(BUSY_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BusySession
    // Minimal shape validation and defaults
    return normalize(parsed)
  } catch {
    return null
  }
}

function writeRaw(session: BusySession): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(BUSY_SESSION_KEY, JSON.stringify(session))
  } catch {
    // ignore quota or serialization errors
  }
}

function emptySession(): BusySession {
  return {
    lastCategory: null,
    recent: [],
    wishlist: [],
    clicks: {},
    seenModals: [],
    updatedAt: now(),
    lastShownTop: null,
  }
}

function normalize(s: Partial<BusySession> | null): BusySession {
  const base = emptySession()
  const inSeen = Array.isArray(s?.seenModals) ? s!.seenModals.filter(Boolean) : base.seenModals
  return {
    lastCategory: (typeof s?.lastCategory === 'string' ? s!.lastCategory : null) ?? base.lastCategory,
    recent: Array.isArray(s?.recent) ? s!.recent.filter(Boolean).slice(0, 12) : base.recent,
    wishlist: Array.isArray(s?.wishlist) ? dedupeStrings(s!.wishlist) : base.wishlist,
    clicks: isPlainRecordNumber(s?.clicks) ? s!.clicks as Record<string, number> : base.clicks,
    seenModals: dedupeStrings(inSeen),
    updatedAt: typeof s?.updatedAt === 'number' ? s!.updatedAt : base.updatedAt,
    lastShownTop: (typeof s?.lastShownTop === 'string' ? s!.lastShownTop : null) ?? null,
  }
}

function isPlainRecordNumber(x: unknown): x is Record<string, number> {
  if (!x || typeof x !== 'object') return false
  for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
    if (typeof k !== 'string' || typeof v !== 'number') return false
  }
  return true
}

function dedupeStrings(arr: string[]): string[] {
  return Array.from(new Set(arr))
}

export function clearIfExpired(days = 90): void {
  const s = readRaw()
  if (!s) return
  const ms = days * 24 * 60 * 60 * 1000
  if (now() - s.updatedAt > ms) {
    writeRaw(emptySession())
  }
}

export function getSession(): BusySession {
  const s = readRaw()
  if (!s) {
    const fresh = emptySession()
    writeRaw(fresh)
    return fresh
  }
  return normalize(s)
}

function saveSession(patch: Partial<BusySession>): BusySession {
  const existing = getSession()
  const updated: BusySession = normalize({
    ...existing,
    ...patch,
    updatedAt: now(),
  })
  writeRaw(updated)
  return updated
}

export function setSession(patch: Partial<BusySession>): void {
  saveSession(patch)
}

export function bumpCategory(cat: string): void {
  if (!cat) return
  const s = getSession()
  const nextClicks = { ...s.clicks, [cat]: (s.clicks[cat] ?? 0) + 1 }
  saveSession({ clicks: nextClicks, lastCategory: cat })
}

export function addRecent(p: RecentItem): void {
  if (!p?.id) return
  const s = getSession()
  const without = s.recent.filter((x) => x.id !== p.id)
  const next = [p, ...without].slice(0, 12)
  saveSession({ recent: next, lastCategory: p.category ?? s.lastCategory ?? null })
}

export function toggleWishlist(id: string): void {
  if (!id) return
  const s = getSession()
  const set = new Set(s.wishlist)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  saveSession({ wishlist: Array.from(set) })
}

export function markModalSeen(id: string): void {
  if (!id) return
  const s = getSession()
  if (s.seenModals.includes(id)) return
  saveSession({ seenModals: [...s.seenModals, id] })
}
