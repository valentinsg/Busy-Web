// =====================================================
// RESEND CLIENT CONFIGURATION
// Sistema de emails para Busy Streetwear
// =====================================================

import { Resend } from 'resend'
import type { Order } from '@/types/commerce'
import type { EmailConfig } from '@/types/email'

// =====================================================
// CONFIGURATION
// =====================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'Busy Streetwear <no-reply@busy.com.ar>'
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'hola@busy.com.ar'
const EMAIL_BCC = process.env.EMAIL_BCC // Optional: comma-separated emails for BCC

let resendClient: Resend | null = null

/**
 * Get or create Resend client instance
 */
export function getResendClient(): Resend | null {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.')
    return null
  }

  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY)
  }

  return resendClient
}

/**
 * Get email configuration
 */
export function getEmailConfig(): EmailConfig {
  return {
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    bcc: EMAIL_BCC ? EMAIL_BCC.split(',').map((e) => e.trim()) : undefined,
  }
}

/**
 * Check if email system is configured
 */
export function isEmailConfigured(): boolean {
  return !!RESEND_API_KEY
}

// =====================================================
// LEGACY INVOICE EMAIL (Mantener compatibilidad)
// =====================================================

export async function sendInvoiceEmail(params: {
  to: string
  order: Pick<Order, 'total'>
  items: Array<{
    product_id: string
    product_name?: string
    quantity: number
    unit_price: number
    total: number
  }>
  paymentId: string
  tax: number
  shipping: number
  discount: number
}) {
  const resend = getResendClient()
  if (!resend) return

  const itemRows = params.items
    .map(
      (it) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${it.product_name ?? it.product_id}</td><td style="padding:6px 8px;border-bottom:1px solid #eee">x${it.quantity}</td><td style="padding:6px 8px;border-bottom:1px solid #eee">$${it.unit_price.toFixed(2)}</td><td style=\"padding:6px 8px;border-bottom:1px solid #eee;text-align:right\">$${it.total.toFixed(2)}</td></tr>`
    )
    .join('')

  const subtotal = params.items.reduce((acc, i) => acc + i.total, 0)
  const html = `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;">
    <h2>Factura de tu compra</h2>
    <p>¡Gracias por tu compra! A continuación te dejamos el detalle de tu pedido.</p>

    <p><b>Número de pago:</b> ${params.paymentId}</p>

    <table style="border-collapse:collapse;width:100%;margin-top:12px">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #333">Producto</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #333">Cant.</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #333">Precio</th>
          <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #333">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div style="margin-top:12px">
      <div>Subtotal: $${subtotal.toFixed(2)}</div>
      ${params.discount > 0 ? `<div>Descuento: -$${params.discount.toFixed(2)}</div>` : ''}
      <div>Envío: $${params.shipping.toFixed(2)}</div>
      <div>Impuesto (10%): $${params.tax.toFixed(2)}</div>
      <div style="font-weight:600;margin-top:6px">Total: $${params.order.total.toFixed(2)}</div>
    </div>

    <p style="margin-top:16px">Ante cualquier duda, respondé este mail.</p>
  </div>`

  const config = getEmailConfig()
  await resend.emails.send({
    from: config.from,
    to: params.to,
    subject: `Tu compra en Busy - Pago ${params.paymentId}`,
    html,
    replyTo: config.replyTo,
  })
}
