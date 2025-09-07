import { createClient } from "@supabase/supabase-js";

// Client for browser and server (using anon key). For privileged operations use a server-side service key variant.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // We avoid throwing to keep the app building without Supabase; log a helpful message instead.
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment to enable it.",
  )
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "")

export default supabase
