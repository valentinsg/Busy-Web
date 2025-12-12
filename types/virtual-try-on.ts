/**
 * Virtual Try-On Types
 * Integration with Google Vertex AI Virtual Try-On API
 */

export interface VirtualTryOnRequest {
  personImage: string // Base64 encoded image
  productImage: string // Base64 encoded image (product photo)
  productId: string
  sampleCount?: number // 1-4 images to generate
}

export interface VirtualTryOnResponse {
  success: boolean
  images?: GeneratedImage[]
  error?: string
  processingTime?: number
}

export interface GeneratedImage {
  id: string
  base64: string
  mimeType: string
  createdAt: string
}

export interface TryOnSession {
  id: string
  userId?: string
  productId: string
  personImageUrl?: string // Stored in Supabase Storage
  generatedImages: GeneratedImage[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface TryOnHistoryItem {
  id: string
  productId: string
  productName: string
  productImage: string
  generatedImageUrl: string
  createdAt: string
}

// Vertex AI API types
export interface VertexAIVirtualTryOnRequest {
  instances: Array<{
    personImage: {
      image: {
        bytesBase64Encoded: string
      }
    }
    productImages: Array<{
      image: {
        bytesBase64Encoded: string
      }
    }>
  }>
  parameters: {
    sampleCount: number
    storageUri?: string
  }
}

export interface VertexAIVirtualTryOnResponse {
  predictions: Array<{
    mimeType: string
    bytesBase64Encoded: string
  }>
}

// Component props
export interface VirtualTryOnButtonProps {
  productId: string
  productImage: string
  productName: string
  disabled?: boolean
}

export interface VirtualTryOnModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productImage: string
  productName: string
}

export interface TryOnResultProps {
  originalImage: string
  generatedImages: GeneratedImage[]
  productName: string
  onRetry: () => void
  onShare: () => void
}
