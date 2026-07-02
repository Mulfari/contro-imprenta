import { NextResponse } from "next/server";

import { getCurrentCustomer } from "@/lib/customer-auth";
import { respondArtApproval } from "@/lib/customer-commerce";

// El cliente aprueba o pide cambios en el arte de su pedido.
export async function POST(request: Request) {
  const user = await getCurrentCustomer();

  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesion para responder sobre tu arte." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as {
      orderId?: string;
      decision?: string;
      note?: string;
    };

    if (!body.orderId || !["aprobado", "cambios"].includes(body.decision ?? "")) {
      return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
    }

    await respondArtApproval({
      userId: user.id,
      orderId: body.orderId,
      decision: body.decision as "aprobado" | "cambios",
      note: body.note,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo registrar tu respuesta.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
