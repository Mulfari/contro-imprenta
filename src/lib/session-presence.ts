import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ActivePanelSession = {
  id: string;
  user_id: string;
  connected_at: string;
  last_seen_at: string;
  ended_at: string | null;
};

function isMissingPresenceTableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: string; message?: string };

  return (
    maybeError.code === "42P01" ||
    maybeError.message?.includes("app_user_sessions") === true
  );
}

export async function createPanelSession(userId: string) {
  const supabase = createSupabaseAdminClient();
  const fallbackId = crypto.randomUUID();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("app_user_sessions")
    .insert({
      id: fallbackId,
      user_id: userId,
      connected_at: now,
      last_seen_at: now,
      ended_at: null,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    if (isMissingPresenceTableError(error)) {
      return fallbackId;
    }

    throw error;
  }

  return data.id;
}

export async function touchPanelSession(sessionId: string) {
  if (!sessionId) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("app_user_sessions")
    .update({
      last_seen_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .is("ended_at", null);

  if (error && !isMissingPresenceTableError(error)) {
    throw error;
  }
}

export async function endPanelSession(sessionId: string) {
  if (!sessionId) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("app_user_sessions")
    .update({
      last_seen_at: now,
      ended_at: now,
    })
    .eq("id", sessionId)
    .is("ended_at", null);

  if (error && !isMissingPresenceTableError(error)) {
    throw error;
  }
}

export async function countActivePanelSessions(windowMs = 90 * 1000) {
  const supabase = createSupabaseAdminClient();
  const threshold = new Date(Date.now() - windowMs).toISOString();
  const { count, error } = await supabase
    .from("app_user_sessions")
    .select("*", { count: "exact", head: true })
    .is("ended_at", null)
    .gte("last_seen_at", threshold);

  if (error) {
    if (isMissingPresenceTableError(error)) {
      return 0;
    }

    throw error;
  }

  return count ?? 0;
}

export async function listActivePanelSessions(windowMs = 90 * 1000) {
  const supabase = createSupabaseAdminClient();
  const threshold = new Date(Date.now() - windowMs).toISOString();
  const { data, error } = await supabase
    .from("app_user_sessions")
    .select("id, user_id, connected_at, last_seen_at, ended_at")
    .is("ended_at", null)
    .gte("last_seen_at", threshold)
    .order("connected_at", { ascending: true });

  if (error) {
    if (isMissingPresenceTableError(error)) {
      return [] as ActivePanelSession[];
    }

    throw error;
  }

  return (data ?? []) as ActivePanelSession[];
}
