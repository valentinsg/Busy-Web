"use client"

import * as React from "react"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { useCart } from "@/hooks/use-cart"
import { capitalize } from "@/lib/format"

interface AddToCartProps {
  product: Product
  className?: string
  sizeLabel?: string
}

export function AddToCart({ product, className = "", sizeLabel = "Size" }: AddToCartProps) {
  const [selectedSize, setSelectedSize] = React.useState(product.sizes[0])
  const [selectedColor, setSelectedColor] = React.useState(product.colors[0])
  const [quantity, setQuantity] = React.useState(1)

  const { addItem, getItemCount, openCart } = useCart()

  const currentItemCount = getItemCount(product.id, selectedSize, selectedColor)

  const handleAddToCart = () => {
    addItem(product, selectedSize, selectedColor, quantity)
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
  const isLowStock = sizeStock < 10 && sizeStock > 0

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Size Selection */}
      {product.sizes.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">{sizeLabel}</label>
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
            <SelectContent>
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
          <label className="text-sm font-medium">Color</label>
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
        <label className="text-sm font-medium">Quantity</label>
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
          Only {sizeStock} left in stock
        </Badge>
      )}

      {/* Current Cart Count */}
      {currentItemCount > 0 && <div className="text-sm text-muted-foreground">{currentItemCount} in cart</div>}

      {/* Add to Cart Button */}
      <Button onClick={handleAddToCart} disabled={isOutOfStock} className="w-full" size="lg">
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  )
}
