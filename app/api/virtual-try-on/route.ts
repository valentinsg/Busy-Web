/**
 * Virtual Try-On API Route
 * POST /api/virtual-try-on
 *
 * Generates virtual try-on images using Google Vertex AI
 */

import { generateTryOnImages, imageUrlToBase64, validateImage } from '@/lib/virtual-try-on/client'
import { VIRTUAL_TRY_ON_CONFIG } from '@/lib/virtual-try-on/config'
import type { VirtualTryOnRequest, VirtualTryOnResponse } from '@/types/virtual-try-on'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse<VirtualTryOnResponse>> {
  try {
    // Check if feature is enabled
    if (!VIRTUAL_TRY_ON_CONFIG.features.enabled) {
      return NextResponse.json(
        { success: false, error: 'El probador virtual no está disponible en este momento' },
        { status: 503 }
      )
    }

    // Parse request body
    const body: VirtualTryOnRequest = await request.json()
    const { personImage, productImage, productId, sampleCount } = body

    // Validate required fields
    if (!personImage) {
      return NextResponse.json(
        { success: false, error: 'Se requiere una imagen de la persona' },
        { status: 400 }
      )
    }

    if (!productImage) {
      return NextResponse.json(
        { success: false, error: 'Se requiere una imagen del producto' },
        { status: 400 }
      )
    }

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Se requiere el ID del producto' },
        { status: 400 }
      )
    }

    // Process person image (could be base64 or URL)
    let personImageBase64 = personImage
    if (personImage.startsWith('http')) {
      const converted = await imageUrlToBase64(personImage)
      if (!converted) {
        return NextResponse.json(
          { success: false, error: 'No se pudo procesar la imagen de la persona' },
          { status: 400 }
        )
      }
      personImageBase64 = converted
    }

    // Process product image (could be base64 or URL)
    let productImageBase64 = productImage
    if (productImage.startsWith('http')) {
      const converted = await imageUrlToBase64(productImage)
      if (!converted) {
        return NextResponse.json(
          { success: false, error: 'No se pudo procesar la imagen del producto' },
          { status: 400 }
        )
      }
      productImageBase64 = converted
    }

    // Validate images
    const personMimeType = extractMimeType(personImageBase64)
    const productMimeType = extractMimeType(productImageBase64)

    const personValidation = validateImage(personImageBase64, personMimeType)
    if (!personValidation.valid) {
      return NextResponse.json(
        { success: false, error: `Imagen de persona: ${personValidation.error}` },
        { status: 400 }
      )
    }

    const productValidation = validateImage(productImageBase64, productMimeType)
    if (!productValidation.valid) {
      return NextResponse.json(
        { success: false, error: `Imagen de producto: ${productValidation.error}` },
        { status: 400 }
      )
    }

    // Generate try-on images
    const result = await generateTryOnImages(
      personImageBase64,
      productImageBase64,
      sampleCount
    )

    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }

    // Log analytics (optional)
    console.log(`[VirtualTryOn] Generated ${result.images?.length || 0} images for product ${productId} in ${result.processingTime}ms`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[VirtualTryOn] Route error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * Extract MIME type from base64 data URL
 */
function extractMimeType(base64: string): string {
  if (base64.startsWith('data:')) {
    const match = base64.match(/data:([^;]+);/)
    if (match) return match[1]
  }
  return 'image/jpeg' // Default
}
