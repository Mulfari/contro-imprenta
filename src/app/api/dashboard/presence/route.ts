import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { touchPanelSession } from "@/lib/session-presence";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await touchPanelSession(session.sessionId);

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar la presencia." },
      { status: 500 },
    );
  }
}
