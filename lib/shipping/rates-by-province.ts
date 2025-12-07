/**
 * Shipping Rates by Province (Argentina)
 *
 * Tarifas estimadas basadas en cotizaciones reales de OCA/Correo Argentino
 * desde Mar del Plata hacia cada provincia.
 *
 * Estas tarifas son aproximadas y se usan como fallback cuando
 * la API de Envia no está disponible.
 *
 * Base: Paquete estándar de ropa (1kg, 30x25x10cm)
 * Precios en ARS, actualizados Diciembre 2024
 */

export type ProvinceRate = {
  name: string
  code: string
  /** Tarifa base para 1kg */
  baseRate: number
  /** Costo adicional por kg extra */
  perKgExtra: number
  /** Días estimados de entrega */
  deliveryDays: string
  /** Zona (para agrupar) */
  zone: "local" | "cercana" | "media" | "lejana"
}

/**
 * Normaliza el nombre de provincia para comparación
 * - Lowercase
 * - Sin acentos
 * - Sin espacios extra
 */
export function normalizeProvince(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, " ")
}

/**
 * Tarifas por provincia
 * Basadas en cotización real de Envia.com (Dic 2024)
 * Origen: Mar del Plata, Buenos Aires
 */
export const PROVINCE_RATES: ProvinceRate[] = [
  // ZONA LOCAL - Mar del Plata y alrededores
  {
    name: "Mar del Plata",
    code: "MDP",
    baseRate: 3000,
    perKgExtra: 500,
    deliveryDays: "1-2 días",
    zone: "local",
  },

  // ZONA CERCANA - Buenos Aires y alrededores
  {
    name: "Buenos Aires",
    code: "BA",
    baseRate: 8000,
    perKgExtra: 1000,
    deliveryDays: "2-4 días",
    zone: "cercana",
  },
  {
    name: "Ciudad Autonoma de Buenos Aires",
    code: "CABA",
    baseRate: 11000,
    perKgExtra: 1200,
    deliveryDays: "3-5 días",
    zone: "cercana",
  },
  {
    name: "Capital Federal",
    code: "CF",
    baseRate: 11000,
    perKgExtra: 1200,
    deliveryDays: "3-5 días",
    zone: "cercana",
  },
  {
    name: "La Pampa",
    code: "LP",
    baseRate: 12000,
    perKgExtra: 1500,
    deliveryDays: "4-6 días",
    zone: "cercana",
  },

  // ZONA MEDIA - Centro del país
  {
    name: "Cordoba",
    code: "CB",
    baseRate: 13000,
    perKgExtra: 1500,
    deliveryDays: "4-6 días",
    zone: "media",
  },
  {
    name: "Santa Fe",
    code: "SF",
    baseRate: 13000,
    perKgExtra: 1500,
    deliveryDays: "4-6 días",
    zone: "media",
  },
  {
    name: "Entre Rios",
    code: "ER",
    baseRate: 13000,
    perKgExtra: 1500,
    deliveryDays: "4-6 días",
    zone: "media",
  },
  {
    name: "Mendoza",
    code: "MZ",
    baseRate: 14000,
    perKgExtra: 1800,
    deliveryDays: "5-7 días",
    zone: "media",
  },
  {
    name: "San Luis",
    code: "SL",
    baseRate: 14000,
    perKgExtra: 1800,
    deliveryDays: "5-7 días",
    zone: "media",
  },
  {
    name: "San Juan",
    code: "SJ",
    baseRate: 15000,
    perKgExtra: 1800,
    deliveryDays: "5-7 días",
    zone: "media",
  },
  {
    name: "La Rioja",
    code: "LR",
    baseRate: 15000,
    perKgExtra: 1800,
    deliveryDays: "5-7 días",
    zone: "media",
  },
  {
    name: "Catamarca",
    code: "CA",
    baseRate: 15000,
    perKgExtra: 1800,
    deliveryDays: "5-7 días",
    zone: "media",
  },
  {
    name: "Rio Negro",
    code: "RN",
    baseRate: 14000,
    perKgExtra: 1800,
    deliveryDays: "5-7 días",
    zone: "media",
  },
  {
    name: "Neuquen",
    code: "NQ",
    baseRate: 14000,
    perKgExtra: 1800,
    deliveryDays: "5-7 días",
    zone: "media",
  },

  // ZONA LEJANA - Norte y Sur
  {
    name: "Tucuman",
    code: "TU",
    baseRate: 16000,
    perKgExtra: 2000,
    deliveryDays: "5-8 días",
    zone: "lejana",
  },
  {
    name: "Salta",
    code: "SA",
    baseRate: 17000,
    perKgExtra: 2000,
    deliveryDays: "6-8 días",
    zone: "lejana",
  },
  {
    name: "Jujuy",
    code: "JU",
    baseRate: 17000,
    perKgExtra: 2000,
    deliveryDays: "6-8 días",
    zone: "lejana",
  },
  {
    name: "Santiago del Estero",
    code: "SE",
    baseRate: 16000,
    perKgExtra: 2000,
    deliveryDays: "5-8 días",
    zone: "lejana",
  },
  {
    name: "Chaco",
    code: "CH",
    baseRate: 16000,
    perKgExtra: 2000,
    deliveryDays: "5-8 días",
    zone: "lejana",
  },
  {
    name: "Formosa",
    code: "FO",
    baseRate: 17000,
    perKgExtra: 2000,
    deliveryDays: "6-8 días",
    zone: "lejana",
  },
  {
    name: "Corrientes",
    code: "CR",
    baseRate: 16000,
    perKgExtra: 2000,
    deliveryDays: "5-8 días",
    zone: "lejana",
  },
  {
    name: "Misiones",
    code: "MI",
    baseRate: 17000,
    perKgExtra: 2000,
    deliveryDays: "6-8 días",
    zone: "lejana",
  },
  {
    name: "Chubut",
    code: "CT",
    baseRate: 18000,
    perKgExtra: 2500,
    deliveryDays: "7-10 días",
    zone: "lejana",
  },
  {
    name: "Santa Cruz",
    code: "SC",
    baseRate: 20000,
    perKgExtra: 3000,
    deliveryDays: "8-12 días",
    zone: "lejana",
  },
  {
    name: "Tierra del Fuego",
    code: "TF",
    baseRate: 22000,
    perKgExtra: 3500,
    deliveryDays: "10-15 días",
    zone: "lejana",
  },
]

// Aliases para ciudades/variantes comunes
const CITY_TO_PROVINCE: Record<string, string> = {
  // Buenos Aires
  "caba": "Capital Federal",
  "capital federal": "Capital Federal",
  "ciudad de buenos aires": "Capital Federal",
  "buenos aires": "Buenos Aires",
  "gba": "Buenos Aires",
  "gran buenos aires": "Buenos Aires",
  "la plata": "Buenos Aires",
  "quilmes": "Buenos Aires",
  "lomas de zamora": "Buenos Aires",
  "moron": "Buenos Aires",
  "avellaneda": "Buenos Aires",
  "lanus": "Buenos Aires",
  "mar del plata": "Mar del Plata",
  "mdp": "Mar del Plata",
  "mardel": "Mar del Plata",
  "bahia blanca": "Buenos Aires",

  // Córdoba
  "cordoba": "Cordoba",
  "córdoba": "Cordoba",
  "villa carlos paz": "Cordoba",

  // Santa Fe
  "rosario": "Santa Fe",
  "santa fe": "Santa Fe",

  // Mendoza
  "mendoza": "Mendoza",

  // Tucumán
  "tucuman": "Tucuman",
  "tucumán": "Tucuman",
  "san miguel de tucuman": "Tucuman",

  // Otros
  "neuquen": "Neuquen",
  "neuquén": "Neuquen",
  "ushuaia": "Tierra del Fuego",
  "rio gallegos": "Santa Cruz",
  "comodoro rivadavia": "Chubut",
  "bariloche": "Rio Negro",
  "san carlos de bariloche": "Rio Negro",
}

/**
 * Encuentra la tarifa para una provincia o ciudad
 */
export function findProvinceRate(input: string): ProvinceRate | null {
  const normalized = normalizeProvince(input)

  // Primero buscar en aliases de ciudades
  const provinceName = CITY_TO_PROVINCE[normalized]
  if (provinceName) {
    const rate = PROVINCE_RATES.find(
      p => normalizeProvince(p.name) === normalizeProvince(provinceName)
    )
    if (rate) return rate
  }

  // Buscar match exacto en provincias
  const exactMatch = PROVINCE_RATES.find(
    p => normalizeProvince(p.name) === normalized || p.code.toLowerCase() === normalized
  )
  if (exactMatch) return exactMatch

  // Buscar match parcial
  const partialMatch = PROVINCE_RATES.find(
    p => normalizeProvince(p.name).includes(normalized) || normalized.includes(normalizeProvince(p.name))
  )
  if (partialMatch) return partialMatch

  return null
}

/**
 * Calcula el costo de envío basado en provincia y peso
 */
export function calculateShippingByProvince(params: {
  province: string
  city?: string
  weightKg?: number
}): {
  rate: ProvinceRate | null
  cost: number
  deliveryDays: string
  source: "province_table"
} {
  const { province, city, weightKg = 1 } = params

  // Intentar primero con ciudad, luego con provincia
  let rate = city ? findProvinceRate(city) : null
  if (!rate) {
    rate = findProvinceRate(province)
  }

  // Si no encontramos, usar tarifa por defecto (zona media)
  if (!rate) {
    return {
      rate: null,
      cost: 15000 + Math.max(0, weightKg - 1) * 2000,
      deliveryDays: "5-8 días",
      source: "province_table",
    }
  }

  // Calcular costo: base + extra por kg adicional
  const extraKg = Math.max(0, weightKg - 1)
  const cost = rate.baseRate + extraKg * rate.perKgExtra

  return {
    rate,
    cost: Math.round(cost),
    deliveryDays: rate.deliveryDays,
    source: "province_table",
  }
}

/**
 * Obtiene todas las opciones de envío para una provincia
 * Simula múltiples carriers con diferentes precios/tiempos
 */
export function getShippingOptionsByProvince(params: {
  province: string
  city?: string
  weightKg?: number
  totalValue?: number
  freeThreshold?: number
}): Array<{
  carrier: string
  service: string
  serviceName: string
  price: number
  currency: string
  estimatedDelivery: string
}> {
  const { province, city, weightKg = 1, totalValue = 0, freeThreshold = 100000 } = params

  const base = calculateShippingByProvince({ province, city, weightKg })
  const isFree = totalValue >= freeThreshold

  // Generar opciones basadas en la tarifa base
  const options = [
    {
      carrier: "correo_argentino",
      service: "standard",
      serviceName: "Correo Argentino Estándar",
      price: isFree ? 0 : base.cost,
      currency: "ARS",
      estimatedDelivery: base.deliveryDays,
    },
  ]

  // Agregar opción express si no es zona local
  if (base.rate?.zone !== "local") {
    // Parse delivery days safely (format: "X-Y días")
    const daysMatch = base.deliveryDays.match(/(\d+)-(\d+)/)
    const minDays = daysMatch ? Math.max(1, parseInt(daysMatch[1]) - 1) : 2
    const maxDays = daysMatch ? Math.max(2, parseInt(daysMatch[2]) - 1) : 4

    options.push({
      carrier: "oca",
      service: "express",
      serviceName: "OCA Express",
      price: isFree ? 0 : Math.round(base.cost * 1.3),
      currency: "ARS",
      estimatedDelivery: `${minDays}-${maxDays} días`,
    })
  }

  // Ordenar por precio
  return options.sort((a, b) => a.price - b.price)
}
