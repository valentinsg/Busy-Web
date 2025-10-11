// =====================================================
// TEST EMAIL TEMPLATE
// Email simple para testing del sistema
// =====================================================

import { createEmailLayout, createButton, createInfoBox } from './base'
import type { TestEmailData } from '@/types/email'

export function createTestEmail(data: TestEmailData): string {
  const content = `
    <h1 class="email-title">🧪 Email de Prueba</h1>
    
    <p class="email-text">
      Este es un email de prueba del sistema de notificaciones de Busy Streetwear.
    </p>

    ${createInfoBox(
      `
      <p style="margin: 0 0 8px 0;"><strong>Mensaje:</strong> ${data.message}</p>
      <p style="margin: 0;"><strong>Timestamp:</strong> ${data.timestamp}</p>
    `,
      'success'
    )}

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px;">✅ Sistema Funcionando Correctamente</h3>
      <p style="margin: 0; font-size: 14px; color: #666;">
        Si estás viendo este email, significa que:
      </p>
      <ul style="margin: 12px 0 0 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">✓ La integración con Resend está configurada</li>
        <li style="margin-bottom: 8px;">✓ Los templates HTML se renderizan correctamente</li>
        <li style="margin-bottom: 8px;">✓ El sistema de envío está operativo</li>
        <li>✓ Los logs se están registrando</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      ${createButton({
        text: 'Ir al Panel Admin',
        url: 'https://busy.com.ar/admin',
        accent: true,
      })}
    </div>

    <hr class="email-divider">

    <p class="email-text-muted">
      💡 <strong>Próximos pasos:</strong> Configura las preferencias de email para cada tipo de notificación 
      desde el panel de administración.
    </p>
  `

  return createEmailLayout({
    title: 'Test Email - Busy Streetwear',
    preheader: 'Email de prueba del sistema de notificaciones',
    content,
  })
}
