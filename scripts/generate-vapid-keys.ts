/**
 * Script para generar VAPID keys para Web Push Notifications
 * 
 * Uso:
 * npx tsx scripts/generate-vapid-keys.ts
 * 
 * Copia las claves generadas a tu archivo .env.local
 */

import { generateVapidKeys } from '../lib/notifications/server'

console.log('\n🔑 Generando VAPID Keys para Web Push Notifications...\n')

const keys = generateVapidKeys()

console.log('\n✅ Claves generadas exitosamente!')
console.log('\n📋 Copia estas líneas a tu archivo .env.local:\n')
console.log('# VAPID Keys para Web Push Notifications')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
console.log('VAPID_SUBJECT=mailto:admin@busy.com')
console.log('\n⚠️  IMPORTANTE: Guarda estas claves de forma segura!')
console.log('⚠️  No las compartas públicamente ni las subas a Git\n')
