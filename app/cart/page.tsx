"use client"
import { useI18n } from "@/components/providers/i18n-provider"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { computeShipping, computeTax } from "@/lib/checkout/totals"
import { capitalize, formatPrice } from "@/lib/format"
import { ArrowLeft, Minus, Plus, ShoppingBag, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalItems, getSubtotal, clearCart } = useCart()
  const { t } = useI18n()
  const router = useRouter()
  // Hydration guard: avoid SSR/CSR mismatch
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const totalItems = mounted ? getTotalItems() : 0
  const subtotal = mounted ? getSubtotal() : 0
  const [freeThreshold, setFreeThreshold] = React.useState<number>(100000)
  const [flatRate, setFlatRate] = React.useState<number>(25000)
  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { getSettingsClient } = await import('@/lib/repo/settings')
        const s = await getSettingsClient()
        if (!cancelled) {
          setFreeThreshold(Number(s.shipping_free_threshold ?? 100000))
          setFlatRate(Number(s.shipping_flat_rate ?? 25000))
        }
      } catch {
        // ignore
      }
    })()
    return () => { cancelled = true }
  }, [])
  const estimatedShipping = computeShipping(subtotal, { flat_rate: flatRate, free_threshold: freeThreshold })
  const estimatedTax = computeTax(Number((subtotal + estimatedShipping).toFixed(2)))
  const finalTotal = subtotal + estimatedShipping + estimatedTax
  const itemsForRender = mounted ? items : []

  // If the cart is empty, redirect to products after 3 seconds
  React.useEffect(() => {
    if (mounted && itemsForRender.length === 0) {
      const id = setTimeout(() => router.push('/products'), 3000)
      return () => clearTimeout(id)
    }
  }, [mounted, itemsForRender.length, router])

  const getSizeStock = (p: typeof itemsForRender[number]) => {
    const stockBy = p.product.stockBySize
    if (stockBy && Object.keys(stockBy).length > 0) {
      return stockBy[p.selectedSize] ?? 0
    }
    return p.product.stock
  }

  if (itemsForRender.length === 0) {
    return (
      <div className="container px-4 min-h-[60vh] flex items-center justify-center font-body">
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
    <div className="container px-4 py-8 pt-28 font-body">
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive bg-transparent"
                >
                  {t("cart.clear_all")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("cart.clear_all")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("cart.empty.subtitle")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={clearCart}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
                        src={item.product.images[0] || "/busy-streetwear.png"}
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Querés eliminar este producto del carrito?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                            disabled={item.quantity >= getSizeStock(item)}
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
                <div className="font-body space-y-2">
                  <div className="flex justify-between">
                    <span>{t("checkout.summary.subtotal_items").replace("{count}", String(totalItems))}</span>
                    <span>{formatPrice(subtotal)}</span>
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

                {subtotal < freeThreshold && (
                  <div className="font-body text-sm text-center text-muted-foreground p-3 bg-muted rounded-lg">
                    {t("cart.free_shipping_notice").replace("{amount}", formatPrice(freeThreshold - subtotal))}
                  </div>
                )}

                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">{t("cart.checkout")}</Link>
                </Button>


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
