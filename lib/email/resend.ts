import { Resend } from "resend"
import type { Order } from "@/types/commerce"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || "Busy Store <no-reply@busy.com.ar>"

if (!RESEND_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn("RESEND_API_KEY is not set. Invoice emails will be skipped.")
}

export async function sendInvoiceEmail(params: {
  to: string
  order: Pick<Order, "total">
  items: Array<{ product_id: string; product_name?: string; quantity: number; unit_price: number; total: number }>
  paymentId: string
  tax: number
  shipping: number
  discount: number
}) {
  if (!RESEND_API_KEY) return
  const resend = new Resend(RESEND_API_KEY)

  const itemRows = params.items
    .map(
      (it) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${it.product_name ?? it.product_id}</td><td style="padding:6px 8px;border-bottom:1px solid #eee">x${it.quantity}</td><td style="padding:6px 8px;border-bottom:1px solid #eee">$${it.unit_price.toFixed(2)}</td><td style=\"padding:6px 8px;border-bottom:1px solid #eee;text-align:right\">$${it.total.toFixed(2)}</td></tr>`,
    )
    .join("")

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
      ${params.discount > 0 ? `<div>Descuento: -$${params.discount.toFixed(2)}</div>` : ""}
      <div>Envío: $${params.shipping.toFixed(2)}</div>
      <div>Impuesto (10%): $${params.tax.toFixed(2)}</div>
      <div style="font-weight:600;margin-top:6px">Total: $${params.order.total.toFixed(2)}</div>
    </div>

    <p style="margin-top:16px">Ante cualquier duda, respondé este mail.</p>
  </div>`

  await resend.emails.send({
    from: EMAIL_FROM,
    to: params.to,
    subject: `Tu compra en Busy - Pago ${params.paymentId}`,
    html,
  })
}
