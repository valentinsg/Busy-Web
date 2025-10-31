import esTranslations from '@/locales/es.json'

type Translations = typeof esTranslations
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
          : `${K}`
        : never
    }[keyof T]
  : never

export function useTranslations<Namespace extends keyof Translations>(
  namespace: Namespace
): (key: keyof Translations[Namespace], params?: Record<string, string | number>) => string {
  return (key: keyof Translations[Namespace], params?: Record<string, string | number>) => {
    const translations = esTranslations[namespace] as Record<string, string>
    let text = translations[key as string] || String(key)
    
    // Replace placeholders like {amount}, {count}, etc.
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value))
      })
    }
    
    return text
  }
}
