import { logError, logInfo } from "@/lib/checkout/logger"
import { getSettingsServer } from "@/lib/repo/settings"
import { getProductWeight, getShippingOptionsByProvince } from "@/lib/shipping"
import getServiceClient from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type RatesRequestBody = {
  destination: {
    name: string
    phone: string
    street: string
    city: string
    state: string
    postalCode: string
    country?: string
  }
  items: Array<{
    product_id: string
    quantity: number
    weight?: number | null
    category?: string | null
  }>
  totalValue: number
  itemCount: number
  totalWeight?: number
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RatesRequestBody

    // Validate required fields
    if (!body.destination) {
      return badRequest("destination is required")
    }
    if (!body.destination.city || !body.destination.postalCode) {
      return badRequest("destination.city and destination.postalCode are required")
    }

    // Get settings for free shipping threshold
    const settings = await getSettingsServer().catch(() => ({
      shipping_flat_rate: 25000,
      shipping_free_threshold: 100000,
      christmas_mode: false,
    }))
    const freeThreshold = Number(settings.shipping_free_threshold)

    // Calculate weight for province-based rates
    let totalWeightKg = 1 // Default 1kg

    if (body.items && body.items.length > 0) {
      const productIds = body.items.map(i => i.product_id).filter(Boolean)

      if (productIds.length > 0) {
        try {
          const supabase = getServiceClient()
          const { data: products } = await supabase
            .from("products")
            .select("id, weight, category")
            .in("id", productIds)

          if (products && products.length > 0) {
            const productMap = new Map(
              products.map(p => [p.id, { weight: p.weight, category: p.category }])
            )
            const totalGrams = body.items.reduce((total, item) => {
              const productData = productMap.get(item.product_id)
              const weight = getProductWeight({
                weight: productData?.weight ?? item.weight,
                category: productData?.category ?? item.category,
              })
              return total + (weight * item.quantity)
            }, 0)
            totalWeightKg = Math.max(0.1, totalGrams / 1000)
          }
        } catch (dbErr) {
          console.error("[shipping/rates] DB error:", dbErr)
          // Continue with default weight
        }
      }
    }

    // Use province-based rates
    const options = getShippingOptionsByProvince({
      province: body.destination.state || body.destination.city,
      city: body.destination.city,
      weightKg: totalWeightKg,
      totalValue: body.totalValue,
      freeThreshold,
    })

    logInfo("Province-based rates calculated", {
      city: body.destination.city,
      state: body.destination.state,
      weightKg: totalWeightKg,
      optionsCount: options.length,
      cheapest: options[0]?.price,
    })

    return NextResponse.json({
      success: true,
      options,
      source: "province_table",
    })

  } catch (err: unknown) {
    logError("shipping/rates error", {
      error: String((err as Error)?.message || err),
    })

    // Return province-based rates on error
    try {
      const body = await req.clone().json().catch(() => ({})) as RatesRequestBody
      const settings = await getSettingsServer().catch(() => ({
        shipping_flat_rate: 25000,
        shipping_free_threshold: 100000,
        christmas_mode: false,
      }))

      if (body.destination?.city || body.destination?.state) {
        const options = getShippingOptionsByProvince({
          province: body.destination.state || body.destination.city || "",
          city: body.destination.city || "",
          weightKg: 1,
          totalValue: body.totalValue || 0,
          freeThreshold: Number(settings.shipping_free_threshold),
        })

        return NextResponse.json({
          success: true,
          options,
          source: "province_table",
        })
      }

      // Ultimate fallback
      return NextResponse.json({
        success: true,
        options: [
          {
            carrier: "standard",
            service: "standard",
            serviceName: "Envío Estándar",
            price: Number(settings.shipping_flat_rate),
            currency: "ARS",
            estimatedDelivery: "3-7 días hábiles",
          },
        ],
        source: "fallback",
      })
    } catch {
      return NextResponse.json({
        success: false,
        error: "Could not calculate shipping rates",
      }, { status: 500 })
    }
  }
}
