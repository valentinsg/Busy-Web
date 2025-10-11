// =====================================================
// PENDING TRANSFER EMAIL TEMPLATE
// Email para notificar transferencia pendiente
// =====================================================

import { createEmailLayout, createButton, createInfoBox } from './base'
import type { PendingTransferEmailData } from '@/types/email'

export function createPendingTransferEmail(data: PendingTransferEmailData): string {
  const content = `
    <h1 class="email-title">💳 Transferencia Pendiente</h1>
    
    <p class="email-text">
      Hay una orden esperando confirmación de transferencia bancaria.
    </p>

    ${createInfoBox(
      `
      <p style="margin: 0 0 8px 0;"><strong>Orden:</strong> #${data.orderNumber}</p>
      <p style="margin: 0 0 8px 0;"><strong>Cliente:</strong> ${data.customerName}</p>
      <p style="margin: 0;"><strong>Monto:</strong> <span style="font-size: 20px; font-weight: 700; color: #FF6B00;">${data.currency} ${data.total.toFixed(2)}</span></p>
    `,
      'warning'
    )}

    <p class="email-text">
      El cliente ha seleccionado <strong>transferencia bancaria</strong> como método de pago. 
      Debes verificar que el pago haya sido recibido antes de procesar el envío.
    </p>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px;">📋 Pasos a seguir:</h3>
      <ol style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Verifica tu cuenta bancaria</li>
        <li style="margin-bottom: 8px;">Confirma que el monto coincida</li>
        <li style="margin-bottom: 8px;">Marca la orden como "Pagada" en el panel</li>
        <li>Procede con el envío</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      ${createButton({
        text: 'Revisar Orden',
        url: data.actionUrl,
        accent: true,
      })}
    </div>

    <hr class="email-divider">

    <p class="email-text-muted">
      ⏰ <strong>Recordatorio:</strong> Las transferencias pueden tardar hasta 24-48 horas en procesarse. 
      Mantén al cliente informado sobre el estado de su orden.
    </p>
  `

  return createEmailLayout({
    title: `Transferencia Pendiente - Orden #${data.orderNumber}`,
    preheader: `${data.customerName} está esperando confirmación de pago por ${data.currency} ${data.total.toFixed(2)}`,
    content,
  })
}
