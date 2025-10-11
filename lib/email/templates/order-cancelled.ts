// =====================================================
// ORDER CANCELLED EMAIL TEMPLATE
// Email para notificar orden cancelada
// =====================================================

import { createEmailLayout, createButton, createInfoBox } from './base'
import type { OrderCancelledEmailData } from '@/types/email'

export function createOrderCancelledEmail(data: OrderCancelledEmailData): string {
  const content = `
    <h1 class="email-title">❌ Orden Cancelada</h1>
    
    <p class="email-text">
      Una orden ha sido cancelada. Revisa los detalles para tomar las acciones necesarias.
    </p>

    ${createInfoBox(
      `
      <p style="margin: 0 0 8px 0;"><strong>Orden:</strong> #${data.orderNumber}</p>
      <p style="margin: 0 0 8px 0;"><strong>Cliente:</strong> ${data.customerName}</p>
      <p style="margin: 0 0 8px 0;"><strong>Monto:</strong> ${data.currency} ${data.total.toFixed(2)}</p>
      ${data.reason ? `<p style="margin: 0;"><strong>Motivo:</strong> ${data.reason}</p>` : ''}
    `,
      'warning'
    )}

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px;">📋 Acciones a realizar:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">✅ Verifica si ya se procesó el pago</li>
        <li style="margin-bottom: 8px;">💰 Procesa el reembolso si corresponde</li>
        <li style="margin-bottom: 8px;">📦 Cancela el envío si ya fue preparado</li>
        <li style="margin-bottom: 8px;">📊 Actualiza el inventario</li>
        <li>📧 Contacta al cliente si es necesario</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      ${createButton({
        text: 'Ver Detalles de la Orden',
        url: data.actionUrl,
        accent: false,
      })}
    </div>

    <hr class="email-divider">

    <p class="email-text-muted">
      💡 <strong>Nota:</strong> Las cancelaciones pueden afectar tus métricas de conversión. 
      Analiza el motivo de la cancelación para mejorar tu proceso de ventas.
    </p>
  `

  return createEmailLayout({
    title: `Orden Cancelada #${data.orderNumber} - Busy Streetwear`,
    preheader: `${data.customerName} canceló su orden por ${data.currency} ${data.total.toFixed(2)}`,
    content,
  })
}
