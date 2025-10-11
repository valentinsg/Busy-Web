// =====================================================
// NEW ORDER EMAIL TEMPLATE
// Email para notificar nueva orden al admin
// =====================================================

import { createEmailLayout, createButton, createInfoBox, createBadge } from './base'
import type { NewOrderEmailData } from '@/types/email'

export function createNewOrderEmail(data: NewOrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td>${item.product_name}</td>
      <td style="text-align: center;">x${item.quantity}</td>
      <td style="text-align: right;">${data.currency} ${item.unit_price.toFixed(2)}</td>
      <td style="text-align: right;"><strong>${data.currency} ${item.total.toFixed(2)}</strong></td>
    </tr>
  `
    )
    .join('')

  const content = `
    <h1 class="email-title">🛍️ Nueva Orden Recibida</h1>
    
    <p class="email-text">
      ¡Excelente! Has recibido una nueva orden en tu tienda.
    </p>

    ${createInfoBox(`
      <p style="margin: 0 0 8px 0;"><strong>Orden:</strong> #${data.orderNumber}</p>
      <p style="margin: 0 0 8px 0;"><strong>Cliente:</strong> ${data.customerName}</p>
      <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${data.customerEmail}</p>
      <p style="margin: 0 0 8px 0;"><strong>Canal:</strong> ${createBadge(data.channel.toUpperCase(), 'success')}</p>
      ${data.paymentMethod ? `<p style="margin: 0 0 8px 0;"><strong>Método de Pago:</strong> ${createBadge(
        data.paymentMethod === 'transfer' ? 'TRANSFERENCIA' : data.paymentMethod.toUpperCase(),
        data.paymentMethod === 'transfer' ? 'warning' : 'success'
      )}</p>` : ''}
      ${data.status ? `<p style="margin: 0;"><strong>Estado:</strong> ${createBadge(
        data.status === 'paid' ? 'PAGADO' : data.status === 'pending' ? 'PENDIENTE' : data.status.toUpperCase(),
        data.status === 'paid' ? 'success' : 'warning'
      )}</p>` : ''}
    `)}

    <h2 style="font-size: 18px; font-weight: 600; margin: 32px 0 16px 0;">Productos</h2>
    
    <table class="data-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th style="text-align: center;">Cantidad</th>
          <th style="text-align: right;">Precio Unit.</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align: right; padding-top: 16px; font-weight: 600;">TOTAL:</td>
          <td style="text-align: right; padding-top: 16px; font-size: 20px; font-weight: 700; color: #FF6B00;">
            ${data.currency} ${data.total.toFixed(2)}
          </td>
        </tr>
      </tfoot>
    </table>

    <div style="text-align: center; margin: 32px 0;">
      ${createButton({
        text: 'Ver Orden Completa',
        url: data.actionUrl,
        accent: true,
      })}
    </div>

    <hr class="email-divider">

    <p class="email-text-muted">
      💡 <strong>Próximos pasos:</strong> Revisa los detalles de la orden y prepara el envío. 
      El cliente recibirá una notificación cuando marques la orden como enviada.
    </p>
  `

  return createEmailLayout({
    title: `Nueva Orden #${data.orderNumber} - Busy Streetwear`,
    preheader: `${data.customerName} realizó una compra por ${data.currency} ${data.total.toFixed(2)}`,
    content,
  })
}
