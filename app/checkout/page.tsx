"use client"

import PayWithMercadoPago from "@/components/checkout/pay-with-mercadopago"
import PayWithTransfer from "@/components/checkout/pay-with-transfer"
import { useChristmas } from "@/components/providers/christmas-provider"
import { useI18n } from "@/components/providers/i18n-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { trackBeginCheckout } from "@/lib/analytics/ecommerce"
import { computeShipping, computeTax } from "@/lib/checkout/totals"
import { capitalize, formatPrice } from "@/lib/format"
import { getSettingsClient } from "@/lib/repo/settings"
import { getProvinceFromPostalCode, isMarDelPlataPostalCode, isPostalCodeValidForProvince } from "@/lib/shipping/postal-codes"
import { AlertTriangle, ArrowLeft, CreditCard, Gift, Loader2, Mail, Package, Truck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"

// Provincias de Argentina
const ARGENTINA_PROVINCES = [
  { code: "BA", name: "Buenos Aires" },
  { code: "CABA", name: "Ciudad Autónoma de Buenos Aires" },
  { code: "CAT", name: "Catamarca" },
  { code: "CHA", name: "Chaco" },
  { code: "CHU", name: "Chubut" },
  { code: "COR", name: "Córdoba" },
  { code: "CRR", name: "Corrientes" },
  { code: "ER", name: "Entre Ríos" },
  { code: "FOR", name: "Formosa" },
  { code: "JUJ", name: "Jujuy" },
  { code: "LP", name: "La Pampa" },
  { code: "LR", name: "La Rioja" },
  { code: "MZA", name: "Mendoza" },
  { code: "MIS", name: "Misiones" },
  { code: "NQN", name: "Neuquén" },
  { code: "RN", name: "Río Negro" },
  { code: "SAL", name: "Salta" },
  { code: "SJ", name: "San Juan" },
  { code: "SL", name: "San Luis" },
  { code: "SC", name: "Santa Cruz" },
  { code: "SF", name: "Santa Fe" },
  { code: "SE", name: "Santiago del Estero" },
  { code: "TDF", name: "Tierra del Fuego" },
  { code: "TUC", name: "Tucumán" },
]

// Shipping option type from Envia
type ShippingOption = {
  carrier: string
  service: string
  serviceName: string
  price: number
  currency: string
  estimatedDelivery: string | null
  logo?: string
}

export default function CheckoutPage() {
  const { items, getTotalItems, getSubtotal, getPromoDiscount, getAppliedPromos, getDiscount, getSubtotalAfterDiscount, coupon, applyCoupon, removeCoupon } = useCart()
  const { t } = useI18n()
  const { toast } = useToast()
  const { isChristmasMode } = useChristmas()
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

  // Envia shipping options
  const [shippingOptions, setShippingOptions] = React.useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = React.useState<ShippingOption | null>(null)
  const [loadingShipping, setLoadingShipping] = React.useState(false)
  const [shippingError, setShippingError] = React.useState<string | null>(null)
  const [shippingSource, setShippingSource] = React.useState<"envia" | "fallback" | null>(null)


  const totalItems = getTotalItems()
  const subtotal = getSubtotal()
  const promoDiscount = getPromoDiscount()
  const appliedPromos = getAppliedPromos()
  const discount = getDiscount()
  const discountedSubtotal = getSubtotalAfterDiscount()
  // Settings-based free shipping threshold + city-aware flat rate
  const [freeThreshold, setFreeThreshold] = React.useState<number>(100000)
  const [flatRate, setFlatRate] = React.useState<number>(25000)
  const [marDelPlataRate, setMarDelPlataRate] = React.useState<number>(10000)
  const [freeShippingEnabled, setFreeShippingEnabled] = React.useState<boolean>(false)
  const [freeShippingMessage, setFreeShippingMessage] = React.useState<string>("")

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await getSettingsClient()
        if (!cancelled) {
          setFreeThreshold(Number(s.shipping_free_threshold ?? 100000))
          setFlatRate(Number(s.shipping_flat_rate ?? 25000))
          setMarDelPlataRate(Number(s.mar_del_plata_rate ?? 10000))
          setFreeShippingEnabled(Boolean(s.free_shipping_enabled))
          setFreeShippingMessage(s.free_shipping_message || "Envío gratis en todas las compras")
        }
      } catch {
        // ignore
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Validación de código postal vs provincia
  const postalCodeMismatch = shippingData.state && shippingData.zipCode &&
    !isPostalCodeValidForProvince(shippingData.zipCode, shippingData.state)
  const suggestedProvince = postalCodeMismatch ? getProvinceFromPostalCode(shippingData.zipCode) : null

  // Mar del Plata: CP 7600-7613 Y provincia Buenos Aires (para evitar fraude)
  const isMarDelPlataCP = isMarDelPlataPostalCode(shippingData.zipCode)
  const isMarDelPlata = isMarDelPlataCP && shippingData.state === "Buenos Aires"

  // Check if free shipping applies (global toggle OR threshold reached OR Mar del Plata válido)
  const isFreeShipping = freeShippingEnabled || discountedSubtotal >= freeThreshold || isMarDelPlata

  // Use selected shipping option price, or fallback to flat rate
  const estimatedShipping = isFreeShipping
    ? 0
    : selectedShipping
      ? selectedShipping.price
      : computeShipping(discountedSubtotal, {
          flat_rate: isMarDelPlata ? marDelPlataRate : flatRate,
          free_threshold: freeThreshold,
        })

  // Fetch shipping options when address is complete
  const fetchShippingOptions = React.useCallback(async () => {
    // Need at least city and postal code
    if (!shippingData.city.trim() || !shippingData.zipCode.trim()) {
      return
    }

    setLoadingShipping(true)
    setShippingError(null)

    try {
      const response = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: {
            name: `${shippingData.firstName} ${shippingData.lastName}`.trim() || "Cliente",
            phone: shippingData.phone || "0000000000",
            street: shippingData.address || "Sin dirección",
            city: shippingData.city,
            state: shippingData.state || shippingData.city,
            postalCode: shippingData.zipCode,
            country: "AR",
          },
          items: items.map(it => ({
            product_id: it.product.id,
            quantity: it.quantity,
            weight: (it.product as { weight?: number }).weight,
            category: it.product.category,
          })),
          totalValue: discountedSubtotal,
          itemCount: getTotalItems(),
        }),
      })

      const data = await response.json()

      if (data.success && data.options && data.options.length > 0) {
        setShippingOptions(data.options)
        setShippingSource(data.source || "fallback")
        // Auto-select cheapest option
        const cheapest = data.options.reduce((min: ShippingOption, opt: ShippingOption) =>
          opt.price < min.price ? opt : min, data.options[0])
        setSelectedShipping(cheapest)
      } else {
        setShippingError(data.error || "No se encontraron opciones de envío")
        setShippingOptions([])
        setSelectedShipping(null)
      }
    } catch (err) {
      console.error("Error fetching shipping:", err)
      setShippingError("Error al calcular envío")
    } finally {
      setLoadingShipping(false)
    }
  }, [shippingData, items, discountedSubtotal, getTotalItems])

  // Debounce shipping fetch when address changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (shippingData.city && shippingData.zipCode) {
        fetchShippingOptions()
      }
    }, 800) // Wait 800ms after user stops typing

    return () => clearTimeout(timer)
  }, [shippingData.city, shippingData.zipCode, shippingData.state, fetchShippingOptions])
  // Tax only applies to card payments (Mercado Pago), not to bank transfers
  const estimatedTax = paymentMethod === "card"
    ? computeTax(Number((discountedSubtotal + estimatedShipping).toFixed(2)))
    : 0
  const finalTotal = discountedSubtotal + estimatedShipping + estimatedTax

  // Track begin_checkout once when arriving to checkout with items
  React.useEffect(() => {
    try {
      if (items.length > 0) {
        const currency = items[0]?.product?.currency || "ARS"
        const value = Number((discountedSubtotal + estimatedShipping + estimatedTax).toFixed(2))
        const mapped = items.map((it) => ({
          item_id: it.product.id,
          item_name: it.product.name,
          item_category: it.product.category,
          price: it.product.price,
          quantity: it.quantity,
          item_variant: `${it.selectedSize}|${it.selectedColor}`,
        }))
        trackBeginCheckout({ currency, value, items: mapped })
      }
    } catch {}
  }, [items, discountedSubtotal, estimatedShipping, estimatedTax])

  const handleInputChange = (field: string, value: string) => {
    setShippingData((prev) => ({ ...prev, [field]: value }))
  }

  // Validar que todos los campos requeridos estén completos Y que el CP coincida con la provincia
  const isFormValid = () => {
    const fieldsComplete = (
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
    // Bloquear si hay mismatch entre CP y provincia
    return fieldsComplete && !postalCodeMismatch
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

                <div>
                  <Label htmlFor="state" className="font-body">{t("checkout.fields.state")}</Label>
                  <Select
                    value={shippingData.state}
                    onValueChange={(value) => {
                      handleInputChange("state", value)
                      // Limpiar ciudad cuando cambia la provincia
                      handleInputChange("city", "")
                    }}
                  >
                    <SelectTrigger id="state" className="w-full">
                      <SelectValue placeholder="Seleccionar provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {ARGENTINA_PROVINCES.map((province) => (
                        <SelectItem key={province.code} value={province.name}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="city" className="font-body">{t("checkout.fields.city")}</Label>
                  <Input
                    id="city"
                    value={shippingData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder={shippingData.state ? `Ciudad en ${shippingData.state}` : "Primero seleccioná la provincia"}
                    disabled={!shippingData.state}
                    required
                  />
                  {shippingData.state === "Buenos Aires" && (
                    <p className="text-xs text-muted-foreground mt-1">Ej: Mar del Plata, La Plata, Bahía Blanca...</p>
                  )}
                </div>

                {/* Mar del Plata free shipping notice */}
                {isMarDelPlata && (
                  <div className="text-sm text-green-600 dark:text-green-400 bg-green-500/10 rounded-md px-3 py-2 flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    <span>¡Envío gratis a Mar del Plata! 🏖️</span>
                  </div>
                )}

                <div>
                  <Label htmlFor="zipCode" className="font-body">{t("checkout.fields.zip")}</Label>
                  <Input
                    id="zipCode"
                    value={shippingData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    className={postalCodeMismatch ? "border-amber-500" : ""}
                    required
                  />
                  {postalCodeMismatch && (
                    <div className="mt-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-md px-3 py-2 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>El código postal <strong>{shippingData.zipCode}</strong> no corresponde a <strong>{shippingData.state}</strong>.</p>
                        {suggestedProvince && (
                          <p className="mt-1">
                            Parece ser de <strong>{suggestedProvince}</strong>.{" "}
                            <button
                              type="button"
                              className="underline hover:no-underline"
                              onClick={() => handleInputChange("state", suggestedProvince)}
                            >
                              Corregir provincia
                            </button>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Country removed: default to Argentina */}
                <div className="hidden">
                  <Label htmlFor="country" className="font-body">{t("checkout.fields.country")}</Label>
                  <Input id="country" value={shippingData.country} readOnly />
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
                          {capitalize(item.selectedColor)} • {item.selectedSize} • Cant: {item.quantity}
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

                  {/* Promociones aplicadas */}
                  {promoDiscount > 0 && (
                    <div className="space-y-1">
                      {appliedPromos.map((promo, idx) => (
                        <div key={idx} className="flex justify-between text-green-600 dark:text-green-400">
                          <span className="flex items-center gap-1.5">
                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-md font-semibold">
                              {promo.promotion_name}
                            </span>
                            {promo.details && <span className="text-xs">({promo.details})</span>}
                          </span>
                          <span>-{formatPrice(promo.discount_amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Descuento de cupón */}
                  {coupon && discount > promoDiscount && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>{t("cart.coupon.discount")} ({coupon.code})</span>
                      <span>-{formatPrice(discount - promoDiscount)}</span>
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex justify-between font-medium">
                      <span>{t("cart.subtotal_after_discount")}</span>
                      <span>{formatPrice(discountedSubtotal)}</span>
                    </div>
                  )}
                  {/* Shipping Options Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        {t("checkout.summary.shipping")}
                      </span>
                      {loadingShipping && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>

                    {/* Show shipping options if available */}
                    {shippingOptions.length > 0 && !loadingShipping && (
                      <div className="space-y-2 mt-2">
                        {shippingSource === "envia" && (
                          <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            Tarifas en tiempo real
                          </div>
                        )}
                        <RadioGroup
                          value={selectedShipping ? `${selectedShipping.carrier}-${selectedShipping.service}` : ""}
                          onValueChange={(val) => {
                            const option = shippingOptions.find(o => `${o.carrier}-${o.service}` === val)
                            if (option) setSelectedShipping(option)
                          }}
                          className="space-y-2"
                        >
                          {shippingOptions.slice(0, 4).map((option) => (
                            <Label
                              key={`${option.carrier}-${option.service}`}
                              htmlFor={`shipping-${option.carrier}-${option.service}`}
                              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                                selectedShipping?.carrier === option.carrier && selectedShipping?.service === option.service
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <RadioGroupItem
                                  value={`${option.carrier}-${option.service}`}
                                  id={`shipping-${option.carrier}-${option.service}`}
                                />
                                <div>
                                  <div className="font-medium text-sm">{option.serviceName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {option.carrier !== "standard" && <span className="capitalize">{option.carrier}</span>}
                                    {option.estimatedDelivery && (
                                      <span> • {option.estimatedDelivery}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="font-semibold text-sm">
                                {isFreeShipping ? (
                                  <span className="text-green-600">Gratis</span>
                                ) : (
                                  formatPrice(option.price)
                                )}
                              </div>
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    {/* Fallback: show simple shipping line */}
                    {shippingOptions.length === 0 && !loadingShipping && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {shippingData.city && shippingData.zipCode
                            ? "Envío estándar"
                            : "Completá tu dirección para ver opciones"}
                        </span>
                        <span>{estimatedShipping === 0 ? t("cart.shipping_free") : formatPrice(estimatedShipping)}</span>
                      </div>
                    )}

                    {/* Error message */}
                    {shippingError && (
                      <div className="text-xs text-amber-600 dark:text-amber-400">
                        {shippingError}
                      </div>
                    )}
                  </div>

                  {/* Free shipping banner when globally enabled */}
                  {freeShippingEnabled && (
                    <div className="text-xs text-green-600 dark:text-green-400 bg-green-500/10 rounded-md px-3 py-2 flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      <span className="font-medium">{freeShippingMessage}</span>
                    </div>
                  )}

                  {/* Free shipping progress message (only show if global free shipping is OFF) */}
                  {!freeShippingEnabled && estimatedShipping > 0 && discountedSubtotal < freeThreshold && (
                    <div className="text-xs text-amber-500 dark:text-amber-400 bg-amber-500/10 rounded-md px-3 py-2">
                      ¡Te faltan <span className="font-semibold">{formatPrice(freeThreshold - discountedSubtotal)}</span> para envío gratis!
                    </div>
                  )}
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
                    {postalCodeMismatch
                      ? "⚠️ El código postal no coincide con la provincia seleccionada. Corregí los datos para continuar."
                      : "⚠️ Por favor completá todos los campos de envío para continuar"
                    }
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

                {/* Christmas message */}
                {isChristmasMode && (
                  <div className="font-body text-sm text-center p-3 bg-gradient-to-r from-red-500/10 via-green-500/10 to-red-500/10 rounded-lg border border-green-500/20">
                    <span className="text-green-400">🎄</span>{" "}
                    <span className="text-muted-foreground italic">Felices fiestas de parte de Busy</span>{" "}
                    <span className="text-red-400">🎁</span>
                  </div>
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
