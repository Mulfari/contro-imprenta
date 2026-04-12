export function hasSupabaseAdminConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function hasPanelAuthConfig() {
  return Boolean(
    hasSupabaseAdminConfig() &&
      process.env.APP_SESSION_SECRET &&
      process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD,
  );
}

export function getSupabaseAdminCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return { url, serviceRoleKey };
}

export function getSessionSecret() {
  const secret = process.env.APP_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "Missing APP_SESSION_SECRET. Set a long random string for panel sessions.",
    );
  }

  return secret;
}

export function getAdminBootstrapCredentials() {
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || "Administrador";

  if (!username || !password) {
    throw new Error(
      "Missing ADMIN_USERNAME or ADMIN_PASSWORD for bootstrap admin creation.",
    );
  }

  return { username, password, displayName };
}
