import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import {
  getSessionSecret,
  hasPanelAuthConfig,
} from "@/lib/supabase/config";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  if (!hasPanelAuthConfig()) {
    return response;
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let hasValidSession = false;

  if (token) {
    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(getSessionSecret()),
      );
      hasValidSession = true;
    } catch {
      hasValidSession = false;
    }
  }

  const pathname = request.nextUrl.pathname;

  if (!hasValidSession && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("message", "Inicia sesion para entrar al tablero");
    return NextResponse.redirect(url);
  }

  if (hasValidSession && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
