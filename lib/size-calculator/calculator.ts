import type {
  UserMeasurements,
  ProductMeasurements,
  SizeRecommendation,
  CalculatorResult,
} from '@/types/size-calculator'

/**
 * Tabla de medidas estándar MEJORADA para productos Busy
 * Basada en medidas reales de streetwear argentino
 * NOTA: Estas son medidas de la PRENDA (ancho x 2), no del cuerpo
 */
const STANDARD_MEASUREMENTS: Record<string, Record<string, ProductMeasurements>> = {
  hoodies: {
    // Medidas más realistas para buzos oversize/streetwear
    S: { chest: 108, length: 68, shoulders: 52 },   // ~54cm ancho (108/2)
    M: { chest: 114, length: 70, shoulders: 54 },   // ~57cm ancho
    L: { chest: 120, length: 72, shoulders: 56 },   // ~60cm ancho
    XL: { chest: 126, length: 74, shoulders: 58 },  // ~63cm ancho
  },
  tshirts: {
    // Remeras más ajustadas que buzos
    S: { chest: 100, length: 68, shoulders: 48 },
    M: { chest: 106, length: 70, shoulders: 50 },
    L: { chest: 112, length: 72, shoulders: 52 },
    XL: { chest: 118, length: 74, shoulders: 54 },
    XXL: { chest: 124, length: 76, shoulders: 56 },
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
 * Fórmula mejorada basada en datos antropométricos reales
 */
function estimateChestCircumference(user: UserMeasurements): number {
  const bmi = calculateBMI(user.height, user.weight)
  
  // Fórmula base más precisa
  // Para hombres: perímetro pecho ≈ 0.45 * altura + 0.35 * peso + ajustes
  let baseChest = (user.height * 0.45) + (user.weight * 0.35)
  
  // Ajuste por BMI (más granular)
  if (bmi < 18.5) {
    baseChest -= 6 // Delgado
  } else if (bmi >= 18.5 && bmi < 22) {
    baseChest -= 2 // Delgado-normal
  } else if (bmi >= 22 && bmi < 25) {
    baseChest += 0 // Normal
  } else if (bmi >= 25 && bmi < 27) {
    baseChest += 4 // Normal-robusto
  } else if (bmi >= 27 && bmi < 30) {
    baseChest += 8 // Robusto
  } else {
    baseChest += 14 // Plus
  }
  
  // Ajuste por tipo de cuerpo (más significativo)
  if (user.bodyType === 'slim') {
    baseChest -= 5
  } else if (user.bodyType === 'athletic') {
    baseChest += 3 // Atlético tiene más pecho/espalda
  } else if (user.bodyType === 'muscular') {
    baseChest += 7 // Musculoso necesita más espacio
  } else if (user.bodyType === 'plus') {
    baseChest += 10
  }
  
  return Math.round(baseChest)
}

/**
 * Ajusta el talle recomendado según la preferencia de fit del usuario
 * MEJORADO: Ajustes más agresivos para fit loose/oversized
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
  } else if (fitPreference === 'loose') {
    // Prefiere holgado: sube uno o dos talles
    const targetIndex = Math.min(sizeIndex + 1, availableSizes.length - 1)
    return availableSizes[targetIndex]
  } else if (fitPreference === 'oversized') {
    // Prefiere oversized: sube dos talles mínimo
    const targetIndex = Math.min(sizeIndex + 2, availableSizes.length - 1)
    return availableSizes[targetIndex]
  }
  
  // Regular: devuelve el talle base
  return baseSize
}

/**
 * Encuentra el talle base según las medidas del usuario
 * MEJORADO: La prenda debe ser MÁS GRANDE que el perímetro del usuario
 */
function findBaseSize(
  userChest: number,
  category: string,
  measurements: Record<string, ProductMeasurements>
): string {
  const sizes = Object.keys(measurements)
  
  // IMPORTANTE: Necesitamos espacio extra para comodidad
  // Mínimo 10-15cm de holgura para que no quede ajustado
  const minComfortGap = 12 // cm de holgura mínima
  const targetChest = userChest + minComfortGap
  
  // Buscar el primer talle que sea >= al target
  for (const size of sizes) {
    if (measurements[size].chest >= targetChest) {
      return size
    }
  }
  
  // Si ninguno alcanza, devolver el más grande
  return sizes[sizes.length - 1]
}

/**
 * Genera razones explicativas para la recomendación
 * MEJORADO: Razones más específicas y útiles
 */
function generateReasons(
  user: UserMeasurements,
  recommendedSize: string,
  measurements: ProductMeasurements,
  estimatedChest: number
): string[] {
  const reasons: string[] = []
  const bmi = calculateBMI(user.height, user.weight)
  
  // Razón principal: medidas
  const chestWidth = Math.round(measurements.chest / 2)
  reasons.push(
    `Talle ${recommendedSize}: ${chestWidth}cm de ancho (perímetro ${measurements.chest}cm) - ideal para tu contextura`
  )
  
  // Razón por altura y largo de prenda
  if (user.height >= 180) {
    reasons.push(`Con ${user.height}cm de altura, el largo de ${measurements.length}cm te quedará bien`)
  } else if (user.height < 165) {
    reasons.push(`Tu altura de ${user.height}cm se adapta bien al largo de ${measurements.length}cm`)
  }
  
  // Razón por preferencia de fit
  const fitLabels = {
    tight: 'ajustado',
    regular: 'regular',
    loose: 'holgado',
    oversized: 'oversized',
  }
  
  if (user.fitPreference === 'loose' || user.fitPreference === 'oversized') {
    reasons.push(
      `Ajustado para fit ${fitLabels[user.fitPreference]} - tendrás el espacio que buscás`
    )
  } else if (user.fitPreference === 'tight') {
    reasons.push(`Fit ${fitLabels[user.fitPreference]} - quedará pegado al cuerpo`)
  } else {
    reasons.push(`Fit ${fitLabels[user.fitPreference]} - ni muy ajustado ni muy holgado`)
  }
  
  // Razón por IMC/contextura
  if (bmi >= 25 && user.bodyType !== 'muscular') {
    reasons.push(`Consideramos tu contextura para garantizar comodidad`)
  } else if (user.bodyType === 'muscular' || user.bodyType === 'athletic') {
    reasons.push(`Espacio extra para hombros y pecho desarrollados`)
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
  const reasons = generateReasons(user, recommendedSize, recommendedMeasurements, userChest)
  
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
