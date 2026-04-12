import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminCredentials } from "@/lib/supabase/config";

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseAdminCredentials();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
