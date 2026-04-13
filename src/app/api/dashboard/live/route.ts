import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  countActivePanelSessions,
  touchPanelSession,
} from "@/lib/session-presence";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getCount(
  table: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configure?: (query: any) => any,
) {
  const supabase = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseQuery: any = supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  const query = configure ? configure(baseQuery as never) : baseQuery;
  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function getLatestCreatedAt(table: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(table)
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ created_at: string }>();

  if (error) {
    throw error;
  }

  return data?.created_at ?? "";
}

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await touchPanelSession(session.sessionId);

    const [
      clientsCount,
      latestClientCreatedAt,
      ordersCount,
      latestOrderCreatedAt,
      receivedOrders,
      designingOrders,
      printingOrders,
      readyOrders,
      deliveredOrders,
      usersCount,
      activeSessionsCount,
      latestUserCreatedAt,
      alertsCount,
      latestAlertCreatedAt,
      activeRecoveryRequests,
      latestRecoveryCreatedAt,
    ] = await Promise.all([
      getCount("clients"),
      getLatestCreatedAt("clients"),
      getCount("orders"),
      getLatestCreatedAt("orders"),
      getCount("orders", (query) => query.eq("status", "recibido")),
      getCount("orders", (query) => query.eq("status", "disenando")),
      getCount("orders", (query) => query.eq("status", "imprimiendo")),
      getCount("orders", (query) => query.eq("status", "listo")),
      getCount("orders", (query) => query.eq("status", "entregado")),
      session.role === "admin" ? getCount("app_users") : Promise.resolve(0),
      session.role === "admin"
        ? countActivePanelSessions()
        : Promise.resolve(0),
      session.role === "admin" ? getLatestCreatedAt("app_users") : Promise.resolve(""),
      session.role === "admin" ? getCount("security_alerts") : Promise.resolve(0),
      session.role === "admin"
        ? getLatestCreatedAt("security_alerts")
        : Promise.resolve(""),
      session.role === "admin"
        ? getCount("password_recovery_requests", (query) => query.is("used_at", null))
        : Promise.resolve(0),
      session.role === "admin"
        ? getLatestCreatedAt("password_recovery_requests")
        : Promise.resolve(""),
    ]);

    const version = JSON.stringify({
      clientsCount,
      latestClientCreatedAt,
      ordersCount,
      latestOrderCreatedAt,
      receivedOrders,
      designingOrders,
      printingOrders,
      readyOrders,
      deliveredOrders,
      usersCount,
      activeSessionsCount,
      latestUserCreatedAt,
      alertsCount,
      latestAlertCreatedAt,
      activeRecoveryRequests,
      latestRecoveryCreatedAt,
    });

    return NextResponse.json(
      { version },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo consultar el estado en vivo." },
      { status: 500 },
    );
  }
}
