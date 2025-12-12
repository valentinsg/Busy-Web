/**
 * Virtual Try-On Configuration
 * Google Vertex AI Virtual Try-On API settings
 */

export const VIRTUAL_TRY_ON_CONFIG = {
  // Google Cloud settings
  model: 'virtual-try-on-preview-08-04',
  region: process.env.GOOGLE_CLOUD_REGION || 'us-central1',
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',

  // API endpoint template
  getEndpoint: () => {
    const region = VIRTUAL_TRY_ON_CONFIG.region
    const projectId = VIRTUAL_TRY_ON_CONFIG.projectId
    return `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${VIRTUAL_TRY_ON_CONFIG.model}:predict`
  },

  // Image constraints
  image: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    recommendedWidth: 1024,
    recommendedHeight: 1024,
  },

  // Generation settings
  generation: {
    defaultSampleCount: 2,
    maxSampleCount: 4,
    minSampleCount: 1,
  },

  // Rate limiting
  rateLimit: {
    maxRequestsPerMinute: 10,
    maxRequestsPerDay: 100,
  },

  // Storage bucket for try-on images
  storage: {
    bucket: 'virtual-try-on',
    personImagesFolder: 'person-images',
    generatedImagesFolder: 'generated',
  },

  // Feature flags
  features: {
    enabled: process.env.VIRTUAL_TRY_ON_ENABLED === 'true',
    saveHistory: true,
    allowAnonymous: true,
    requireConsent: true,
  },
} as const

export type VirtualTryOnConfig = typeof VIRTUAL_TRY_ON_CONFIG
