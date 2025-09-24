/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Client for browser and server (using anon key). For privileged operations use a server-side service key variant.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined

function createUnavailableClient(): SupabaseClient<any, any, any> {
  // Create a proxy that throws only when used, preventing build-time crashes on import.
  const handler: ProxyHandler<any> = {
    get() {
      throw new Error(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.",
      )
    },
    apply() {
      throw new Error(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.",
      )
    },
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return new Proxy({}, handler) as any
}

let supabase: SupabaseClient<any, any, any>
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment to enable it.",
  )
  supabase = createUnavailableClient()
}

export { supabase }
export default supabase
