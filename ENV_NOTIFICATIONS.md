# Variables de Entorno para Notificaciones

Agrega estas variables a tu archivo `.env.local`:

```env
# =====================================================
# VAPID KEYS PARA WEB PUSH NOTIFICATIONS
# =====================================================
# Genera estas claves ejecutando:
# npx tsx scripts/generate-vapid-keys.ts

NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@busy.com

# =====================================================
# SUPABASE (Ya deberías tenerlas configuradas)
# =====================================================
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Cómo Generar las VAPID Keys

1. Ejecuta el script de generación:
```bash
npx tsx scripts/generate-vapid-keys.ts
```

2. Copia las claves generadas a tu `.env.local`

3. Reinicia el servidor de desarrollo:
```bash
pnpm dev
```

## Verificar Configuración

Para verificar que las claves están configuradas correctamente:

```typescript
// En cualquier componente del admin
console.log('VAPID Public Key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.substring(0, 10) + '...')
```

Si ves la clave truncada, está configurada correctamente.

## Seguridad

⚠️ **IMPORTANTE:**
- **NUNCA** compartas tu `VAPID_PRIVATE_KEY`
- **NUNCA** la subas a Git
- Guárdala en un gestor de contraseñas
- Si la comprometes, genera nuevas claves

## Troubleshooting

### Error: "VAPID keys not configured"
- Verifica que las variables estén en `.env.local`
- Reinicia el servidor de desarrollo
- Verifica que no haya espacios extra en las claves

### Error: "Invalid VAPID key"
- Regenera las claves con el script
- Asegúrate de copiar las claves completas
- Verifica que no haya saltos de línea en las claves
