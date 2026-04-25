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

function getCheckoutErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = [record.message, record.details, record.hint]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .join(" ");

    if (message) {
      return message;
    }
  }

  return "No se pudo crear el pedido.";
}

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
    const items = (payload.items ?? []).map((item) => ({
      ...item,
      options:
        item.options && typeof item.options === "object" && !Array.isArray(item.options)
          ? item.options
          : {},
    }));
    const orders = await createStorefrontCheckout({
      userId: user.id,
      email: user.email ?? "",
      fullName: String(user.user_metadata.full_name ?? ""),
      phone: String(user.user_metadata.phone ?? ""),
      notes: payload.notes ?? "",
      items,
    });

    return NextResponse.json({
      orders,
      message: "Solicitud creada. Sube el arte y registra el pago movil desde Mi cuenta.",
    });
  } catch (error) {
    const message = getCheckoutErrorMessage(error);

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
