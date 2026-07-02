import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CustomerAuthScreen } from "@/app/mi-cuenta/customer-auth-screen";
import { getCurrentCustomer } from "@/lib/customer-auth";

export const metadata: Metadata = {
  title: "Registro | Express Printer",
  description: "Registro de clientes para Express Printer.",
};

export const dynamic = "force-dynamic";

export default async function CustomerRegisterPage() {
  const user = await getCurrentCustomer();

  if (user) {
    redirect("/mi-cuenta");
  }

  return <CustomerAuthScreen mode="register" />;
}
