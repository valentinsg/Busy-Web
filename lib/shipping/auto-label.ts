/**
 * Auto-generate shipping label after payment confirmation
 * This module handles automatic label generation via Envia.com
 */

import { logError, logInfo } from "@/lib/checkout/logger"
import { getEnviaClient, type EnviaAddress, type EnviaCarrier } from "@/lib/envia"
import getServiceClient from "@/lib/supabase/server"

type OrderForLabel = {
  id: string
  total: number
  shipping_address: {
    name?: string
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
    phone?: string
  } | null
}

type LabelResult = {
  success: boolean
  label_url?: string
  tracking_number?: string
  carrier?: string
  shipment_id?: string
  error?: string
}

/**
 * Get the cheapest shipping rate for an order
 */
async function getCheapestRate(
  destination: EnviaAddress,
  itemCount: number,
  totalValue: number
): Promise<EnviaCarrier | null> {
  const envia = getEnviaClient()

  if (!envia.isConfigured()) {
    return null
  }

  try {
    const pkg = envia.buildPackage({
      itemCount,
      totalValue,
      description: "Ropa Busy Streetwear",
    })

    const rates = await envia.getRates({
      origin: envia.getOriginAddress(),
      destination,
      packages: [pkg],
    })

    if (!rates || rates.length === 0) {
      return null
    }

    // Sort by price and return cheapest
    rates.sort((a, b) => a.totalPrice - b.totalPrice)
    return rates[0]
  } catch (err) {
    logError("Failed to get shipping rates for auto-label", {
      error: String((err as Error)?.message || err),
    })
    return null
  }
}

/**
 * Automatically generate a shipping label for an order
 * Called after payment is confirmed (webhook or transfer confirmation)
 */
export async function generateAutoLabel(orderId: string): Promise<LabelResult> {
  const envia = getEnviaClient()

  // Check if Envia is configured
  if (!envia.isConfigured()) {
    logInfo("Envia not configured, skipping auto-label", { order_id: orderId })
    return {
      success: false,
      error: "Envia.com is not configured",
    }
  }

  const supabase = getServiceClient()

  try {
    // Get order with items
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, total, shipping_address, label_url, tracking_number")
      .eq("id", orderId)
      .single()

    if (orderErr || !order) {
      return {
        success: false,
        error: "Order not found",
      }
    }

    // Skip if label already exists
    if (order.label_url && order.tracking_number) {
      logInfo("Label already exists for order", { order_id: orderId })
      return {
        success: true,
        label_url: order.label_url,
        tracking_number: order.tracking_number,
      }
    }

    const typedOrder = order as OrderForLabel

    // Validate shipping address
    if (!typedOrder.shipping_address?.city || !typedOrder.shipping_address?.postal_code) {
      return {
        success: false,
        error: "Order does not have a valid shipping address",
      }
    }

    // Get order items with product info for weight calculation
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId)

    const itemCount = items?.reduce((sum, it) => sum + it.quantity, 0) || 1

    // Calculate total weight from products
    let totalWeight = 0
    if (items && items.length > 0) {
      const productIds = items.map(i => i.product_id).filter(Boolean)
      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from("products")
          .select("id, weight, category")
          .in("id", productIds)

        if (products) {
          const { getProductWeight } = await import("./weights")
          const productMap = new Map(
            products.map(p => [p.id, { weight: p.weight, category: p.category }])
          )
          totalWeight = items.reduce((total, item) => {
            const productData = productMap.get(item.product_id)
            const weight = getProductWeight({
              weight: productData?.weight,
              category: productData?.category,
            })
            return total + (weight * item.quantity)
          }, 0)
        }
      }
    }
    // Default weight if not calculated
    if (!totalWeight) {
      totalWeight = 300 * itemCount
    }

    // Build destination address
    const destination: EnviaAddress = {
      name: typedOrder.shipping_address.name || "Cliente",
      phone: typedOrder.shipping_address.phone || "",
      street: typedOrder.shipping_address.street || "",
      city: typedOrder.shipping_address.city,
      state: typedOrder.shipping_address.state || typedOrder.shipping_address.city,
      country: typedOrder.shipping_address.country || "AR",
      postalCode: typedOrder.shipping_address.postal_code,
    }

    // Get cheapest rate
    const cheapestRate = await getCheapestRate(destination, itemCount, typedOrder.total)

    if (!cheapestRate) {
      logInfo("No shipping rates available for auto-label", { order_id: orderId })
      return {
        success: false,
        error: "No shipping rates available",
      }
    }

    logInfo("Auto-generating label with cheapest rate", {
      order_id: orderId,
      carrier: cheapestRate.carrier,
      service: cheapestRate.service,
      price: cheapestRate.totalPrice,
    })

    // Build package with calculated weight
    const pkg = envia.buildPackage({
      itemCount,
      totalValue: typedOrder.total,
      description: `Pedido #${orderId.slice(0, 8)} - Busy Streetwear`,
      totalWeight,
    })

    // Create shipment
    const shipment = await envia.createShipment({
      origin: envia.getOriginAddress(),
      destination,
      packages: [pkg],
      carrier: cheapestRate.carrier,
      service: cheapestRate.service,
    })

    logInfo("Auto-label created successfully", {
      order_id: orderId,
      shipmentId: shipment.shipmentId,
      trackingNumber: shipment.trackingNumber,
    })

    // Update order with shipping info
    await supabase
      .from("orders")
      .update({
        carrier: shipment.carrier || cheapestRate.carrier,
        tracking_number: shipment.trackingNumber,
        label_url: shipment.label,
        shipment_id: shipment.shipmentId,
        shipping_status: "label_created",
        shipping_cost_actual: shipment.totalPrice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    return {
      success: true,
      label_url: shipment.label,
      tracking_number: shipment.trackingNumber,
      carrier: shipment.carrier || cheapestRate.carrier,
      shipment_id: shipment.shipmentId,
    }
  } catch (err) {
    logError("Auto-label generation failed", {
      order_id: orderId,
      error: String((err as Error)?.message || err),
    })
    return {
      success: false,
      error: String((err as Error)?.message || err),
    }
  }
}

/**
 * Check if auto-label generation is enabled
 */
export function isAutoLabelEnabled(): boolean {
  const envia = getEnviaClient()
  const autoEnabled = process.env.ENVIA_AUTO_LABEL !== "false"
  return envia.isConfigured() && autoEnabled
}
