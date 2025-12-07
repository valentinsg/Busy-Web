// Rangos de códigos postales por provincia argentina
// Fuente: Correo Argentino CPA (Código Postal Argentino)

export const POSTAL_CODE_RANGES: Record<string, { min: number; max: number }[]> = {
  "Buenos Aires": [
    { min: 1601, max: 1999 }, // GBA y alrededores
    { min: 2700, max: 2942 }, // Noroeste BA
    { min: 6000, max: 6749 }, // Centro-oeste BA
    { min: 7000, max: 7929 }, // Costa atlántica y sur BA
    { min: 8000, max: 8199 }, // Sur BA (Bahía Blanca, etc)
  ],
  "Ciudad Autónoma de Buenos Aires": [
    { min: 1000, max: 1499 }, // CABA
  ],
  "Catamarca": [
    { min: 4700, max: 4751 },
  ],
  "Chaco": [
    { min: 3500, max: 3749 },
  ],
  "Chubut": [
    { min: 9000, max: 9220 },
  ],
  "Córdoba": [
    { min: 5000, max: 5999 },
  ],
  "Corrientes": [
    { min: 3400, max: 3485 },
  ],
  "Entre Ríos": [
    { min: 2800, max: 2849 }, // Parte norte
    { min: 3100, max: 3299 }, // Centro y sur
  ],
  "Formosa": [
    { min: 3600, max: 3636 },
  ],
  "Jujuy": [
    { min: 4600, max: 4655 },
  ],
  "La Pampa": [
    { min: 6200, max: 6389 },
    { min: 8200, max: 8399 },
  ],
  "La Rioja": [
    { min: 5300, max: 5386 },
  ],
  "Mendoza": [
    { min: 5500, max: 5621 },
  ],
  "Misiones": [
    { min: 3300, max: 3384 },
  ],
  "Neuquén": [
    { min: 8300, max: 8399 },
  ],
  "Río Negro": [
    { min: 8400, max: 8536 },
  ],
  "Salta": [
    { min: 4400, max: 4568 },
  ],
  "San Juan": [
    { min: 5400, max: 5467 },
  ],
  "San Luis": [
    { min: 5700, max: 5773 },
  ],
  "Santa Cruz": [
    { min: 9300, max: 9420 },
  ],
  "Santa Fe": [
    { min: 2000, max: 2699 }, // Sur SF
    { min: 3000, max: 3099 }, // Centro SF (Santa Fe capital, etc)
  ],
  "Santiago del Estero": [
    { min: 4200, max: 4356 },
  ],
  "Tierra del Fuego": [
    { min: 9400, max: 9420 },
  ],
  "Tucumán": [
    { min: 4000, max: 4178 },
  ],
}

/**
 * Valida si un código postal corresponde a una provincia
 */
export function isPostalCodeValidForProvince(postalCode: string, province: string): boolean {
  const code = parseInt(postalCode, 10)
  if (isNaN(code)) return false

  const ranges = POSTAL_CODE_RANGES[province]
  if (!ranges) return true // Si no tenemos datos, aceptamos

  return ranges.some(range => code >= range.min && code <= range.max)
}

/**
 * Obtiene la provincia probable basándose en el código postal
 */
export function getProvinceFromPostalCode(postalCode: string): string | null {
  const code = parseInt(postalCode, 10)
  if (isNaN(code)) return null

  for (const [province, ranges] of Object.entries(POSTAL_CODE_RANGES)) {
    if (ranges.some(range => code >= range.min && code <= range.max)) {
      return province
    }
  }

  return null
}

/**
 * Verifica si el código postal es de Mar del Plata
 * Mar del Plata: 7600-7613
 */
export function isMarDelPlataPostalCode(postalCode: string): boolean {
  const code = parseInt(postalCode, 10)
  if (isNaN(code)) return false
  return code >= 7600 && code <= 7613
}
