export type PopoverType = 'simple' | 'discount' | 'email-gate' | 'newsletter' | 'custom'

export type Popover = {
  id: string
  title: string
  body: string | null
  discount_code: string | null
  image_url: string | null
  type: PopoverType // Tipo de interacción
  require_email: boolean // Si requiere email antes de mostrar código
  show_newsletter: boolean // Si muestra formulario de newsletter
  cta_text: string | null // Texto del botón CTA personalizado
  cta_url: string | null // URL del botón CTA
  delay_seconds: number // Segundos antes de mostrar el popover
  enabled: boolean
  priority: number
  start_at: string | null
  end_at: string | null
  sections: string[] | null
  paths: string[] | null
  created_at: string
  updated_at: string
}
