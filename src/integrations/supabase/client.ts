import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// In Lovable wird der Client typischerweise einmal initialisiert und überall importiert.
// Wenn die Env-Vars fehlen, liefern wir einen Stub, der bei jedem Call wirft —
// die App leitet dann via <Setup /> auf die Setup-Seite weiter, bevor das passiert.
function makeStub(): SupabaseClient {
  const handler: ProxyHandler<object> = {
    get() {
      throw new Error(
        "Supabase ist nicht konfiguriert. Trag VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in .env.local ein.",
      );
    },
  };
  return new Proxy({}, handler) as SupabaseClient;
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : makeStub();
