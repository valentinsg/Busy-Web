/**
 * Color normalization utilities
 * Maps various color names to standard values for consistent filtering
 */

export type StandardColor = 
  | 'black'
  | 'white'
  | 'gray'
  | 'blue'
  | 'red'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'beige'

/**
 * Color mapping: maps various color names/aliases to standard colors
 */
const COLOR_MAP: Record<string, StandardColor> = {
  // Black variants
  'black': 'black',
  'negro': 'black',
  'noir': 'black',
  
  // White variants
  'white': 'white',
  'blanco': 'white',
  'blanc': 'white',
  
  // Gray variants
  'gray': 'gray',
  'grey': 'gray',
  'gris': 'gray',
  
  // Blue variants
  'blue': 'blue',
  'azul': 'blue',
  'bleu': 'blue',
  'navy': 'blue',
  'marino': 'blue',
  'celeste': 'blue',
  'sky': 'blue',
  
  // Red variants
  'red': 'red',
  'rojo': 'red',
  'rouge': 'red',
  'burgundy': 'red',
  'bordo': 'red',
  'vino': 'red',
  
  // Green variants
  'green': 'green',
  'verde': 'green',
  'vert': 'green',
  'olive': 'green',
  'oliva': 'green',
  
  // Yellow variants
  'yellow': 'yellow',
  'amarillo': 'yellow',
  'jaune': 'yellow',
  'mustard': 'yellow',
  'mostaza': 'yellow',
  
  // Orange variants
  'orange': 'orange',
  'naranja': 'orange',
  
  // Purple variants
  'purple': 'purple',
  'violeta': 'purple',
  'violet': 'purple',
  'morado': 'purple',
  'lila': 'purple',
  'lavender': 'purple',
  
  // Pink variants
  'pink': 'pink',
  'rosa': 'pink',
  'rose': 'pink',
  
  // Brown variants
  'brown': 'brown',
  'marron': 'brown',
  'café': 'brown',
  'camel': 'brown',
  'tan': 'brown',
  
  // Beige variants
  'beige': 'beige',
  'cream': 'beige',
  'crema': 'beige',
  'ivory': 'beige',
  'marfil': 'beige',
}

/**
 * Display names for standard colors (in Spanish)
 */
export const COLOR_DISPLAY_NAMES: Record<StandardColor, string> = {
  'black': 'Negro',
  'white': 'Blanco',
  'gray': 'Gris',
  'blue': 'Azul',
  'red': 'Rojo',
  'green': 'Verde',
  'yellow': 'Amarillo',
  'orange': 'Naranja',
  'purple': 'Violeta',
  'pink': 'Rosa',
  'brown': 'Marrón',
  'beige': 'Beige',
}

/**
 * Hex color codes for standard colors
 */
export const COLOR_HEX: Record<StandardColor, string> = {
  'black': '#000000',
  'white': '#FFFFFF',
  'gray': '#6B7280',
  'blue': '#3B82F6',
  'red': '#EF4444',
  'green': '#10B981',
  'yellow': '#F59E0B',
  'orange': '#F97316',
  'purple': '#8B5CF6',
  'pink': '#EC4899',
  'brown': '#92400E',
  'beige': '#D4C5B9',
}

/**
 * Normalizes a color name to a standard color
 * @param color - Raw color name from product
 * @returns Standard color or the original if no mapping exists
 */
export function normalizeColor(color: string): StandardColor | string {
  const normalized = color.toLowerCase().trim()
  return COLOR_MAP[normalized] || color
}

/**
 * Normalizes an array of colors and removes duplicates
 * @param colors - Array of raw color names
 * @returns Array of unique standard colors
 */
export function normalizeColors(colors: string[]): StandardColor[] {
  const normalized = new Set<StandardColor>()
  
  for (const color of colors) {
    const standard = normalizeColor(color)
    if (typeof standard === 'string' && standard in COLOR_DISPLAY_NAMES) {
      normalized.add(standard as StandardColor)
    }
  }
  
  return Array.from(normalized)
}

/**
 * Gets the display name for a color
 * @param color - Standard color or raw color name
 * @returns Display name in Spanish
 */
export function getColorDisplayName(color: string): string {
  const normalized = normalizeColor(color)
  if (typeof normalized === 'string' && normalized in COLOR_DISPLAY_NAMES) {
    return COLOR_DISPLAY_NAMES[normalized as StandardColor]
  }
  // Capitalize first letter if no mapping
  return color.charAt(0).toUpperCase() + color.slice(1)
}

/**
 * Gets the hex code for a color
 * @param color - Standard color or raw color name
 * @returns Hex color code
 */
export function getColorHex(color: string): string {
  const normalized = normalizeColor(color)
  if (typeof normalized === 'string' && normalized in COLOR_HEX) {
    return COLOR_HEX[normalized as StandardColor]
  }
  // Return the original color if it looks like a hex code
  if (color.startsWith('#')) {
    return color
  }
  // Default to gray
  return COLOR_HEX.gray
}
