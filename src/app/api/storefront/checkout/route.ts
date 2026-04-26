import { NextResponse } from "next/server";

import {
  createStorefrontCheckout,
  createCustomerPayment,
  uploadCustomerOrderFile,
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

function normalizeCheckoutItems(value: unknown) {
  const items = Array.isArray(value) ? value : [];

  return items.map((item) => {
    const record = item && typeof item === "object" ? item as Record<string, unknown> : {};
    const rawOptions = record.options;

    return {
      productId: String(record.productId ?? ""),
      title: String(record.title ?? ""),
      productType: String(record.productType ?? ""),
      quantity: Math.max(1, Number(record.quantity) || 1),
      unitPrice: Math.max(0, Number(record.unitPrice) || 0),
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

async function handleMultipartCheckout(request: Request, user: NonNullable<Awaited<ReturnType<typeof getCurrentCustomer>>>) {
  const formData = await request.formData();
  const rawItems = String(formData.get("items") ?? "[]");
  const parsedItems = JSON.parse(rawItems) as unknown;
  const items = normalizeCheckoutItems(parsedItems);
  const notes = String(formData.get("notes") ?? "");
  const artIntent = String(formData.get("artIntent") ?? "now");
  const artFiles = formData
    .getAll("artFiles")
    .filter((file): file is File => file instanceof File && file.size > 0);
  const amount = String(formData.get("amount") ?? "");
  const reference = String(formData.get("reference") ?? "").trim();
  const payerPhone = String(formData.get("payerPhone") ?? "").trim();
  const proofFile = formData.get("proofFile");

  if (items.length === 0) {
    throw new Error("Agrega al menos un producto al carrito.");
  }

  if (artIntent !== "later" && artFiles.length === 0) {
    throw new Error("Sube el arte digital o indica que lo enviaras despues.");
  }

  if (!amount || !reference || !payerPhone) {
    throw new Error("Completa el monto, telefono emisor y referencia del pago movil.");
  }

  const orders = await createStorefrontCheckout({
    userId: user.id,
    email: user.email ?? "",
    fullName: String(user.user_metadata.full_name ?? ""),
    phone: String(user.user_metadata.phone ?? ""),
    notes,
    items,
  });
  const order = orders[0];

  if (!order) {
    throw new Error("No se pudo crear el pedido.");
  }

  await Promise.all(
    artFiles.map((file) =>
      uploadCustomerOrderFile({
        userId: user.id,
        orderId: order.id,
        attachmentType: "arte_cliente",
        file,
      }),
    ),
  );

  await createCustomerPayment({
    userId: user.id,
    orderId: order.id,
    amount,
    bank: String(formData.get("bank") ?? ""),
    payerPhone,
    reference,
    notes: artIntent === "later"
      ? "Cliente indico que enviara el arte despues."
      : "Pago enviado desde checkout web.",
    proofFile: proofFile instanceof File ? proofFile : null,
  });

  return NextResponse.json({
    orders,
    message:
      artFiles.length > 0
        ? "Pedido enviado. Administracion validara el pago y el arte."
        : "Pedido enviado. Administracion validara el pago; queda pendiente el arte.",
  });
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
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      return await handleMultipartCheckout(request, user);
    }

    const payload = (await request.json()) as CheckoutPayload;
    const items = normalizeCheckoutItems(payload.items ?? []);
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
      message: "Pedido creado. Sube el arte y registra el pago movil desde Mi cuenta.",
    });
  } catch (error) {
    const message = getCheckoutErrorMessage(error);

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
