/**
 * Envia.com API Client
 * Documentation: https://api.envia.com/doc
 */

const ENVIA_API_URL = process.env.ENVIA_API_URL || "https://api.envia.com"
const ENVIA_API_KEY = process.env.ENVIA_API_KEY || ""

// Origin address from environment variables
// Format matches Envia.com Argentina requirements
// IMPORTANT: state must be short code (BA, CF, etc.) not full name
const ORIGIN_ADDRESS = {
  name: process.env.ENVIA_ORIGIN_NAME || "Busy Streetwear",
  company: process.env.ENVIA_ORIGIN_COMPANY || "Busy Streetwear",
  email: process.env.ENVIA_ORIGIN_EMAIL || "contacto@busystreetwear.com",
  phone: process.env.ENVIA_ORIGIN_PHONE || "2235000000",
  street: process.env.ENVIA_ORIGIN_STREET || "Marie Curie",
  number: process.env.ENVIA_ORIGIN_NUMBER || "5457",
  district: process.env.ENVIA_ORIGIN_DISTRICT || "Mar del Plata",
  city: process.env.ENVIA_ORIGIN_CITY || "Mar del Plata",
  state: process.env.ENVIA_ORIGIN_STATE_CODE || "BA", // Must be short code!
  country: process.env.ENVIA_ORIGIN_COUNTRY || "AR",
  postalCode: process.env.ENVIA_ORIGIN_POSTAL_CODE || "7600",
}

// Argentina province codes for Envia.com
export const AR_STATE_CODES: Record<string, string> = {
  "buenos aires": "BA",
  "ciudad autonoma de buenos aires": "CF",
  "caba": "CF",
  "capital federal": "CF",
  "cordoba": "CB",
  "santa fe": "SF",
  "mendoza": "MZ",
  "tucuman": "TU",
  "entre rios": "ER",
  "salta": "SA",
  "misiones": "MI",
  "chaco": "CH",
  "corrientes": "CR",
  "santiago del estero": "SE",
  "san juan": "SJ",
  "jujuy": "JU",
  "rio negro": "RN",
  "neuquen": "NQ",
  "formosa": "FO",
  "chubut": "CT",
  "san luis": "SL",
  "catamarca": "CA",
  "la rioja": "LR",
  "la pampa": "LP",
  "santa cruz": "SC",
  "tierra del fuego": "TF",
}

/**
 * Convert full state name to Envia code
 */
export function getStateCode(state: string): string {
  const normalized = state.toLowerCase().trim()
  // If already a 2-letter code, return as-is
  if (normalized.length === 2) return normalized.toUpperCase()
  return AR_STATE_CODES[normalized] || "BA" // Default to Buenos Aires
}

// Default package dimensions (can be overridden)
const DEFAULT_PACKAGE = {
  length: 30, // cm
  width: 25,  // cm
  height: 10, // cm
  weight: 0.5, // kg (will be calculated from products)
}

export type EnviaAddress = {
  name: string
  company?: string
  email?: string
  phone: string
  street: string
  number?: string
  district?: string
  city: string
  state: string
  country: string
  postalCode: string
}

export type EnviaPackage = {
  content: string
  amount: number
  type: "box" | "envelope" | "pallet"
  weight: number // kg
  insurance: number // value in currency
  declaredValue: number
  weightUnit: "KG" | "LB"
  lengthUnit: "CM" | "IN"
  dimensions: {
    length: number
    width: number
    height: number
  }
}

export type EnviaRateRequest = {
  origin: EnviaAddress
  destination: EnviaAddress
  packages: EnviaPackage[]
}

export type EnviaCarrier = {
  carrier: string
  service: string
  serviceName: string
  serviceDescription?: string
  deliveryEstimate?: string
  deliveryDate?: string
  totalPrice: number
  currency: string
  logo?: string
}

export type EnviaRateResponse = {
  meta: string
  data: EnviaCarrier[]
}

export type EnviaShipmentRequest = {
  origin: EnviaAddress
  destination: EnviaAddress
  packages: EnviaPackage[]
  carrier: string
  service: string
}

export type EnviaShipmentResponse = {
  meta: string
  data: {
    carrier: string
    service: string
    trackingNumber: string
    trackUrl?: string
    label: string // URL to PDF
    shipmentId: string
    totalPrice: number
    currency: string
  }
}

export type EnviaTrackingResponse = {
  meta: string
  data: {
    trackingNumber: string
    carrier: string
    status: string
    statusDescription: string
    events: Array<{
      date: string
      description: string
      location?: string
    }>
  }
}

class EnviaClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = ENVIA_API_KEY
    this.baseUrl = ENVIA_API_URL
  }

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Envia API error: ${response.status} - ${errorText}`)
    }

    return response.json() as Promise<T>
  }

  /**
   * Get shipping rates for a package
   */
  async getRates(request: EnviaRateRequest): Promise<EnviaCarrier[]> {
    const response = await this.request<EnviaRateResponse>(
      "/ship/rate/",
      "POST",
      request
    )
    return response.data || []
  }

  /**
   * Create a shipment and generate label
   */
  async createShipment(request: EnviaShipmentRequest): Promise<EnviaShipmentResponse["data"]> {
    const response = await this.request<EnviaShipmentResponse>(
      "/ship/generate/",
      "POST",
      request
    )
    return response.data
  }

  /**
   * Get tracking information
   */
  async getTracking(trackingNumber: string, carrier: string): Promise<EnviaTrackingResponse["data"]> {
    const response = await this.request<EnviaTrackingResponse>(
      `/ship/tracking/?trackingNumber=${encodeURIComponent(trackingNumber)}&carrier=${encodeURIComponent(carrier)}`,
      "GET"
    )
    return response.data
  }

  /**
   * Cancel a shipment
   */
  async cancelShipment(shipmentId: string): Promise<boolean> {
    try {
      await this.request(
        `/ship/cancel/`,
        "POST",
        { shipmentId }
      )
      return true
    } catch {
      return false
    }
  }

  /**
   * Get origin address from environment
   */
  getOriginAddress(): EnviaAddress {
    return ORIGIN_ADDRESS
  }

  /**
   * Build package from order items
   * Note: Weight calculation will use default weights until weight field is added to products
   */
  buildPackage(params: {
    itemCount: number
    totalValue: number
    description?: string
    totalWeight?: number // in grams, optional
  }): EnviaPackage {
    // Convert grams to kg, use default if not provided
    const weightKg = params.totalWeight
      ? params.totalWeight / 1000
      : DEFAULT_PACKAGE.weight * params.itemCount

    // Estimate dimensions based on item count
    const baseHeight = DEFAULT_PACKAGE.height
    const estimatedHeight = Math.min(baseHeight + (params.itemCount - 1) * 3, 50) // Max 50cm

    return {
      content: params.description || "Ropa y accesorios",
      amount: params.itemCount,
      type: "box",
      weight: Math.max(0.1, weightKg), // Minimum 100g
      insurance: params.totalValue,
      declaredValue: params.totalValue,
      weightUnit: "KG",
      lengthUnit: "CM",
      dimensions: {
        length: DEFAULT_PACKAGE.length,
        width: DEFAULT_PACKAGE.width,
        height: estimatedHeight,
      },
    }
  }

  /**
   * Check if Envia is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0
  }

  /**
   * Health check - verify token and account status
   * Returns detailed status for debugging
   */
  async healthCheck(): Promise<{
    configured: boolean
    tokenValid: boolean
    canQuote: boolean
    error?: string
    details?: string
  }> {
    if (!this.isConfigured()) {
      return {
        configured: false,
        tokenValid: false,
        canQuote: false,
        error: "ENVIA_API_KEY not configured",
      }
    }

    // Test with a simple quote request
    const testRequest = {
      origin: {
        name: "Test",
        phone: "1234567890",
        street: "Test",
        number: "123",
        city: "Mar del Plata",
        state: "BA",
        country: "AR",
        postalCode: "7600",
      },
      destination: {
        name: "Test",
        phone: "1234567890",
        street: "Test",
        number: "123",
        city: "Buenos Aires",
        state: "CF",
        country: "AR",
        postalCode: "1043",
      },
      packages: [{
        content: "Test",
        amount: 1,
        type: "box",
        weight: 1,
        insurance: 0,
        declaredValue: 1000,
        weightUnit: "KG",
        lengthUnit: "CM",
        dimensions: { length: 10, width: 10, height: 10 },
      }],
    }

    try {
      const url = `${this.baseUrl}/ship/rate/`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(testRequest),
      })

      const text = await response.text()

      if (response.status === 401) {
        return {
          configured: true,
          tokenValid: false,
          canQuote: false,
          error: "Token invalid or not authorized",
          details: text,
        }
      }

      if (response.status === 500) {
        // Try to parse error
        try {
          const json = JSON.parse(text)
          return {
            configured: true,
            tokenValid: true,
            canQuote: false,
            error: json.error?.message || json.message || "Server error",
            details: JSON.stringify(json),
          }
        } catch {
          return {
            configured: true,
            tokenValid: true,
            canQuote: false,
            error: "Server error (500)",
            details: text.substring(0, 200),
          }
        }
      }

      if (response.ok) {
        try {
          const json = JSON.parse(text)
          if (json.meta === "error") {
            return {
              configured: true,
              tokenValid: true,
              canQuote: false,
              error: json.error?.message || json.error?.description || "API error",
              details: JSON.stringify(json.error),
            }
          }
          if (json.data && json.data.length > 0) {
            return {
              configured: true,
              tokenValid: true,
              canQuote: true,
              details: `Found ${json.data.length} carriers`,
            }
          }
          return {
            configured: true,
            tokenValid: true,
            canQuote: false,
            error: "No carriers returned",
            details: JSON.stringify(json),
          }
        } catch {
          return {
            configured: true,
            tokenValid: true,
            canQuote: false,
            error: "Invalid JSON response",
            details: text.substring(0, 200),
          }
        }
      }

      return {
        configured: true,
        tokenValid: false,
        canQuote: false,
        error: `HTTP ${response.status}`,
        details: text.substring(0, 200),
      }
    } catch (err) {
      return {
        configured: true,
        tokenValid: false,
        canQuote: false,
        error: `Network error: ${(err as Error).message}`,
      }
    }
  }
}

// Singleton instance
let enviaClient: EnviaClient | null = null

export function getEnviaClient(): EnviaClient {
  if (!enviaClient) {
    enviaClient = new EnviaClient()
  }
  return enviaClient
}

export default getEnviaClient
