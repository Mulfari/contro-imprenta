import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicCredentials } from "@/lib/supabase/config";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabasePublicCredentials();

  return createBrowserClient(url, anonKey);
}
