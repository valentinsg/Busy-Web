"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Star, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { formatPrice, formatRating } from "@/lib/format"
import { useCart } from "@/hooks/use-cart"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
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

  const handleAddToCartWithSize = (_e: React.SyntheticEvent | undefined, size: string) => {
    // Use first available color by default for quick add
    const defaultColor = product.colors[0]
    addItem(product, size, defaultColor, 1)
    openCart()
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300">
      <div
        role="link"
        tabIndex={0}
        aria-disabled={isHovered}
        className="cursor-pointer"
        onClick={(e) => {
          const target = e.target as Node
          if (overlayRef.current && overlayRef.current.contains(target)) {
            // Click originated within overlay, never navigate
            e.preventDefault()
            e.stopPropagation()
            return
          }
          if (isHovered) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
          router.push(`/product/${product.id}`)
        }}
        onKeyDown={(e) => {
          if (isHovered) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              e.stopPropagation()
            }
            return
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            router.push(`/product/${product.id}`)
          }
        }}
      >
        <div
          className="relative aspect-square overflow-hidden bg-muted"
          onPointerEnter={handleMouseEnter}
          onPointerLeave={handleMouseLeave}
        >
          <Image
            src={product.images[currentImageIndex] || "/placeholder.svg?height=400&width=400&query=hoodie"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Stock badge */}
          {product.stock < 10 && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Only {product.stock} left
            </Badge>
          )}

          {/* Sizes overlay on hover (blocks link clicks) */}
          {product.sizes?.length > 0 && (
            <div
              ref={overlayRef}
              className={`absolute inset-0 z-10 ${isHovered ? "pointer-events-auto cursor-default" : "pointer-events-none"}`}
              onClick={(e) => {
                // Stop clicks on the overlay background from bubbling to parent navigations,
                // but allow clicks on inner controls (buttons) to run first.
                if (e.target === e.currentTarget) {
                  e.stopPropagation()
                }
              }}
              onPointerEnter={() => setIsHovered(true)}
              onPointerLeave={() => setIsHovered(false)}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                  e.stopPropagation()
                }
              }}
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) {
                  e.stopPropagation()
                }
              }}
              onTouchStart={(e) => {
                // Prevent accidental background taps from triggering parent navigation on mobile
                if (e.target === (e.currentTarget as EventTarget)) {
                  e.stopPropagation()
                }
              }}
            >
              <div className={`absolute inset-x-0 bottom-0 ${isHovered ? "translate-y-0" : "translate-y-full"} transition-transform duration-300`}>
                <div className="pointer-events-auto mb-2 rounded-xl mx-auto w-3/4 border border-[rgba(255,255,255,0.06)] bg-[rgba(155,155,155,0.06)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl backdrop-saturate-120">
                  <TooltipProvider disableHoverableContent>
                    <div className="flex flex-wrap gap-2 items-center justify-center">
                      {product.sizes.map((size) => (
                        <Tooltip key={size}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => handleAddToCartWithSize(e, size)}
                              className="min-w-8 rounded-md px-2 py-1 text-xs font-body font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                              {size}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {"Medidas"} //aca irian las medidas
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-heading font-medium text-sm line-clamp-2 transition-all group-hover:text-accent-brand group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]">
              {product.name}
            </h3>

            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground ml-1">
                  {formatRating(product.rating)} ({product.reviews})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold">{formatPrice(product.price, product.currency)}</span>

              {/* Color options */}
              <div className="flex space-x-1">
                {product.colors.slice(0, 3).map((color) => (
                  <div
                    key={color}
                    className="w-4 h-4 rounded-full border border-border"
                    style={{
                      backgroundColor:
                        color === "black"
                          ? "#000"
                          : color === "white"
                            ? "#fff"
                            : color === "gray"
                              ? "#6b7280"
                              : color === "navy"
                                ? "#1e3a8a"
                                : color,
                    }}
                  />
                ))}
                {product.colors.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{product.colors.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

