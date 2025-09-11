
import { MercadoPagoConfig, Payment, Preference } from "mercadopago"

const accessToken = process.env.MP_ACCESS_TOKEN

if (!accessToken) {
  // eslint-disable-next-line no-console
  console.warn("MP_ACCESS_TOKEN is not set. Mercado Pago integration will not work until you set it.")
}

let config: MercadoPagoConfig | null = null
let prefClient: Preference | null = null
let paymentClient: Payment | null = null

export function getMPConfig() {
  if (!config) {
    config = new MercadoPagoConfig({ accessToken: accessToken ?? "" })
  }
  return config
}

export function getPreferenceClient() {
  if (!prefClient) {
    prefClient = new Preference(getMPConfig())
  }
  return prefClient
}

export function getPaymentClient() {
  if (!paymentClient) {
    paymentClient = new Payment(getMPConfig())
  }
  return paymentClient
}

export default getMPConfig
