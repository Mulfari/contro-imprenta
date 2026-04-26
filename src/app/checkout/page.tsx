import type { Metadata } from "next";

import { CheckoutClient } from "@/app/checkout/checkout-client";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Preparar pedido | Express Printer",
  description: "Revision de productos, arte digital y pago movil para pedidos web.",
};

export default function CheckoutPage() {
  return <CheckoutClient hasPublicAuth={hasSupabasePublicConfig()} />;
}
