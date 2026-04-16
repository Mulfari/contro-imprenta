import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/mi-cuenta";
  const safeNext = next.startsWith("/") ? next : "/mi-cuenta";
  const redirectUrl = new URL(safeNext, requestUrl.origin);

  if (!code) {
    redirectUrl.searchParams.set(
      "message",
      "No se pudo validar el enlace de confirmacion.",
    );
    redirectUrl.searchParams.set("tone", "error");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirectUrl.searchParams.set(
      "message",
      "No se pudo confirmar tu cuenta.",
    );
    redirectUrl.searchParams.set("tone", "error");
    return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.searchParams.set(
    "message",
    "Cuenta confirmada. Ya puedes iniciar sesion.",
  );
  redirectUrl.searchParams.set("tone", "success");
  return NextResponse.redirect(redirectUrl);
}
