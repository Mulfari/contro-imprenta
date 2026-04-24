import { NextResponse } from "next/server";

import { createCustomerPayment } from "@/lib/customer-commerce";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function POST(request: Request) {
  const user = await getCurrentCustomer();

  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesion para registrar pagos." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("proofFile");
    const payment = await createCustomerPayment({
      userId: user.id,
      orderId: String(formData.get("orderId") ?? ""),
      amount: String(formData.get("amount") ?? ""),
      bank: String(formData.get("bank") ?? ""),
      payerPhone: String(formData.get("payerPhone") ?? ""),
      reference: String(formData.get("reference") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      proofFile: file instanceof File ? file : null,
    });

    return NextResponse.json({
      payment,
      message: "Pago registrado. Administracion lo validara antes de producir.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo registrar el pago.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
