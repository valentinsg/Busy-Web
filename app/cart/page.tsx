"use client"
import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Plus, Minus, X, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { formatPrice, capitalize } from "@/lib/format"
import { useI18n } from "@/components/i18n-provider"
import { Input } from "@/components/ui/input"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalItems, getSubtotal, getDiscount, getSubtotalAfterDiscount, coupon, applyCoupon, removeCoupon, clearCart } = useCart()
  const { t } = useI18n()
  // Hydration guard: avoid SSR/CSR mismatch
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const totalItems = mounted ? getTotalItems() : 0
  const subtotal = mounted ? getSubtotal() : 0
  const discount = mounted ? getDiscount() : 0
  const discountedSubtotal = mounted ? getSubtotalAfterDiscount() : 0
  const estimatedShipping = discountedSubtotal > 100 ? 0 : 9.99
  const estimatedTax = discountedSubtotal * 0.08 // 8% tax placeholder
  const finalTotal = discountedSubtotal + estimatedShipping + estimatedTax
  const itemsForRender = mounted ? items : []
  const [couponCode, setCouponCode] = React.useState("")

  if (itemsForRender.length === 0) {
    return (
      <div className="container px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-heading text-3xl font-bold mb-4">{t("cart.empty.title")}</h1>
          <p className="font-body text-muted-foreground mb-8">{t("cart.empty.subtitle")}</p>
          <Button asChild size="lg">
            <Link href="/products">{t("cart.empty.cta")}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("cart.empty.cta")}
              </Link>
            </Button>
            <h1 className="font-heading text-3xl font-bold">{t("cart.title")} ({totalItems})</h1>
          </div>
          {itemsForRender.length > 0 && (
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-destructive hover:text-destructive bg-transparent"
            >
              {t("cart.clear_all")}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {itemsForRender.map((item) => (
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
                          <div className="font-body text-sm text-muted-foreground">{formatPrice(item.product.price)}</div>
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
                <CardTitle className="font-heading">{t("checkout.summary.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={t("cart.coupon.placeholder")}
                      aria-label={t("cart.coupon.placeholder")}
                    />
                    {coupon ? (
                      <Button variant="secondary" onClick={() => removeCoupon()}>
                        {t("cart.coupon.remove")}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          const res = applyCoupon(couponCode)
                          if (!res.ok) alert(t("cart.coupon.invalid"))
                        }}
                      >
                        {t("cart.coupon.apply")}
                      </Button>
                    )}
                  </div>
                  {coupon && (
                    <div className="text-xs text-muted-foreground font-body">
                      {t("cart.coupon.applied").replace("{code}", coupon.code).replace("{percent}", String(coupon.percent))}
                    </div>
                  )}
                </div>

                <div className="font-body space-y-2">
                  <div className="flex justify-between">
                    <span>{t("checkout.summary.subtotal_items").replace("{count}", String(totalItems))}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>{t("cart.coupon.discount")}</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t("cart.subtotal_after_discount")}</span>
                    <span>{formatPrice(discountedSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("checkout.summary.shipping")}</span>
                    <span>{estimatedShipping === 0 ? t("cart.shipping_free") : formatPrice(estimatedShipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("checkout.summary.tax")}</span>
                    <span>{formatPrice(estimatedTax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{t("checkout.summary.total")}</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">{t("cart.checkout")}</Link>
                </Button>

                {/* Free Shipping Notice */}
                {discountedSubtotal < 100 && (
                  <div className="font-body text-sm text-center text-muted-foreground p-3 bg-muted rounded-lg">
                    {t("cart.free_shipping_notice").replace("{amount}", formatPrice(100 - discountedSubtotal))}
                  </div>
                )}

                {/* Security Notice */}
                <div className="font-body text-xs text-center text-muted-foreground">{t("checkout.security_notice")}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
