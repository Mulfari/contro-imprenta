import { NextResponse } from "next/server";

import {
  createStorefrontCheckout,
  type StorefrontCheckoutItem,
} from "@/lib/customer-commerce";
import { getCurrentCustomer } from "@/lib/customer-auth";

type CheckoutPayload = {
  notes?: string;
  items?: StorefrontCheckoutItem[];
};

export async function POST(request: Request) {
  const user = await getCurrentCustomer();

  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesion o registrate para continuar con el pedido." },
      { status: 401 },
    );
  }

  try {
    const payload = (await request.json()) as CheckoutPayload;
    const orders = await createStorefrontCheckout({
      userId: user.id,
      email: user.email ?? "",
      fullName: String(user.user_metadata.full_name ?? ""),
      phone: String(user.user_metadata.phone ?? ""),
      notes: payload.notes ?? "",
      items: payload.items ?? [],
    });

    return NextResponse.json({
      orders,
      message: "Pedido creado. Ahora puedes subir tu arte y registrar el pago movil.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo crear el pedido.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
