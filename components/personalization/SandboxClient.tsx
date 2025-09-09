"use client"

import React from 'react'
import {
  getSession,
  bumpCategory,
  addRecent,
  toggleWishlist,
  clearIfExpired,
  setSession,
} from '@/lib/session'

export default function SandboxClient() {
  const [cat, setCat] = React.useState('hoodies')
  const [recentId, setRecentId] = React.useState('p1')
  const [recentName, setRecentName] = React.useState('Producto Demo')
  const [recentImg, setRecentImg] = React.useState('/baseball-cap-display.png')
  const [recentPrice, setRecentPrice] = React.useState(19999)
  const [recentCat, setRecentCat] = React.useState('hoodies')
  const [wishlistId, setWishlistId] = React.useState('p1')
  const [lastShownTop, setLastShownTop] = React.useState('')

  const [session, setSessionState] = React.useState(() => (typeof window === 'undefined' ? null : getSession()))

  const refresh = React.useCallback(() => {
    setSessionState(getSession())
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-md border border-neutral-200 p-4">
          <h3 className="font-semibold mb-3">Categoría</h3>
          <div className="flex gap-2 mb-3">
            <input
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              placeholder="Categoría"
              className="w-56 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <button
              className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
              onClick={() => {
                bumpCategory(cat.trim())
                refresh()
              }}
            >
              bumpCategory
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <input
              value={lastShownTop}
              onChange={(e) => setLastShownTop(e.target.value)}
              placeholder="lastShownTop productId"
              className="w-56 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <button
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
              onClick={() => {
                setSession({ lastShownTop: lastShownTop || null })
                refresh()
              }}
            >
              set lastShownTop
            </button>
          </div>
        </div>

        <div className="rounded-md border border-neutral-200 p-4">
          <h3 className="font-semibold mb-3">Recent</h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <input
              value={recentId}
              onChange={(e) => setRecentId(e.target.value)}
              placeholder="id"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              value={recentName}
              onChange={(e) => setRecentName(e.target.value)}
              placeholder="name"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              value={recentImg}
              onChange={(e) => setRecentImg(e.target.value)}
              placeholder="img url"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              value={recentPrice}
              onChange={(e) => setRecentPrice(Number(e.target.value) || 0)}
              placeholder="price"
              type="number"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              value={recentCat}
              onChange={(e) => setRecentCat(e.target.value)}
              placeholder="category"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
            onClick={() => {
              addRecent({ id: recentId.trim(), name: recentName.trim(), img: recentImg.trim(), price: recentPrice, category: recentCat.trim() })
              refresh()
            }}
          >
            addRecent
          </button>
        </div>

        <div className="rounded-md border border-neutral-200 p-4">
          <h3 className="font-semibold mb-3">Wishlist</h3>
          <div className="flex gap-2">
            <input
              value={wishlistId}
              onChange={(e) => setWishlistId(e.target.value)}
              placeholder="productId"
              className="w-56 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <button
              className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
              onClick={() => {
                toggleWishlist(wishlistId.trim())
                refresh()
              }}
            >
              toggleWishlist
            </button>
          </div>
        </div>

        <div className="rounded-md border border-neutral-200 p-4">
          <h3 className="font-semibold mb-3">Mantenimiento</h3>
          <div className="flex gap-2">
            <button
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
              onClick={() => {
                clearIfExpired(90)
                refresh()
              }}
            >
              clearIfExpired(90)
            </button>
            <button
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
              onClick={() => {
                localStorage.removeItem('busy_session')
                refresh()
              }}
            >
              reset busy_session
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-neutral-200 p-4">
        <h3 className="font-semibold mb-3">busy_session</h3>
        <pre className="overflow-auto text-xs bg-neutral-50 p-3 rounded-md border border-neutral-200">
{JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  )
}
