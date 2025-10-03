"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CreditCard, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/hooks/use-cart"
import { formatPrice, capitalize } from "@/lib/format"
import { computeShipping, computeTax } from "@/lib/checkout/totals"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/hooks/use-toast"
import PayWithMercadoPago from "@/components/checkout/pay-with-mercadopago"
import PayWithTransfer from "@/components/checkout/pay-with-transfer"
import { Checkbox } from "@/components/ui/checkbox"

const CHECKOUT_MODE = process.env.NEXT_PUBLIC_CHECKOUT_MODE || "mailto"

export default function CheckoutPage() {
  const { items, getTotalItems, getSubtotal, getDiscount, getSubtotalAfterDiscount, coupon, applyCoupon, removeCoupon } = useCart()
  const { t } = useI18n()
  const { toast } = useToast()
  const [shippingData, setShippingData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dni: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "AR", // default Argentina
  })
  const [newsletterOptIn, setNewsletterOptIn] = React.useState<boolean>(false)
  const [paymentMethod, setPaymentMethod] = React.useState<"card" | "transfer">("card")
  const [couponCode, setCouponCode] = React.useState("")


  const totalItems = getTotalItems()
  const subtotal = getSubtotal()
  const discount = getDiscount()
  const discountedSubtotal = getSubtotalAfterDiscount()
  // Location-aware shipping: Mar del Plata 10k, otherwise 8k. Free over 100k.
  const isMarDelPlata = (shippingData.city || "").trim().toLowerCase().includes("mar del plata")
  const estimatedShipping = computeShipping(discountedSubtotal, {
    flat_rate: isMarDelPlata ? 10000 : 8000,
    free_threshold: 100000,
  })
  // Tax only applies to card payments (Mercado Pago), not to bank transfers
  const estimatedTax = paymentMethod === "card" 
    ? computeTax(Number((discountedSubtotal + estimatedShipping).toFixed(2)))
    : 0
  const finalTotal = discountedSubtotal + estimatedShipping + estimatedTax

  const handleInputChange = (field: string, value: string) => {
    setShippingData((prev) => ({ ...prev, [field]: value }))
  }

  // Validar que todos los campos requeridos estén completos
  const isFormValid = () => {
    return (
      shippingData.firstName.trim() !== "" &&
      shippingData.lastName.trim() !== "" &&
      shippingData.email.trim() !== "" &&
      shippingData.phone.trim() !== "" &&
      shippingData.dni.trim() !== "" &&
      shippingData.address.trim() !== "" &&
      shippingData.city.trim() !== "" &&
      shippingData.state.trim() !== "" &&
      shippingData.zipCode.trim() !== ""
    )
  }



  if (items.length === 0) {
    return (
      <div className="container px-4 py-16 pt-28 font-body">
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
    <div className="container px-4 py-8 pt-28 font-body">
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
                  <Label htmlFor="dni" className="font-body">DNI</Label>
                  <Input
                    id="dni"
                    inputMode="numeric"
                    value={shippingData.dni}
                    onChange={(e) => handleInputChange("dni", e.target.value)}
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
                  {/* Country removed: default to Argentina */}
                  <div className="hidden">
                    <Label htmlFor="country" className="font-body">{t("checkout.fields.country")}</Label>
                    <Input id="country" value={shippingData.country} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Método de pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "card" | "transfer")}>
                  <Label 
                    htmlFor="card" 
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "card" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">Tarjeta de crédito/débito</div>
                      <div className="text-xs text-muted-foreground">Pago seguro con Mercado Pago</div>
                    </div>
                  </Label>

                  <Label 
                    htmlFor="transfer" 
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "transfer" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Mail className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">Transferencia bancaria</div>
                      <div className="text-xs text-muted-foreground">Sin impuesto online (10% menos)</div>
                    </div>
                  </Label>
                </RadioGroup>

                <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground font-body">
                  {paymentMethod === "card" && (
                    <p>Serás redirigido a Mercado Pago para completar el pago de forma segura. Se aplica un impuesto online del 10%.</p>
                  )}
                  {paymentMethod === "transfer" && (
                    <p>Recibirás los datos bancarios para realizar la transferencia. Tu pedido se confirmará una vez que verifiquemos el pago (24-48hs).</p>
                  )}
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
                          src={item.product.images[0] || "/busy-streetwear.png"}
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
                      <Button
                        variant="secondary"
                        onClick={() => {
                          removeCoupon()
                          toast({ title: "Cupón removido", description: "Se quitó el descuento." })
                        }}
                      >
                        {t("cart.coupon.remove")}
                      </Button>
                    ) : (
                      <Button
                        onClick={async () => {
                          const res = await applyCoupon(couponCode.trim())
                          if (!res.ok) {
                            toast({
                              title: "Cupón inválido",
                              description: "Revisá el código e intentá de nuevo.",
                              variant: "destructive",
                            })
                          } else {
                            toast({
                              title: "¡Cupón aplicado! ",
                              description: `Se aplicó ${couponCode.toUpperCase()}. Disfrutá el descuento.`,
                            })
                          }
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
                  {paymentMethod === "card" && estimatedTax > 0 && (
                    <div className="flex justify-between">
                      <span>Impuesto online (10%)</span>
                      <span>{formatPrice(estimatedTax)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{t("checkout.summary.total")}</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Newsletter opt-in */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="newsletter" checked={newsletterOptIn} onCheckedChange={(v) => setNewsletterOptIn(Boolean(v))} />
                  <Label htmlFor="newsletter" className="font-body">Quiero recibir novedades por email</Label>
                </div>

                {/* Validation Warning */}
                {!isFormValid() && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-600 dark:text-yellow-500">
                    ⚠️ Por favor completá todos los campos de envío para continuar
                  </div>
                )}

                {/* Payment Button */}
                {paymentMethod === "card" ? (
                  <PayWithMercadoPago
                    items={items.map((it) => ({ product_id: it.product.id, quantity: it.quantity, variant_size: it.selectedSize }))}
                    couponCode={coupon?.code ?? null}
                    shippingCost={estimatedShipping}
                    disabled={!isFormValid()}
                    customer={{
                      first_name: shippingData.firstName,
                      last_name: shippingData.lastName,
                      email: shippingData.email,
                      phone: shippingData.phone,
                      dni: shippingData.dni,
                      address: shippingData.address,
                      city: shippingData.city,
                      state: shippingData.state,
                      zip: shippingData.zipCode,
                    }}
                    newsletterOptIn={newsletterOptIn}
                    buttonText="Pagar con Mercado Pago"
                  />
                ) : (
                  <PayWithTransfer
                    items={items.map((it) => ({ product_id: it.product.id, quantity: it.quantity, variant_size: it.selectedSize }))}
                    couponCode={coupon?.code ?? null}
                    shippingCost={estimatedShipping}
                    disabled={!isFormValid()}
                    customer={{
                      first_name: shippingData.firstName,
                      last_name: shippingData.lastName,
                      email: shippingData.email,
                      phone: shippingData.phone,
                      dni: shippingData.dni,
                      address: shippingData.address,
                      city: shippingData.city,
                      state: shippingData.state,
                      zip: shippingData.zipCode,
                    }}
                    newsletterOptIn={newsletterOptIn}
                  />
                )}

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
