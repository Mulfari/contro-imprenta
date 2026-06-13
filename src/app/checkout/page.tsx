import type { Metadata } from "next";

import { CheckoutClient } from "@/app/checkout/checkout-client";
import { listStorefrontProducts } from "@/lib/catalog";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Preparar pedido | Express Printer",
  description: "Revision de productos, arte digital y pago movil para pedidos web.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const products = await listStorefrontProducts();

  return <CheckoutClient hasPublicAuth={hasSupabasePublicConfig()} products={products} />;
}
