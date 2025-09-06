"use client"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Plus, Minus, X, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { formatPrice, capitalize } from "@/lib/format"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()
  const estimatedShipping = totalPrice > 100 ? 0 : 9.99
  const estimatedTax = totalPrice * 0.08 // 8% tax placeholder
  const finalTotal = totalPrice + estimatedShipping + estimatedTax

  if (items.length === 0) {
    return (
      <div className="container px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-heading text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
          </p>
          <Button asChild size="lg">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <h1 className="font-heading text-3xl font-bold">Shopping Cart ({totalItems} items)</h1>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-destructive hover:text-destructive bg-transparent"
            >
              Clear Cart
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}>
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden">
                      <Image
                        src={item.product.images[0] || "/placeholder.svg?height=96&width=96&query=product"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{item.product.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                            <span>{capitalize(item.selectedColor)}</span>
                            <span>•</span>
                            <span>{item.selectedSize}</span>
                            <span>•</span>
                            <span>SKU: {item.product.sku}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)
                            }
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold">{formatPrice(item.product.price * item.quantity)}</div>
                          <div className="text-sm text-muted-foreground">{formatPrice(item.product.price)} each</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{estimatedShipping === 0 ? "Free" : formatPrice(estimatedShipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (estimated)</span>
                    <span>{formatPrice(estimatedTax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>

                {/* Free Shipping Notice */}
                {totalPrice < 100 && (
                  <div className="text-sm text-center text-muted-foreground p-3 bg-muted rounded-lg">
                    Add {formatPrice(100 - totalPrice)} more for free shipping
                  </div>
                )}

                {/* Security Notice */}
                <div className="text-xs text-center text-muted-foreground">Secure checkout with SSL encryption</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
