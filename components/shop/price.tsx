import { formatPrice } from "@/lib/format"

interface PriceProps {
  price: number
  currency?: string
  originalPrice?: number
  className?: string
}

export function Price({ price, currency = "USD", originalPrice, className = "" }: PriceProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="font-semibold text-lg">{formatPrice(price, currency)}</span>
      {originalPrice && originalPrice > price && (
        <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice, currency)}</span>
      )}
    </div>
  )
}
