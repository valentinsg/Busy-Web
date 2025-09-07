"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CreditCard, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/hooks/use-cart"
import { formatPrice, capitalize } from "@/lib/format"
import { useI18n } from "@/components/i18n-provider"

const CHECKOUT_MODE = process.env.NEXT_PUBLIC_CHECKOUT_MODE || "mailto"

export default function CheckoutPage() {
  const { items, getTotalItems, getSubtotal, getDiscount, getSubtotalAfterDiscount, coupon, applyCoupon, removeCoupon, clearCart } = useCart()
  const { t } = useI18n()
  const [shippingData, setShippingData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  })
  const [paymentMethod, setPaymentMethod] = React.useState("card")

  const totalItems = getTotalItems()
  const subtotal = getSubtotal()
  const discount = getDiscount()
  const discountedSubtotal = getSubtotalAfterDiscount()
  const estimatedShipping = discountedSubtotal > 100 ? 0 : 9.99
  const estimatedTax = discountedSubtotal * 0.08
  const finalTotal = discountedSubtotal + estimatedShipping + estimatedTax
  const [couponCode, setCouponCode] = React.useState("")

  const handleInputChange = (field: string, value: string) => {
    setShippingData((prev) => ({ ...prev, [field]: value }))
  }

  const generateOrderSummary = () => {
    const orderItems = items
      .map(
        (item) =>
          `${item.product.name} (${capitalize(item.selectedColor)}, ${item.selectedSize}) x${item.quantity} - ${formatPrice(item.product.price * item.quantity)}`,
      )
      .join("\n")

    return `
Order Summary:
${orderItems}

Subtotal: ${formatPrice(subtotal)}
${discount > 0 ? `Discount (${coupon?.code ?? ""}): -${formatPrice(discount)}` : ""}
Subtotal after discount: ${formatPrice(discountedSubtotal)}
Shipping: ${estimatedShipping === 0 ? "Free" : formatPrice(estimatedShipping)}
Tax: ${formatPrice(estimatedTax)}
Total: ${formatPrice(finalTotal)}

Shipping Address:
${shippingData.firstName} ${shippingData.lastName}
${shippingData.address}
${shippingData.city}, ${shippingData.state} ${shippingData.zipCode}
${shippingData.country}

Email: ${shippingData.email}
Phone: ${shippingData.phone}
`.trim()
  }

  const handleCheckout = () => {
    const orderSummary = generateOrderSummary()

    switch (CHECKOUT_MODE) {
      case "whatsapp":
        const whatsappMessage = encodeURIComponent(`Hi! I'd like to place an order:\n\n${orderSummary}`)
        window.open(`https://wa.me/1234567890?text=${whatsappMessage}`, "_blank")
        break

      case "mailto":
        const emailSubject = encodeURIComponent("New Order from Busy Store")
        const emailBody = encodeURIComponent(orderSummary)
        window.location.href = `mailto:orders@busy.com?subject=${emailSubject}&body=${emailBody}`
        break

      case "stripe-test":
        // Placeholder for Stripe integration
        alert("Stripe integration would be implemented here")
        break

      default:
        alert("Checkout method not configured")
    }

    // Clear cart after successful checkout
    clearCart()
  }

  if (items.length === 0) {
    return (
      <div className="container px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">{t("checkout.empty.title")}</h1>
          <p className="font-body text-muted-foreground mb-8">
            {t("checkout.empty.subtitle")}
          </p>
          <Button asChild size="lg">
            <Link href="/products">{t("checkout.empty.cta")}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("checkout.header.back")}
            </Link>
          </Button>
          <h1 className="font-heading text-3xl font-bold">{t("checkout.header.title")}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">{t("checkout.shipping.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="font-body">{t("checkout.fields.first_name")}</Label>
                    <Input
                      id="firstName"
                      value={shippingData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="font-body">{t("checkout.fields.last_name")}</Label>
                    <Input
                      id="lastName"
                      value={shippingData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="font-body">{t("checkout.fields.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="font-body">{t("checkout.fields.phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="font-body">{t("checkout.fields.address")}</Label>
                  <Input
                    id="address"
                    value={shippingData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="font-body">{t("checkout.fields.city")}</Label>
                    <Input
                      id="city"
                      value={shippingData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="font-body">{t("checkout.fields.state")}</Label>
                    <Input
                      id="state"
                      value={shippingData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode" className="font-body">{t("checkout.fields.zip")}</Label>
                    <Input
                      id="zipCode"
                      value={shippingData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="font-body">{t("checkout.fields.country")}</Label>
                    <Select value={shippingData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">{t("checkout.countries.US")}</SelectItem>
                        <SelectItem value="CA">{t("checkout.countries.CA")}</SelectItem>
                        <SelectItem value="MX">{t("checkout.countries.MX")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">{t("checkout.payment.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {CHECKOUT_MODE === "stripe-test" && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="font-body flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>{t("checkout.payment.options.card")}</span>
                      </Label>
                    </div>
                  )}

                  {CHECKOUT_MODE === "mailto" && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email" className="font-body flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{t("checkout.payment.options.email")}</span>
                      </Label>
                    </div>
                  )}

                  {CHECKOUT_MODE === "whatsapp" && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="whatsapp" id="whatsapp" />
                      <Label htmlFor="whatsapp" className="font-body flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>{t("checkout.payment.options.whatsapp")}</span>
                      </Label>
                    </div>
                  )}
                </RadioGroup>

                <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground font-body">
                  {CHECKOUT_MODE === "mailto" && t("checkout.payment.notice.mailto")}
                  {CHECKOUT_MODE === "whatsapp" && t("checkout.payment.notice.whatsapp")}
                  {CHECKOUT_MODE === "stripe-test" && t("checkout.payment.notice.stripe")}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-heading">{t("checkout.summary.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex space-x-3"
                    >
                      <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden">
                        <Image
                          src={item.product.images[0] || "/placeholder.svg?height=64&width=64&query=product"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                        <div className="text-xs text-muted-foreground">
                          {capitalize(item.selectedColor)} • {item.selectedSize} • Qty: {item.quantity}
                        </div>
                        <div className="font-medium text-sm">{formatPrice(item.product.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

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

                {/* Pricing Breakdown */}
                <div className="space-y-2 font-body">
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

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={
                    !shippingData.firstName || !shippingData.lastName || !shippingData.email || !shippingData.address
                  }
                >
                  {CHECKOUT_MODE === "whatsapp" && t("checkout.cta.complete.whatsapp")}
                  {CHECKOUT_MODE === "mailto" && t("checkout.cta.complete.mailto")}
                  {CHECKOUT_MODE === "stripe-test" && t("checkout.cta.complete.stripe")}
                </Button>

                {/* Security Notice */}
                <div className="font-body text-xs text-center text-muted-foreground">
                  {t("checkout.security_notice")}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
