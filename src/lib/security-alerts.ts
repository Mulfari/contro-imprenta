import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type SecurityAlert = {
  id: string;
  user_id: string | null;
  username: string;
  detail: string;
  created_at: string;
};

export async function createSecurityAlert(input: {
  userId: string | null;
  username: string;
  detail: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("security_alerts")
    .insert({
      user_id: input.userId,
      username: input.username,
      detail: input.detail,
    })
    .select("*")
    .single<SecurityAlert>();

  if (error) {
    throw error;
  }

  return data;
}

export async function listSecurityAlerts(limit = 12) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("security_alerts")
    .select("id, user_id, username, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as SecurityAlert[];
}
