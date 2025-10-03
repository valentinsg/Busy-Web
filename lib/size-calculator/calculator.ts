import type {
  UserMeasurements,
  ProductMeasurements,
  SizeRecommendation,
  CalculatorResult,
} from '@/types/size-calculator'

/**
 * Tabla de medidas estándar para productos Busy
 * TODO: Estas medidas deberían venir de la base de datos o del producto específico
 */
const STANDARD_MEASUREMENTS: Record<string, Record<string, ProductMeasurements>> = {
  hoodies: {
    S: { chest: 96, length: 68, shoulders: 50 },
    M: { chest: 102, length: 70, shoulders: 52 },
    L: { chest: 108, length: 72, shoulders: 54 },
    XL: { chest: 114, length: 74, shoulders: 56 },
  },
  tshirts: {
    S: { chest: 92, length: 68, shoulders: 48 },
    M: { chest: 98, length: 70, shoulders: 50 },
    L: { chest: 104, length: 72, shoulders: 52 },
    XL: { chest: 110, length: 74, shoulders: 54 },
    XXL: { chest: 116, length: 76, shoulders: 56 },
  },
  pants: {
    S: { chest: 76, length: 100, shoulders: 0, waist: 76, inseam: 76 },
    M: { chest: 82, length: 102, shoulders: 0, waist: 82, inseam: 78 },
    L: { chest: 88, length: 104, shoulders: 0, waist: 88, inseam: 80 },
    XL: { chest: 94, length: 106, shoulders: 0, waist: 94, inseam: 82 },
  },
}

/**
 * Calcula el IMC (Índice de Masa Corporal) del usuario
 */
function calculateBMI(height: number, weight: number): number {
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

/**
 * Estima el perímetro de pecho basado en altura, peso y tipo de cuerpo
 * Esta es una aproximación - idealmente el usuario debería medirse
 */
function estimateChestCircumference(user: UserMeasurements): number {
  const bmi = calculateBMI(user.height, user.weight)
  
  // Base: altura correlaciona con tamaño de torso
  let baseChest = 85 + (user.height - 170) * 0.3
  
  // Ajuste por BMI
  if (bmi < 18.5) {
    baseChest -= 8 // Delgado
  } else if (bmi >= 18.5 && bmi < 25) {
    baseChest += 0 // Normal
  } else if (bmi >= 25 && bmi < 30) {
    baseChest += 10 // Sobrepeso
  } else {
    baseChest += 18 // Obesidad
  }
  
  // Ajuste por tipo de cuerpo
  if (user.bodyType === 'slim') {
    baseChest -= 6
  } else if (user.bodyType === 'athletic') {
    baseChest += 4
  } else if (user.bodyType === 'muscular') {
    baseChest += 8
  } else if (user.bodyType === 'plus') {
    baseChest += 12
  }
  
  return Math.round(baseChest)
}

/**
 * Ajusta el talle recomendado según la preferencia de fit del usuario
 */
function adjustForFitPreference(
  baseSize: string,
  fitPreference: string,
  availableSizes: string[]
): string {
  const sizeIndex = availableSizes.indexOf(baseSize)
  
  if (fitPreference === 'tight' && sizeIndex > 0) {
    // Prefiere ajustado: baja un talle
    return availableSizes[sizeIndex - 1]
  } else if (fitPreference === 'loose' && sizeIndex < availableSizes.length - 1) {
    // Prefiere holgado: sube un talle
    return availableSizes[sizeIndex + 1]
  } else if (fitPreference === 'oversized' && sizeIndex < availableSizes.length - 1) {
    // Prefiere oversized: sube uno o dos talles
    const targetIndex = Math.min(sizeIndex + 2, availableSizes.length - 1)
    return availableSizes[targetIndex]
  }
  
  return baseSize
}

/**
 * Encuentra el talle base según las medidas del usuario
 */
function findBaseSize(
  userChest: number,
  category: string,
  measurements: Record<string, ProductMeasurements>
): string {
  const sizes = Object.keys(measurements)
  
  // Buscar el talle cuyo ancho de pecho sea más cercano al del usuario
  let bestSize = sizes[0]
  let minDiff = Math.abs(measurements[sizes[0]].chest - userChest)
  
  for (const size of sizes) {
    const diff = Math.abs(measurements[size].chest - userChest)
    if (diff < minDiff) {
      minDiff = diff
      bestSize = size
    }
  }
  
  return bestSize
}

/**
 * Genera razones explicativas para la recomendación
 */
function generateReasons(
  user: UserMeasurements,
  recommendedSize: string,
  measurements: ProductMeasurements
): string[] {
  const reasons: string[] = []
  
  // Razón por altura
  if (user.height < 165) {
    reasons.push(`Tu altura de ${user.height}cm sugiere talles más pequeños`)
  } else if (user.height >= 165 && user.height <= 180) {
    reasons.push(`Tu altura de ${user.height}cm está en el rango estándar para talle ${recommendedSize}`)
  } else {
    reasons.push(`Tu altura de ${user.height}cm sugiere talles más grandes`)
  }
  
  // Razón por preferencia de fit
  const fitLabels = {
    tight: 'ajustado',
    regular: 'regular',
    loose: 'holgado',
    oversized: 'oversized',
  }
  reasons.push(
    `Tu preferencia de fit "${fitLabels[user.fitPreference]}" se ajusta a este talle`
  )
  
  // Razón por tipo de cuerpo
  if (user.bodyType) {
    const bodyLabels = {
      slim: 'delgado',
      athletic: 'atlético',
      regular: 'regular',
      muscular: 'musculoso',
      plus: 'plus',
    }
    reasons.push(
      `Tu tipo de cuerpo ${bodyLabels[user.bodyType]} fue considerado en la recomendación`
    )
  }
  
  return reasons
}

/**
 * Determina talles alternativos
 */
function getAlternativeSizes(
  recommendedSize: string,
  availableSizes: string[]
): string[] {
  const index = availableSizes.indexOf(recommendedSize)
  const alternatives: string[] = []
  
  if (index > 0) {
    alternatives.push(availableSizes[index - 1])
  }
  if (index < availableSizes.length - 1) {
    alternatives.push(availableSizes[index + 1])
  }
  
  return alternatives
}

/**
 * Calcula la confianza de la recomendación
 */
function calculateConfidence(
  user: UserMeasurements,
  recommendedMeasurements: ProductMeasurements
): 'high' | 'medium' | 'low' {
  let score = 100
  
  // Penalizar si no tenemos tipo de cuerpo
  if (!user.bodyType) {
    score -= 15
  }
  
  // Penalizar si el usuario es muy alto o muy bajo
  if (user.height < 155 || user.height > 195) {
    score -= 20
  }
  
  // Penalizar si el IMC es extremo
  const bmi = calculateBMI(user.height, user.weight)
  if (bmi < 16 || bmi > 35) {
    score -= 25
  }
  
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

/**
 * Función principal: calcula el talle recomendado para un usuario
 */
export function calculateSizeRecommendation(
  user: UserMeasurements,
  category: string = 'hoodies'
): CalculatorResult {
  // Obtener las medidas para la categoría
  const measurements = STANDARD_MEASUREMENTS[category] || STANDARD_MEASUREMENTS.hoodies
  const availableSizes = Object.keys(measurements)
  
  // Estimar perímetro de pecho del usuario
  const userChest = user.chest || estimateChestCircumference(user)
  
  // Encontrar talle base
  const baseSize = findBaseSize(userChest, category, measurements)
  
  // Ajustar según preferencia de fit
  const recommendedSize = adjustForFitPreference(
    baseSize,
    user.fitPreference,
    availableSizes
  )
  
  // Obtener medidas del talle recomendado
  const recommendedMeasurements = measurements[recommendedSize]
  
  // Generar razones
  const reasons = generateReasons(user, recommendedSize, recommendedMeasurements)
  
  // Obtener talles alternativos
  const alternativeSizes = getAlternativeSizes(recommendedSize, availableSizes)
  
  // Calcular confianza
  const confidence = calculateConfidence(user, recommendedMeasurements)
  
  return {
    recommendedSize: {
      size: recommendedSize,
      confidence,
      reasons,
      alternativeSizes,
      measurements: recommendedMeasurements,
    },
    allSizes: measurements,
    category,
  }
}

/**
 * Calcula recomendaciones para todas las categorías
 */
export function calculateAllCategories(
  user: UserMeasurements
): Record<string, CalculatorResult> {
  const categories = Object.keys(STANDARD_MEASUREMENTS)
  const results: Record<string, CalculatorResult> = {}
  
  for (const category of categories) {
    results[category] = calculateSizeRecommendation(user, category)
  }
  
  return results
}
