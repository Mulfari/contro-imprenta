import { NextResponse } from "next/server";

import {
  createStorefrontQuote,
  type StorefrontCheckoutItem,
} from "@/lib/customer-commerce";
import { getCurrentCustomer } from "@/lib/customer-auth";

function normalizeItems(value: unknown): StorefrontCheckoutItem[] {
  const items = Array.isArray(value) ? value : [];

  return items.map((item) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const rawOptions = record.options;

    return {
      productId: String(record.productId ?? ""),
      title: String(record.title ?? ""),
      productType: String(record.productType ?? ""),
      quantity: Math.max(1, Number(record.quantity) || 1),
      unitPrice: 0,
      options:
        rawOptions && typeof rawOptions === "object" && !Array.isArray(rawOptions)
          ? Object.fromEntries(
              Object.entries(rawOptions as Record<string, unknown>).map(([key, value]) => [
                key,
                String(value ?? ""),
              ]),
            )
          : {},
    } satisfies StorefrontCheckoutItem;
  });
}

export async function POST(request: Request) {
  const user = await getCurrentCustomer();

  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesion o registrate para solicitar una cotizacion." },
      { status: 401 },
    );
  }

  try {
    const payload = (await request.json()) as { items?: unknown; notes?: string };
    const items = normalizeItems(payload.items ?? []);

    if (items.length === 0) {
      throw new Error("Agrega al menos un producto para cotizar.");
    }

    const order = await createStorefrontQuote({
      userId: user.id,
      email: user.email ?? "",
      fullName: String(user.user_metadata.full_name ?? ""),
      phone: String(user.user_metadata.phone ?? ""),
      notes: String(payload.notes ?? ""),
      items,
    });

    return NextResponse.json({
      order,
      message:
        "Solicitud de cotizacion enviada. Te enviaremos el precio y podras pagarlo desde Mi cuenta.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo enviar la solicitud de cotizacion.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
