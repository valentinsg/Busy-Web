// =====================================================
// NEWSLETTER WELCOME EMAIL TEMPLATE
// Email de bienvenida para nuevos suscriptores
// =====================================================

import { createEmailLayout, createButton } from './base'
import type { NewsletterWelcomeEmailData } from '@/types/email'

export function createNewsletterWelcomeEmail(data: NewsletterWelcomeEmailData): string {
  const greeting = data.firstName ? `Hola ${data.firstName}` : 'Hola'

  const content = `
    <h1 class="email-title">🎉 ¡Bienvenido a Busy Streetwear!</h1>
    
    <p class="email-text">
      ${greeting}, gracias por unirte a nuestra comunidad. Estamos emocionados de tenerte con nosotros.
    </p>

    <div style="background: linear-gradient(135deg, #000000 0%, #FF6B00 100%); padding: 32px; border-radius: 12px; text-align: center; margin: 32px 0;">
      <p style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
        🎁 Regalo de Bienvenida
      </p>
      <p style="color: white; font-size: 32px; font-weight: 900; margin: 0 0 8px 0; letter-spacing: 2px;">
        15% OFF
      </p>
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 20px 0;">
        En tu primera compra
      </p>
      <div style="background-color: white; padding: 12px 24px; border-radius: 8px; display: inline-block;">
        <p style="margin: 0; font-size: 24px; font-weight: 700; color: #000000; letter-spacing: 2px;">
          WELCOME15
        </p>
      </div>
    </div>

    <h2 style="font-size: 20px; font-weight: 600; margin: 32px 0 16px 0; text-align: center;">
      ¿Qué puedes esperar de nosotros?
    </h2>

    <div style="display: grid; gap: 16px; margin: 24px 0;">
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #FF6B00;">
        <p style="margin: 0 0 8px 0; font-weight: 600;">🔥 Lanzamientos Exclusivos</p>
        <p style="margin: 0; font-size: 14px; color: #666;">
          Sé el primero en conocer nuestras nuevas colecciones y drops limitados.
        </p>
      </div>

      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #FF6B00;">
        <p style="margin: 0 0 8px 0; font-weight: 600;">💰 Ofertas Especiales</p>
        <p style="margin: 0; font-size: 14px; color: #666;">
          Descuentos exclusivos y promociones solo para suscriptores.
        </p>
      </div>

      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #FF6B00;">
        <p style="margin: 0 0 8px 0; font-weight: 600;">🎵 Playlists Curadas</p>
        <p style="margin: 0; font-size: 14px; color: #666;">
          Música urbana seleccionada para acompañar tu estilo de vida.
        </p>
      </div>

      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #FF6B00;">
        <p style="margin: 0 0 8px 0; font-weight: 600;">👕 Consejos de Estilo</p>
        <p style="margin: 0; font-size: 14px; color: #666;">
          Tips, tendencias y guías para lucir tu mejor versión.
        </p>
      </div>
    </div>

    <div style="text-align: center; margin: 40px 0;">
      ${createButton({
        text: 'Explorar Colección',
        url: 'https://busy.com.ar/products',
        accent: true,
      })}
    </div>

    <hr class="email-divider">

    <p class="email-text-muted" style="text-align: center;">
      Síguenos en redes sociales para más contenido exclusivo:<br>
      📸 Instagram | 🎵 Spotify | 🎥 YouTube
    </p>

    ${
      data.unsubscribeUrl
        ? `
    <p class="email-text-muted" style="text-align: center; font-size: 11px;">
      Si ya no deseas recibir estos emails, puedes <a href="${data.unsubscribeUrl}" style="color: #666;">darte de baja aquí</a>.
    </p>
    `
        : ''
    }
  `

  return createEmailLayout({
    title: '¡Bienvenido a Busy Streetwear!',
    preheader: '🎁 Tu código de descuento WELCOME15 te está esperando',
    content,
  })
}
