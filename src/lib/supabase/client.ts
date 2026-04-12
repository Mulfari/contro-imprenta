import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseCredentials } from "@/lib/supabase/config";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseCredentials();

  return createBrowserClient(url, anonKey);
}
