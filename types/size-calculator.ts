export type FitPreference = 'tight' | 'regular' | 'loose' | 'oversized'

export type BodyType = 'slim' | 'athletic' | 'regular' | 'muscular' | 'plus'

export interface UserMeasurements {
  height: number // en cm
  weight: number // en kg
  chest?: number // perímetro de pecho en cm
  waist?: number // perímetro de cintura en cm
  fitPreference: FitPreference
  bodyType?: BodyType
}

export interface ProductMeasurements {
  chest: number // ancho de pecho en cm
  length: number // largo total en cm
  shoulders: number // ancho de hombros en cm
  sleeves?: number // largo de manga en cm (para buzos/remeras manga larga)
  waist?: number // ancho de cintura en cm (para pantalones)
  inseam?: number // largo de entrepierna en cm (para pantalones)
}

export interface SizeRecommendation {
  size: string
  confidence: 'high' | 'medium' | 'low'
  reasons: string[]
  alternativeSizes?: string[]
  measurements: ProductMeasurements
}

export interface CalculatorResult {
  recommendedSize: SizeRecommendation
  allSizes: Record<string, ProductMeasurements>
  category: string
}
