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

const CHECKOUT_MODE = process.env.NEXT_PUBLIC_CHECKOUT_MODE || "mailto"

export default function CheckoutPage() {
  const { items, getTotalItems, getTotalPrice, clearCart } = useCart()
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
  const totalPrice = getTotalPrice()
  const estimatedShipping = totalPrice > 100 ? 0 : 9.99
  const estimatedTax = totalPrice * 0.08
  const finalTotal = totalPrice + estimatedShipping + estimatedTax

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

Subtotal: ${formatPrice(totalPrice)}
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
          <h1 className="font-heading text-3xl font-bold mb-4">No items to checkout</h1>
          <p className="text-muted-foreground mb-8">
            Your cart is empty. Add some products before proceeding to checkout.
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
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Link>
          </Button>
          <h1 className="font-heading text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={shippingData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={shippingData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={shippingData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
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
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={shippingData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={shippingData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="MX">Mexico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {CHECKOUT_MODE === "stripe-test" && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Credit Card (Stripe)</span>
                      </Label>
                    </div>
                  )}

                  {CHECKOUT_MODE === "mailto" && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email" className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email Order</span>
                      </Label>
                    </div>
                  )}

                  {CHECKOUT_MODE === "whatsapp" && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="whatsapp" id="whatsapp" />
                      <Label htmlFor="whatsapp" className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>WhatsApp Order</span>
                      </Label>
                    </div>
                  )}
                </RadioGroup>

                <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                  {CHECKOUT_MODE === "mailto" && "Your order will be sent via email for processing."}
                  {CHECKOUT_MODE === "whatsapp" && "Your order will be sent via WhatsApp for processing."}
                  {CHECKOUT_MODE === "stripe-test" && "This is a test environment. No real payments will be processed."}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
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

                {/* Pricing Breakdown */}
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

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={
                    !shippingData.firstName || !shippingData.lastName || !shippingData.email || !shippingData.address
                  }
                >
                  {CHECKOUT_MODE === "whatsapp" && "Complete Order via WhatsApp"}
                  {CHECKOUT_MODE === "mailto" && "Complete Order via Email"}
                  {CHECKOUT_MODE === "stripe-test" && "Complete Order"}
                </Button>

                {/* Security Notice */}
                <div className="text-xs text-center text-muted-foreground">
                  Your information is secure and encrypted
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
