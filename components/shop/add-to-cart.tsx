"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/hooks/use-cart"
import { useTranslations } from "@/hooks/use-translations"
import { capitalize } from "@/lib/format"
import type { Product } from "@/types"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import * as React from "react"

interface AddToCartProps {
  product: Product
  className?: string
  sizeLabel?: string
}

export function AddToCart({ product, className = "", sizeLabel }: AddToCartProps) {
  const t = useTranslations('product')
  const [selectedSize, setSelectedSize] = React.useState(product.sizes[0])
  const [selectedColor, setSelectedColor] = React.useState(product.colors[0])
  const [quantity, setQuantity] = React.useState(1)

  const { addItem, getItemCount, openCart } = useCart()

  // Determine label based on product type or use provided sizeLabel
  const effectiveSizeLabel = sizeLabel || (product.tags?.includes('pin') || product.tags?.includes('accessory') ? t('type') : t('size'))

  const currentItemCount = getItemCount(product.id, selectedSize, selectedColor)

  const handleAddToCart = () => {
    addItem(product, selectedSize, selectedColor, quantity)
    try {
      if (typeof window !== "undefined") {
        const w = window as Window & { dataLayer?: unknown[] }
        if (Array.isArray(w.dataLayer)) {
          w.dataLayer.push({
          event: "add_to_cart",
          ecommerce: {
            currency: product.currency || "ARS",
            value: Number((product.price * quantity).toFixed(2)),
            items: [
              {
                item_id: product.id,
                item_name: product.name,
                item_category: product.category,
                price: product.price,
                quantity,
                item_variant: `${selectedSize}|${selectedColor}`,
              },
            ],
          },
        })
        }
      }
    } catch {}
    openCart()
  }

  const getSizeStock = React.useCallback(
    (size: string) => {
      if (product.stockBySize && Object.keys(product.stockBySize).length > 0) {
        return product.stockBySize[size] ?? 0
      }
      return product.stock
    },
    [product.stockBySize, product.stock],
  )

  const sizeStock = getSizeStock(selectedSize)

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, sizeStock))
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  const isOutOfStock = sizeStock === 0
  const isLowStock = sizeStock < 4 && sizeStock > 0

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Size Selection */}
      {product.sizes.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">{effectiveSizeLabel}</label>
          <Select
            value={selectedSize}
            onValueChange={(value) => {
              setSelectedSize(value)
              setQuantity(1)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {product.sizes.map((size) => {
                const s = getSizeStock(size)
                const disabled = s === 0
                return (
                  <SelectItem key={size} value={size} disabled={disabled}>
                    {size}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Color Selection */}
      {product.colors.length > 1 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('color')}</label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md border transition-colors ${
                  selectedColor === color
                    ? "border-accent-brand bg-accent-brand/10"
                    : "border-border hover:border-accent-brand/50"
                }`}
              >
                <div
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
                <span className="text-sm">{capitalize(color)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('quantity')}</label>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button variant="outline" size="icon" onClick={incrementQuantity} disabled={quantity >= sizeStock}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stock Status */}
      {isLowStock && (
        <Badge variant="destructive" className="w-fit">
          Últimas Unidades
        </Badge>
      )}

      {/* Current Cart Count */}
      {currentItemCount > 0 && <div className="text-sm text-muted-foreground">{currentItemCount} {t('in_cart')}</div>}

      {/* Add to Cart Button */}
      <Button onClick={handleAddToCart} disabled={isOutOfStock} className="w-full" size="lg">
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isOutOfStock ? t('out_of_stock') : t('add_to_cart')}
      </Button>
    </div>
  )
}
