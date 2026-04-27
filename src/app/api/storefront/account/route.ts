import { NextResponse } from "next/server";

import { getCustomerAccount, getCustomerDashboard } from "@/lib/customer-commerce";
import { getCurrentCustomer } from "@/lib/customer-auth";

export async function GET() {
  const user = await getCurrentCustomer();

  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesion para ver tus pedidos." },
      { status: 401 },
    );
  }

  try {
    const [account, orders] = await Promise.all([
      getCustomerAccount(user.id),
      getCustomerDashboard(user.id),
    ]);

    return NextResponse.json({ orders, profile: account.profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo cargar tu cuenta.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
