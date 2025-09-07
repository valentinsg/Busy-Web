import { createClient } from "@supabase/supabase-js"

// Server-side client using the Service Role key for privileged operations.
// IMPORTANT: This file must only be imported from server components, server actions, or route handlers.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!supabaseUrl || !serviceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase server client is not fully configured. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
  )
}

export function getServiceClient() {
  return createClient(supabaseUrl ?? "", serviceRoleKey ?? "", {
    auth: { persistSession: false },
  })
}

export default getServiceClient
