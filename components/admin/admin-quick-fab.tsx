"use client"

import * as React from "react"
import Link from "next/link"

export default function AdminQuickFAB() {
  const [open, setOpen] = React.useState(false)
  const [isAdmin, setIsAdmin] = React.useState(false)

  // Check if user is admin
  React.useEffect(() => {
    // This function will be called on both client and server,
    // but localStorage only exists on client
    const checkAdmin = () => {
      // Skip if we're not in a browser environment
      if (typeof window === 'undefined') return

      try {
        // For now, we'll just check for the token
        // In a real app, verify the token with your backend
        const token = localStorage.getItem("sb-access-token")

        // For development - show the FAB if we're in development
        const isDevelopment = process.env.NODE_ENV === 'development'

        // Set admin status based on token presence
        // In production, you would verify the token with your backend
        setIsAdmin(!!token || isDevelopment)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      }
    }

    // Run check on mount
    checkAdmin()

    // Also check when the page regains focus
    window.addEventListener('focus', checkAdmin)

    // Cleanup
    return () => {
      window.removeEventListener('focus', checkAdmin)
    }
  }, [])

  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [])

  // Don't render anything if not an admin
  if (!isAdmin) return null

  return (
    <div className={`fixed right-6 bottom-6 z-40`}>
      {open && (
        <div
          className={`
            absolute right-0 bottom-0 transition-all duration-300 ease-[cubic-bezier(0.4, 0, 0.2, 1)]
            ${open ? 'scale-100' : 'scale-0 origin-bottom-right'}
          `}
        >
          <div className="mb-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg shadow-2xl w-72 overflow-hidden">
            <div className="p-4 text-sm font-medium text-white/90 border-b border-white/10 bg-white/5">
              Atajos rápidos
            </div>
          <nav className="p-2 space-y-1">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/5 transition-all duration-200 transform hover:translate-x-1"
              onClick={() => setOpen(false)}
            >
              <span className="text-lg">📦</span> Nuevo producto
            </Link>
            <Link
              href="/admin/newsletter/campaigns/new"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/5 transition-all duration-200 transform hover:translate-x-1"
              onClick={() => setOpen(false)}
            >
              <span className="text-lg">✉️</span> Nueva campaña
            </Link>
            <Link
              href="/admin/coupons/new"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/5 transition-all duration-200 transform hover:translate-x-1"
              onClick={() => setOpen(false)}
            >
              <span className="text-lg">🎟️</span> Nuevo cupón
            </Link>
            <Link
              href="/admin/blog/new"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/5 transition-all duration-200 transform hover:translate-x-1"
              onClick={() => setOpen(false)}
            >
              <span className="text-lg">✍️</span> Nuevo artículo
            </Link>
            <Link
              href="/admin/popovers/new"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/5 transition-all duration-200 transform hover:translate-x-1"
              onClick={() => setOpen(false)}
            >
              <span className="text-lg">💬</span> Nuevo popover
            </Link>
          </nav>
        </div>
      </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          rounded-2xl h-16 w-16 flex items-center justify-center
          transition-all duration-300 ease-[cubic-bezier(0.4, 0, 0.2, 1)]
          bg-gradient-to-br from-blue-500 to-purple-600 text-white
          shadow-lg hover:shadow-xl active:scale-95
          border-2 border-white/20
          ${open ? 'rotate-180 scale-90' : ''}
        `}
        style={{
          position: 'fixed',
          right: '1.5rem',
          bottom: '1.5rem',
          willChange: 'transform',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          outline: 'none',
          cursor: 'pointer',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseDown={(e) => e.preventDefault()}
        aria-label="Atajos rápidos"
      >
        <div className={`
          transition-all duration-300 ease-[cubic-bezier(0.4, 0, 0.2, 1)]
          ${open ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
        `}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <div className={`
          absolute transition-all duration-300 ease-[cubic-bezier(0.4, 0, 0.2, 1)]
          ${open ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}
        `}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      </button>
    </div>
  )
}
