/**
 * @fileoverview Tipos para suscriptores del newsletter
 * @module types/subscriber
 */

/**
 * Suscriptor del newsletter
 */
export interface Subscriber {
  /** Email del suscriptor */
  email: string
  /** Fecha de suscripción (ISO 8601) */
  created_at: string
  /** Estado de la suscripción */
  status: 'active' | 'unsubscribed' | 'bounced' | string
  /** Tags para segmentación */
  tags: string[]
}
