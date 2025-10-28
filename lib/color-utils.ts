/**
 * Color normalization utilities
 * Maps various color names to standard values for consistent filtering
 */

export type StandardColor = 
  | 'black'
  | 'white'
  | 'gray'
  | 'gray_light'
  | 'gray_dark'
  | 'blue'
  | 'navy'
  | 'light_blue'
  | 'red'
  | 'burgundy'
  | 'green'
  | 'teal'
  | 'mint'
  | 'yellow'
  | 'orange'
  | 'purple'
  | 'lilac'
  | 'pink'
  | 'brown'
  | 'beige'
  | 'cream'
  | 'sand'
  | 'khaki'

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
  'light gray': 'gray_light',
  'gris claro': 'gray_light',
  'dark gray': 'gray_dark',
  'gris oscuro': 'gray_dark',
  
  // Blue variants
  'blue': 'blue',
  'azul': 'blue',
  'bleu': 'blue',
  'navy': 'navy',
  'marino': 'navy',
  'celeste': 'light_blue',
  'sky': 'light_blue',
  
  // Red variants
  'red': 'red',
  'rojo': 'red',
  'rouge': 'red',
  'burgundy': 'burgundy',
  'bordo': 'burgundy',
  'vino': 'burgundy',
  
  // Green variants
  'green': 'green',
  'verde': 'green',
  'vert': 'green',
  'olive': 'khaki',
  'oliva': 'khaki',
  'teal': 'teal',
  'turquesa': 'teal',
  'mint': 'mint',
  'menta': 'mint',
  
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
  'lila': 'lilac',
  'lavender': 'lilac',
  
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
  'cream': 'cream',
  'crema': 'cream',
  'ivory': 'beige',
  'marfil': 'beige',
  'arena': 'sand',
  'sand': 'sand',
  'khaki': 'khaki',
  // common hexes mapping
  '#e8dccc': 'cream',
}

/**
 * Display names for standard colors (in Spanish)
 */
export const COLOR_DISPLAY_NAMES: Record<StandardColor, string> = {
  'black': 'Negro',
  'white': 'Blanco',
  'gray': 'Gris',
  'gray_light': 'Gris Claro',
  'gray_dark': 'Gris Oscuro',
  'blue': 'Azul',
  'navy': 'Azul Marino',
  'light_blue': 'Celeste',
  'red': 'Rojo',
  'burgundy': 'Bordó',
  'green': 'Verde',
  'teal': 'Turquesa',
  'mint': 'Menta',
  'yellow': 'Amarillo',
  'orange': 'Naranja',
  'purple': 'Violeta',
  'lilac': 'Lila',
  'pink': 'Rosa',
  'brown': 'Marrón',
  'beige': 'Beige',
  'cream': 'Crema',
  'sand': 'Arena',
  'khaki': 'Khaki',
}

/**
 * Hex color codes for standard colors
 */
export const COLOR_HEX: Record<StandardColor, string> = {
  'black': '#000000',
  'white': '#FFFFFF',
  'gray': '#6B7280',
  'gray_light': '#D1D5DB',
  'gray_dark': '#374151',
  'blue': '#3B82F6',
  'navy': '#1E3A8A',
  'light_blue': '#93C5FD',
  'red': '#EF4444',
  'burgundy': '#7F1D1D',
  'green': '#10B981',
  'teal': '#14B8A6',
  'mint': '#99F6E4',
  'yellow': '#F59E0B',
  'orange': '#F97316',
  'purple': '#8B5CF6',
  'lilac': '#C4B5FD',
  'pink': '#EC4899',
  'brown': '#92400E',
  'beige': '#D4C5B9',
  'cream': '#E8DCCC',
  'sand': '#E5D5B3',
  'khaki': '#B19F77',
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
    if (typeof standard === 'string' && (standard in COLOR_DISPLAY_NAMES)) normalized.add(standard as StandardColor)
    else if (color.startsWith('#')) {
      // try direct hex mapping fallback (exact matches in COLOR_MAP)
      const mapped = COLOR_MAP[color.toLowerCase()]
      if (mapped) normalized.add(mapped)
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

/** Fixed palette for Admin selectors (20 colores aprox.) */
export const COLOR_PALETTE: Array<{ key: StandardColor; name: string; hex: string }> = [
  { key: 'black', name: COLOR_DISPLAY_NAMES.black, hex: COLOR_HEX.black },
  { key: 'white', name: COLOR_DISPLAY_NAMES.white, hex: COLOR_HEX.white },
  { key: 'gray_dark', name: COLOR_DISPLAY_NAMES.gray_dark, hex: COLOR_HEX.gray_dark },
  { key: 'gray', name: COLOR_DISPLAY_NAMES.gray, hex: COLOR_HEX.gray },
  { key: 'gray_light', name: COLOR_DISPLAY_NAMES.gray_light, hex: COLOR_HEX.gray_light },
  { key: 'navy', name: COLOR_DISPLAY_NAMES.navy, hex: COLOR_HEX.navy },
  { key: 'blue', name: COLOR_DISPLAY_NAMES.blue, hex: COLOR_HEX.blue },
  { key: 'light_blue', name: COLOR_DISPLAY_NAMES.light_blue, hex: COLOR_HEX.light_blue },
  { key: 'red', name: COLOR_DISPLAY_NAMES.red, hex: COLOR_HEX.red },
  { key: 'burgundy', name: COLOR_DISPLAY_NAMES.burgundy, hex: COLOR_HEX.burgundy },
  { key: 'green', name: COLOR_DISPLAY_NAMES.green, hex: COLOR_HEX.green },
  { key: 'teal', name: COLOR_DISPLAY_NAMES.teal, hex: COLOR_HEX.teal },
  { key: 'mint', name: COLOR_DISPLAY_NAMES.mint, hex: COLOR_HEX.mint },
  { key: 'yellow', name: COLOR_DISPLAY_NAMES.yellow, hex: COLOR_HEX.yellow },
  { key: 'orange', name: COLOR_DISPLAY_NAMES.orange, hex: COLOR_HEX.orange },
  { key: 'purple', name: COLOR_DISPLAY_NAMES.purple, hex: COLOR_HEX.purple },
  { key: 'lilac', name: COLOR_DISPLAY_NAMES.lilac, hex: COLOR_HEX.lilac },
  { key: 'pink', name: COLOR_DISPLAY_NAMES.pink, hex: COLOR_HEX.pink },
  { key: 'brown', name: COLOR_DISPLAY_NAMES.brown, hex: COLOR_HEX.brown },
  { key: 'beige', name: COLOR_DISPLAY_NAMES.beige, hex: COLOR_HEX.beige },
  { key: 'cream', name: COLOR_DISPLAY_NAMES.cream, hex: COLOR_HEX.cream },
  { key: 'sand', name: COLOR_DISPLAY_NAMES.sand, hex: COLOR_HEX.sand },
  { key: 'khaki', name: COLOR_DISPLAY_NAMES.khaki, hex: COLOR_HEX.khaki },
]
