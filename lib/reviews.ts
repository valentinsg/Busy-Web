"use client"

export type Review = {
  id: string
  productId: string
  name: string
  rating: number // 1-5
  comment: string
  createdAt: number
}

const STORAGE_KEY = "busy-reviews-v1"

type ReviewStore = Record<string, Review[]>

function readStore(): ReviewStore {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as ReviewStore
  } catch {
    return {}
  }
}

function writeStore(store: ReviewStore) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function getReviews(productId: string): Review[] {
  const store = readStore()
  return store[productId] || []
}

export function addReview(review: Omit<Review, "id" | "createdAt">): Review {
  const store = readStore()
  const list = store[review.productId] || []
  const newReview: Review = {
    ...review,
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    createdAt: Date.now(),
  }
  const updated = [newReview, ...list]
  store[review.productId] = updated
  writeStore(store)
  return newReview
}

export function averageRating(productId: string): number {
  const list = getReviews(productId)
  if (list.length === 0) return 0
  const sum = list.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / list.length) * 10) / 10
}
