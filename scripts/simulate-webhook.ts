
const BASE_URL = process.env.BASE_URL || "http://localhost:3000"
// Usamos el token de .env.local si se corre con --env-file o un valor dummy para test local
const SECRET = process.env.MP_WEBHOOK_SECRET_TOKEN || "test_token"

if (!process.env.MP_WEBHOOK_SECRET_TOKEN) {
  console.warn("⚠️ MP_WEBHOOK_SECRET_TOKEN no detectado. Usando 'test_token'. Asegurate que coincida o pasalo como variable de entorno.")
}

async function simulateWebhook(paymentId: string, orderId: string, status: "approved" | "rejected" | "pending") {
  const url = `${BASE_URL}/api/mp/webhook?token=${SECRET}`

  console.log(`🚀 Simulating Webhook to: ${url}`)
  console.log(`📦 Order ID: ${orderId}`)
  console.log(`💳 Payment ID: ${paymentId}`)
  console.log(`📊 Status: ${status}`)

  const payload = {
    action: "payment.created",
    api_version: "v1",
    data: { id: paymentId },
    date_created: new Date().toISOString(),
    id: 123456,
    live_mode: false,
    type: "payment",
    user_id: "123456789",
  }

  // Note: The real webhook fetches the payment from MP API.
  // Since we can't easily mock the MP client *inside* the Next.js API route without more work,
  // this script is useful mainly if check the LOGS of the endpoint,
  // BUT the endpoint WILL fail to fetch the payment from MP if the paymentId is fake.

  // TO TRULY TEST LOCALHOST:
  // We need to bypass the MP fetch or use a real payment ID from sandbox.

  console.log("\n⚠️ NOTE: The backend will try to query Mercado Pago for this ID.")
  console.log("If this is a fake ID, the webhook will log an error/ignore it.")
  console.log("Use a REAL Sandbox Payment ID for best results.\n")

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  console.log(`RESPONSE: ${res.status} ${text}`)
}

const args = process.argv.slice(2)
const paymentId = args[0] || "12345678900"
const orderId = args[1] || "your-order-uuid-here"

simulateWebhook(paymentId, orderId, "approved")
