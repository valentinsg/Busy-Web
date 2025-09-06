"use client"

import type * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Plus, Minus, ShoppingBag } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCart } from "@/hooks/use-cart"
import { formatPrice, capitalize } from "@/lib/format"
import { useI18n } from "@/components/i18n-provider"

interface CartSheetProps {
  children: React.ReactNode
}

export function CartSheet({ children }: CartSheetProps) {
  const { items, isOpen, openCart, closeCart, removeItem, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart()
  const { t } = useI18n()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()
  const estimatedShipping = totalPrice > 100 ? 0 : 9.99
  const estimatedTax = totalPrice * 0.08 // 8% tax placeholder
  const finalTotal = totalPrice + estimatedShipping + estimatedTax

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{t("cart.title")} ({totalItems})</span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-muted-foreground hover:text-destructive"
                aria-label={t("cart.clear_all")}
                title={t("cart.clear_all")}
                data-label={t("cart.clear_all")}
              >
                {t("cart.clear_all")}
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-medium mb-2">{t("cart.empty.title")}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t("cart.empty.subtitle")}</p>
              <Button asChild onClick={closeCart} aria-label={t("cart.empty.cta")} title={t("cart.empty.cta")} data-label={t("cart.empty.cta")}>
                <Link href="/products">{t("cart.empty.cta")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Cart Items */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex space-x-4">
                    <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden">
                      <Image
                        src={item.product.images[0] || "/placeholder.svg?height=64&width=64&query=product"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{capitalize(item.selectedColor)}</span>
                        <span>•</span>
                        <span>{item.selectedSize}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{formatPrice(item.product.price)}</span>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor)
                            }
                            aria-label={t("cart.qty.decrease")}
                            title={t("cart.qty.decrease")}
                            data-label={t("cart.qty.decrease")}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)
                            }
                            disabled={item.quantity >= item.product.stock}
                            aria-label={t("cart.qty.increase")}
                            title={t("cart.qty.increase")}
                            data-label={t("cart.qty.increase")}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                      aria-label={t("cart.remove_item")}
                      title={t("cart.remove_item")}
                      data-label={t("cart.remove_item")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t("cart.subtotal")}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("cart.shipping")}</span>
                  <span>{estimatedShipping === 0 ? t("cart.shipping_free") : formatPrice(estimatedShipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("cart.tax")}</span>
                  <span>{formatPrice(estimatedTax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>{t("cart.total")}</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2">
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout" onClick={closeCart} aria-label={t("cart.checkout")} title={t("cart.checkout")} data-label={t("cart.checkout")}>
                    {t("cart.checkout")}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/cart" onClick={closeCart} aria-label={t("cart.view_cart")} title={t("cart.view_cart")} data-label={t("cart.view_cart")}>
                    {t("cart.view_cart")}
                  </Link>
                </Button>
              </div>

              {/* Free Shipping Notice */}
              {totalPrice < 100 && (
                <div className="text-xs text-center text-muted-foreground">
                  {t("cart.free_shipping_notice").replace("{amount}", formatPrice(100 - totalPrice))}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
