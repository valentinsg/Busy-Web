'use client'

import { ThemeToggle } from '@/components/layout/theme-toggle'
import { LanguageToggle } from '@/components/layout/language-toggle'
import { CartSheet } from '@/components/shop/cart-sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useCart } from '@/hooks/use-cart'
import { Menu, Search, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { useI18n } from '@/components/i18n-provider'

const navigation = [
  { key: 'home', href: '/' },
  { key: 'products', href: '/products' },
  { key: 'about', href: '/about' },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/contact' },
]

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [heroInView, setHeroInView] = React.useState(true)
  const pathname = usePathname()
  const { t } = useI18n()

  const { getTotalItems, openCart } = useCart()
  const cartCount = getTotalItems()

  const isHome = pathname === '/'
  const showHeroVariant = isHome && heroInView

  React.useEffect(() => {
    if (!isHome) {
      setHeroInView(false)
      return
    }
    const el = document.getElementById('hero-banner')
    if (!el) {
      // fallback: if no hero element, use scroll position
      const onScroll = () => setHeroInView(window.scrollY < 80)
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
    // Hysteresis to avoid flicker at the threshold
    // Start transition a bit later (more scroll): 0.7 instead of 0.8
    const ENTER_STANDARD_AT = 0.7
    const RETURN_HERO_AT = 0.9
    let last = 1
    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio ?? 0
        last = ratio
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
    return () => observer.disconnect()
  }, [isHome])

  return (
    <header
      className={
        'fixed top-0 left-0 right-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-500 ease-out ' +
        (showHeroVariant
          ? '!border-0 !bg-transparent supports-[backdrop-filter]:!bg-transparent !backdrop-blur-0 !shadow-none'
          : 'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60')
      }
    >
      <div
        className={
          showHeroVariant
            ? 'container flex h-16 items-center justify-between px-4 transition-opacity duration-300'
            : 'container flex h-16 items-center justify-between px-4 transition-opacity duration-300'
        }
      >
        {/* Centered B logo (hero) */}
        <div
          className={
            'fixed top-0 left-0 right-0 h-20 z-50 flex items-center justify-center pointer-events-none transition-[opacity,transform,filter] duration-500 ease-out transform-gpu ' +
            (showHeroVariant
              ? 'opacity-100 scale-100 blur-0'
              : 'opacity-0 scale-95 blur-[2px]')
          }
          aria-hidden={!showHeroVariant}
        >
          <Link
            href="/"
            aria-label="Busy"
            className={
              showHeroVariant ? 'pointer-events-auto' : 'pointer-events-none'
            }
          >
            <Image
              src="/logo-busy-white.png"
              alt="Busy"
              width={90}
              height={30}
              className="object-contain"
            />
          </Link>
        </div>

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
            width={80}
            height={20}
            className="object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className={
            'hidden md:flex items-center z-30 space-x-6 transition-opacity duration-500 ease-out transform-gpu will-change-[opacity] ' +
            (showHeroVariant ? 'opacity-0 pointer-events-none' : 'opacity-100')
          }
        >
          {navigation.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-accent-brand"
            >
              {t(`nav.${item.key}`)}
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
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
          </div>

          {/* Theme Toggle */}

          {/* Cart */}
          <CartSheet>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
          </CartSheet>

          <LanguageToggle />

          <ThemeToggle />

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-4">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-medium py-2 px-2 rounded-md hover:bg-accent transition-colors"
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
