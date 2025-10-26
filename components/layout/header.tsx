'use client'

import { useI18n } from '@/components/i18n-provider'
import { LanguageToggle } from '@/components/layout/language-toggle'
import { CartSheet } from '@/components/shop/cart-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useCart } from '@/hooks/use-cart'
import { supabase } from '@/lib/supabase/client'
import { Menu, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'

const navigation = [
  { label: 'Inicio', href: '/' },
  { label: 'Productos', href: '/products' },
  { label: 'Playlists', href: '/playlists' },
  { label: 'Blog', href: '/blog' },
  { label: 'Cultura', href: '/about' },
  { label: 'Contactanos', href: '/contact' },
]

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [heroInView, setHeroInView] = React.useState(true)
  const pathname = usePathname()
  const { t } = useI18n()
  const [isAdmin, setIsAdmin] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    async function checkAdmin() {
      try {
        const { data } = await supabase.auth.getUser()
        const email = data?.user?.email
        if (!email) return
        const res = await fetch('/api/admin/is-admin', { cache: 'no-store' })
        const json = await res.json()
        const admins: string[] = json.admins || []
        if (!cancelled) setIsAdmin(admins.includes(email))
      } catch {
        // ignore
      }
    }
    checkAdmin()
    return () => {
      cancelled = true
    }
  }, [])

  const { getTotalItems } = useCart()
  // Hydration guard: ensure SSR/CSR render same markup initially
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const cartCount = mounted ? getTotalItems() : 0

  const isHome = pathname === '/'
  const showHeroVariant = isHome && heroInView

  React.useEffect(() => {
    if (!isHome) {
      setHeroInView(false)
      return
    }

    // Force reset to true when entering home page
    setHeroInView(true)

    let observer: IntersectionObserver | null = null
    let scrollHandler: (() => void) | null = null

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const el = document.getElementById('hero-banner')
      if (!el) {
        // fallback: if no hero element, use scroll position
        scrollHandler = () => setHeroInView(window.scrollY < 80)
        scrollHandler()
        window.addEventListener('scroll', scrollHandler, { passive: true })
        return
      }

      // Check initial position immediately
      const rect = el.getBoundingClientRect()
      const initialRatio = Math.max(0, Math.min(1, rect.height > 0 ?
        (Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)) / rect.height : 0
      ))
      setHeroInView(initialRatio > 0.7)

      // Hysteresis to avoid flicker at the threshold
      const ENTER_STANDARD_AT = 0.7
      const RETURN_HERO_AT = 0.9
      observer = new IntersectionObserver(
        ([entry]) => {
          const ratio = entry.intersectionRatio ?? 0
          setHeroInView((prev) => {
            if (prev) {
              // currently hero; leave hero only when ratio drops clearly below 0.8
              return ratio > ENTER_STANDARD_AT
            } else {
              // currently standard; return to hero only when ratio rises above 0.9
              return ratio > RETURN_HERO_AT
            }
          })
        },
        { root: null, threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
      )
      observer.observe(el)
    }, 50)

    return () => {
      clearTimeout(timeoutId)
      if (observer) observer.disconnect()
      if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
    }
  }, [isHome, pathname])

  return (
    <header
      style={{ minHeight: '72px' }}
      className={
        'fixed font-heading top-0 left-0 right-0 z-40 w-full transition-[background-color,border-color,backdrop-filter] duration-500 ease-out ' +
        (showHeroVariant
          ? '!border-0 py-3 sm:p-3 !bg-transparent supports-[backdrop-filter]:!bg-transparent !backdrop-blur-0 !shadow-none'
          : 'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 sm:py-0')
      }
    >
      <div
        className={
          showHeroVariant
            ? 'container flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4 transition-opacity duration-300'
            : 'container flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4 transition-opacity duration-300'
        }

        >

        {/* Left logo (standard navbar) */} 
        <Link
          href="/"
          className={
            'flex items-center space-x-2 transition-[opacity,transform] duration-500 ease-out transform-gpu will-change-[opacity] ' +
            (showHeroVariant
              ? 'opacity-0 scale-95 pointer-events-none'
              : 'opacity-100 scale-100')
          }
          aria-label="Busy Home"
        >
          <Image
            src="/busy-gothic.png"
            alt="Busy"
            width={100}
            height={24}
            className="object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className={
            'hidden md:flex items-center relative z-10 space-x-6 lg:space-x-8 font-heading transition-opacity duration-500 ease-out transform-gpu will-change-[opacity] ' +
            (showHeroVariant ? 'opacity-0 pointer-events-none' : 'opacity-100')
          }
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="text-sm font-medium transition-all hover:text-accent-brand relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-brand transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Search, Theme Toggle, Cart */}
        <div
          className={
            'flex items-center space-x-4 transition-opacity duration-500 will-change-[opacity] ' +
            (showHeroVariant ? 'opacity-0 pointer-events-none' : 'opacity-100')
          }
        >
          {/* Search */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search.placeholder', {
                  default: 'Buscar productos',
                })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
          </div>

          {/* Cart */}
          <CartSheet>
            <Button variant="ghost" size="icon" className="relative">
              <span className="sr-only">Abrir carrito</span>
              <Image
                src="/icons/shopping_bag_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg"
                alt="Carrito"
                width={22}
                height={22}
                className="opacity-90"
              />
              <span
                aria-hidden
                className={
                  'absolute -top-2 -right-2 grid place-items-center rounded-full border border-white/20 bg-red-600 text-white text-[10px] leading-none font-semibold tabular-nums shadow-sm transition-all duration-200 ease-out ' +
                  (cartCount > 0
                    ? 'min-w-[18px] h-[18px] px-[4px] opacity-100 scale-100 animate-[pulse_2s_ease-in-out_infinite]'
                    : 'min-w-[18px] h-[18px] px-[4px] opacity-0 scale-0')
                }
              >
                {cartCount > 0 ? String(cartCount) : ''}
              </span>
              <style jsx>{`
                @keyframes pulse {
                  0%,
                  100% {
                    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.6);
                  }
                  50% {
                    box-shadow: 0 0 0 6px rgba(220, 38, 38, 0);
                  }
                }
              `}</style>
            </Button>
          </CartSheet>

          <div className="hidden md:flex">
            <LanguageToggle />
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] font-body"
            >
              <div className="flex flex-col space-y-4 mt-4">
                {/* Logo at top */}
                <div className="flex items-center justify-center py-2">
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <Image
                      src="/busy-gothic.png"
                      alt="Busy"
                      width={120}
                      height={28}
                      className="object-contain"
                    />
                  </Link>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-2 font-body">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-medium py-2 px-2 rounded-md hover:bg-accent transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Language toggle inside menu */}
                <div className="pt-2 border-t">
                  <LanguageToggle />
                </div>

                {/* Newsletter at bottom */}
                <div className="mt-4 pt-2 border-t">
                  <form
                    className="flex gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      const form = e.currentTarget as HTMLFormElement
                      const formData = new FormData(form)
                      const email = String(formData.get('email') || '')
                      if (!email) return
                      try {
                        await fetch('/api/newsletter/subscribe', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email }),
                        })
                        form.reset()
                        alert('¡Gracias por suscribirte!')
                      } catch {
                        alert('No se pudo suscribir. Intentá de nuevo.')
                      }
                    }}
                  >
                    <Input
                      type="email"
                      name="email"
                      placeholder="Tu email"
                      required
                      className="flex-1"
                    />
                    <Button type="submit" className="shrink-0">
                      OK
                    </Button>
                  </form>
                </div>

                {/* Admin shortcut if admin */}
                {isAdmin && (
                  <div className="pt-2">
                    <Button asChild className="w-full">
                      <Link href="/admin" onClick={() => setIsOpen(false)}>
                        Panel Admin
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
