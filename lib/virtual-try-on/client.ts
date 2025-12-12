/**
 * Virtual Try-On API Client
 * Handles communication with Google Vertex AI Virtual Try-On API
 */

import type {
    GeneratedImage,
    VertexAIVirtualTryOnRequest,
    VertexAIVirtualTryOnResponse,
    VirtualTryOnResponse
} from '@/types/virtual-try-on'
import { VIRTUAL_TRY_ON_CONFIG } from './config'

/**
 * Generate virtual try-on images using Google Vertex AI
 * This should only be called from the server-side API route
 */
export async function generateTryOnImages(
  personImageBase64: string,
  productImageBase64: string,
  sampleCount: number = VIRTUAL_TRY_ON_CONFIG.generation.defaultSampleCount
): Promise<VirtualTryOnResponse> {
  const startTime = Date.now()

  try {
    // Validate inputs
    if (!personImageBase64 || !productImageBase64) {
      return {
        success: false,
        error: 'Se requieren ambas imágenes: persona y producto',
      }
    }

    // Clamp sample count
    const validSampleCount = Math.min(
      Math.max(sampleCount, VIRTUAL_TRY_ON_CONFIG.generation.minSampleCount),
      VIRTUAL_TRY_ON_CONFIG.generation.maxSampleCount
    )

    // Build Vertex AI request
    const vertexRequest: VertexAIVirtualTryOnRequest = {
      instances: [
        {
          personImage: {
            image: {
              bytesBase64Encoded: cleanBase64(personImageBase64),
            },
          },
          productImages: [
            {
              image: {
                bytesBase64Encoded: cleanBase64(productImageBase64),
              },
            },
          ],
        },
      ],
      parameters: {
        sampleCount: validSampleCount,
      },
    }

    // Get access token
    const accessToken = await getGoogleAccessToken()
    if (!accessToken) {
      return {
        success: false,
        error: 'Error de autenticación con Google Cloud',
      }
    }

    // Call Vertex AI API
    const response = await fetch(VIRTUAL_TRY_ON_CONFIG.getEndpoint(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vertexRequest),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[VirtualTryOn] API error:', response.status, errorText)
      return {
        success: false,
        error: `Error del servicio: ${response.status}`,
      }
    }

    const data: VertexAIVirtualTryOnResponse = await response.json()

    // Transform response
    const images: GeneratedImage[] = data.predictions.map((pred, index) => ({
      id: `gen-${Date.now()}-${index}`,
      base64: pred.bytesBase64Encoded,
      mimeType: pred.mimeType,
      createdAt: new Date().toISOString(),
    }))

    return {
      success: true,
      images,
      processingTime: Date.now() - startTime,
    }
  } catch (error) {
    console.error('[VirtualTryOn] Error:', error)
    return {
      success: false,
      error: 'Error al procesar la imagen. Intenta de nuevo.',
      processingTime: Date.now() - startTime,
    }
  }
}

/**
 * Get Google Cloud access token
 * Uses service account credentials or ADC
 */
async function getGoogleAccessToken(): Promise<string | null> {
  try {
    // Option 1: Use service account JSON from environment
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    if (serviceAccountJson) {
      const { GoogleAuth } = await import('google-auth-library')
      const credentials = JSON.parse(serviceAccountJson)
      const auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      })
      const client = await auth.getClient()
      const token = await client.getAccessToken()
      return token.token || null
    }

    // Option 2: Use Application Default Credentials (for local dev with gcloud)
    const { GoogleAuth } = await import('google-auth-library')
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    const client = await auth.getClient()
    const token = await client.getAccessToken()
    return token.token || null
  } catch (error) {
    console.error('[VirtualTryOn] Auth error:', error)
    return null
  }
}

/**
 * Clean base64 string (remove data URL prefix if present)
 */
function cleanBase64(base64: string): string {
  if (base64.includes(',')) {
    return base64.split(',')[1]
  }
  return base64
}

/**
 * Convert image URL to base64
 */
export async function imageUrlToBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) return null

    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = response.headers.get('content-type') || 'image/jpeg'

    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error('[VirtualTryOn] Image fetch error:', error)
    return null
  }
}

/**
 * Validate image before processing
 */
export function validateImage(
  base64: string,
  mimeType: string
): { valid: boolean; error?: string } {
  // Check format
  const supportedFormats = VIRTUAL_TRY_ON_CONFIG.image.supportedFormats as readonly string[]
  if (!supportedFormats.includes(mimeType)) {
    return {
      valid: false,
      error: `Formato no soportado. Usa: ${supportedFormats.join(', ')}`,
    }
  }

  // Check size (approximate from base64 length)
  const sizeBytes = (base64.length * 3) / 4
  if (sizeBytes > VIRTUAL_TRY_ON_CONFIG.image.maxSizeBytes) {
    return {
      valid: false,
      error: 'La imagen es muy grande. Máximo 10MB.',
    }
  }

  return { valid: true }
}
