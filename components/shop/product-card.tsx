'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Star, ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'
import { formatPrice, formatRating } from '@/lib/format'
import { useCart } from '@/hooks/use-cart'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ProductCardProps {
  product: Product
  /** When provided, clicking the card navigates to this admin edit URL instead of the public product page. */
  adminEditHref?: string
}

export function ProductCard({ product, adminEditHref }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [isHovered, setIsHovered] = React.useState(false)

  const { addItem, openCart } = useCart()
  const router = useRouter()
  const overlayRef = React.useRef<HTMLDivElement | null>(null)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (product.images.length > 1) {
      setCurrentImageIndex(1)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setCurrentImageIndex(0)
  }

  const handleAddToCartWithSize = (
    _e: React.SyntheticEvent | undefined,
    size: string
  ) => {
    // Use first available color by default for quick add
    const defaultColor = product.colors[0]
    addItem(product, size, defaultColor, 1)
    openCart()
  }

  // Detectar "One Size" para mostrar un botón a lo ancho completo
  const isOneSize = React.useMemo(() => {
    const onlyOne = product.sizes && product.sizes.length === 1
    if (!onlyOne) return false
    const s = product.sizes[0]
    return /^(one|one size|onesize|único|talle único)$/i.test(String(s))
  }, [product.sizes])

  const formatSizeTooltip = (size: string) => {
    const m = (product as any).measurementsBySize?.[size] as
      | Record<string, any>
      | undefined
    if (!m) return 'Medidas no disponibles'
    const unit = typeof m.unit === 'string' ? m.unit : undefined
    const numericKeys = Object.keys(m).filter(
      (k) => k !== 'unit' && typeof m[k] === 'number'
    )
    if (numericKeys.length === 0)
      return unit ? `Unidad: ${unit}` : 'Medidas no disponibles'
    const preferredOrder = [
      'chest',
      'length',
      'sleeve',
      'waist',
      'hip',
      'head_circumference_min',
      'head_circumference_max',
    ]
    const ordered = preferredOrder
      .filter((k) => numericKeys.includes(k))
      .concat(numericKeys.filter((k) => !preferredOrder.includes(k)))
    const labelMap: Record<string, string> = {
      chest: 'Pecho',
      length: 'Largo',
      sleeve: 'Manga',
      waist: 'Cintura',
      hip: 'Cadera',
      head_circumference_min: 'Cabeza min',
      head_circumference_max: 'Cabeza max',
    }
    const parts = ordered.map(
      (k) => `${labelMap[k] ?? k}: ${m[k]}${unit ? unit : ''}`
    )
    return parts.join(' · ')
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300">
      <div
        role="link"
        tabIndex={0}
        aria-disabled={isHovered}
        className="cursor-pointer"
        onClick={(e) => {
          const target = e.target as HTMLElement
          // If the click originated from an interactive control inside the overlay
          // (e.g., the size buttons), do not navigate.
          if (target.closest('[data-overlay-control="true"]')) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
          // Admin mode: navigate to edit page
          if (adminEditHref) {
            router.push(adminEditHref)
          } else {
            router.push(`/product/${product.id}`)
          }
        }}
        onKeyDown={(e) => {
          // Allow keyboard navigation unless focus is on an overlay control
          const target = e.target as HTMLElement
          if (target && target.closest('[data-overlay-control="true"]')) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (adminEditHref) {
              router.push(adminEditHref)
            } else {
              router.push(`/product/${product.id}`)
            }
          }
        }}
      >
        {/* Glow frame wrapper */}
        <div className="group relative rounded-2xl p-[4px] bg-gradient-to-br from-white/45 via-white/20 to-transparent ring-2 ring-white/30 shadow-[0_0_50px_rgba(35,35,35,0.3)]">
          {/* soft external glow */}
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />

          {/* subtle inner border */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15" />

          {/* corner accents */}
          <span className="pointer-events-none absolute top-3 left-3 h-px w-8 bg-white/40" />
          <span className="pointer-events-none absolute top-3 left-3 h-8 w-px bg-white/40" />
          <span className="pointer-events-none absolute top-3 right-3 h-px w-8 bg-white/40" />
          <span className="pointer-events-none absolute top-3 right-3 h-8 w-px bg-white/40" />
          <span className="pointer-events-none absolute bottom-3 left-3 h-px w-8 bg-white/30" />
          <span className="pointer-events-none absolute bottom-3 left-3 h-8 w-px bg-white/30" />
          <span className="pointer-events-none absolute bottom-3 right-3 h-px w-8 bg-white/30" />
          <span className="pointer-events-none absolute bottom-3 right-3 h-8 w-px bg-white/30" />

          {/* content card */}
          <div
            className="relative aspect-square overflow-hidden rounded-[16px] bg-muted ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)]"
            onPointerEnter={handleMouseEnter}
            onPointerLeave={handleMouseLeave}
          >
            {/* gentle sheen on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-15 transition-opacity duration-500" />

            <Image
              src={'/product-bg.jpg'}
              alt={"Busy Pattern white, diseñado por @agus.mxlina"}
              fill
              className="object-cover absolute transition-transform duration-300 group-hover:scale-105"
            />
            <Image
              src={
                product.images[currentImageIndex] ||
                '/placeholder.svg?height=400&width=400&query=hoodie'
              }
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

          {/* Stock badge */}
          {product.stock < 10 && (
            <Badge
              variant="destructive"
              className="absolute top-2 left-2 font-body"
            >
              Quedan solo {product.stock}
            </Badge>
          )}

          {/* Admin preview badge/button */}
          {adminEditHref && (
            <a
              href={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 right-2 z-20 text-[11px] underline bg-black/50 rounded px-2 py-1"
            >
              Ver en web
            </a>
          )}

          {/* Sizes overlay on hover (hidden in admin cards) */}
          {!adminEditHref && product.sizes?.length > 0 && (
            <div
              ref={overlayRef}
              className={`absolute inset-0 z-10 ${
                isHovered
                  ? 'pointer-events-auto cursor-default'
                  : 'pointer-events-none'
              }`}
              // Do not stop propagation on background so clicking the image navigates
              onPointerEnter={() => setIsHovered(true)}
              onPointerLeave={() => setIsHovered(false)}
              onMouseDown={(e) => {
                // Let background clicks bubble; controls will stop via data attribute check in parent
              }}
              onPointerDown={(e) => {
                // Let background pointer down bubble
              }}
              onTouchStart={(e) => {
                // Allow background taps to bubble so they can navigate
              }}
            >
              <div
                className={`absolute inset-x-0 bottom-0 ${
                  isHovered ? 'translate-y-0' : 'translate-y-full'
                } transition-transform duration-300`}
              >
                <div className="pointer-events-auto mb-2 rounded-xl mx-auto w-1/2 border border-[rgba(255,255,255,0.06)] bg-[rgba(155,155,155,0.06)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl backdrop-saturate-120">
                  <TooltipProvider
                    disableHoverableContent
                    delayDuration={0}
                    skipDelayDuration={0}
                  >
                    <div className="flex flex-wrap items-center justify-center">
                      {isOneSize ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) =>
                                handleAddToCartWithSize(
                                  e,
                                  String(product.sizes[0])
                                )
                              }
                              data-overlay-control="true"
                              className="w-full rounded-md px-3 py-2 text-sm font-body font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                              {String(product.sizes[0])}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="start"
                            sideOffset={8}
                            className="max-w-[340px] text-sm bg-black/85 border-white/10 shadow-xl py-2 px-0"
                          >
                            <div className="flex items-start gap-4 pr-3 pl-0">
                              {/* Hanger icon, pegado a la izquierda */}
                              <img
                                src="/icons/checkroom_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg"
                                alt="Guía de talles"
                                width={16}
                                height={16}
                                className="opacity-95 shrink-0"
                              />
                              <div className="leading-snug opacity-90 text-sm">
                                {formatSizeTooltip(String(product.sizes[0]))}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        product.sizes.map((size) => (
                          <Tooltip key={size}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleAddToCartWithSize(e, size)
                                }
                                data-overlay-control="true"
                                className="min-w-8 rounded-md px-2 py-1 text-sm font-body font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                              >
                                {size}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              align="start"
                              sideOffset={8}
                              className="max-w-[340px] text-sm bg-black/85 border-white/10 shadow-xl py-2 px-0"
                            >
                              <div className="flex items-start gap-4 pr-3 pl-0">
                                {/* Hanger icon, pegado a la izquierda */}
                                <img
                                  src="/icons/checkroom_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg"
                                  alt="Guía de talles"
                                  width={16}
                                  height={16}
                                  className="opacity-95 shrink-0"
                                />
                                <div className="leading-snug opacity-90 text-sm">
                                  {formatSizeTooltip(size)}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))
                      )}
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-heading font-medium text-sm line-clamp-2 transition-all group-hover:text-accent-brand group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]">
              {product.name}
            </h3>

            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground ml-1 font-body">
                  {formatRating(product.rating)} ({product.reviews})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold">
                {formatPrice(product.price, product.currency)}
              </span>

              {/* Color options */}
              <div className="flex space-x-1">
                {product.colors.slice(0, 3).map((color) => (
                  <div
                    key={color}
                    className="w-4 h-4 rounded-full border border-border"
                    style={{
                      backgroundColor:
                        color === 'black'
                          ? '#000'
                          : color === 'white'
                          ? '#fff'
                          : color === 'gray'
                          ? '#6b7280'
                          : color === 'navy'
                          ? '#1e3a8a'
                          : color,
                    }}
                  />
                ))}
                {product.colors.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{product.colors.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
