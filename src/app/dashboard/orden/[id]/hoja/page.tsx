import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import QRCode from "qrcode";

import { PrintButton } from "@/app/dashboard/orden/print-button";
import { getCurrentSession } from "@/lib/auth/session";
import { getOrderWithClient } from "@/lib/business";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hoja de trabajo | Express Printer",
  robots: { index: false, follow: false },
};

const SITE_URL = "https://www.expressprinter.com.ve";

const statusLabels: Record<string, string> = {
  recibido: "Recibido",
  disenando: "Diseñando",
  imprimiendo: "Imprimiendo",
  listo: "Listo",
  entregado: "Entregado",
  rechazado: "Rechazado",
};

function usd(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function dateLabel(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

// Hoja de trabajo imprimible (fase 2): la orden en papel para el taller, con
// QR que abre el pedido en el panel al escanearlo.
export default async function OrderSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?message=Inicia%20sesion%20para%20continuar");
  }

  const { id } = await params;

  let order: Awaited<ReturnType<typeof getOrderWithClient>>;
  try {
    order = await getOrderWithClient(id);
  } catch {
    redirect("/dashboard?view=pedidos&message=No%20se%20encontro%20el%20pedido");
  }

  const orderUrl = `${SITE_URL}/dashboard?view=pedidos&orderQuery=${encodeURIComponent(order.order_number)}`;
  const qrDataUrl = await QRCode.toDataURL(orderUrl, { margin: 1, width: 220 });

  const specs: { label: string; value: string }[] = [
    { label: "Producto", value: order.product_type },
    { label: "Cantidad", value: String(order.quantity ?? 1) },
    { label: "Medidas", value: order.measurements || "—" },
    { label: "Material", value: order.material || "—" },
    { label: "Acabado / laminado", value: order.lamination_finish || "—" },
    { label: "Perfil de color", value: order.color_profile || "—" },
    { label: "Diseño incluido", value: order.includes_design ? "Sí" : "No" },
    { label: "Instalación", value: order.includes_installation ? "Sí" : "No" },
    { label: "Urgencia", value: order.urgency === "normal" ? "Normal" : order.urgency },
    { label: "Prioridad", value: order.priority },
    { label: "Sucursal", value: order.branch || "—" },
    { label: "Entrega prometida", value: dateLabel(order.promised_delivery_at) },
  ];

  const stages = ["recibido", "disenando", "imprimiendo", "listo", "entregado"];

  return (
    <main className="min-h-screen bg-white px-6 py-6 text-slate-900 print:p-0">
      <div className="mx-auto max-w-[52rem]">
        {/* Barra superior (no se imprime) */}
        <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
          <Link
            href="/dashboard?view=produccion"
            className="cursor-pointer text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            ← Volver a Producción
          </Link>
          <PrintButton />
        </div>

        {/* Encabezado */}
        <header className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
              Express Printer · Hoja de trabajo
            </p>
            <h1 className="mt-2 font-mono text-4xl font-black tracking-tight">
              {order.order_number}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Estado actual:{" "}
              <span className="font-bold text-slate-900">
                {statusLabels[order.status] ?? order.status}
              </span>
              {" · "}Creado: {dateLabel(order.created_at)}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- QR generado como data URL, next/image no aplica */}
          <img src={qrDataUrl} alt={`QR del pedido ${order.order_number}`} className="h-[110px] w-[110px]" />
        </header>

        {/* Cliente */}
        <section className="mt-5 grid gap-1 rounded-xl border border-slate-300 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Cliente</p>
          <p className="text-lg font-bold">{order.client?.name ?? "Sin cliente"}</p>
          <p className="text-sm text-slate-600">
            {[order.client?.phone, order.client?.email, order.client?.document_id]
              .filter(Boolean)
              .join(" · ") || "Sin datos de contacto"}
          </p>
        </section>

        {/* Especificaciones */}
        <section className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Especificaciones
          </p>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {specs.map((spec) => (
              <div key={spec.label} className="border-b border-slate-200 pb-1.5">
                <p className="text-[11px] font-semibold uppercase text-slate-400">{spec.label}</p>
                <p className="text-sm font-semibold capitalize">{spec.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Descripción y notas */}
        {order.description ? (
          <section className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Descripción del trabajo
            </p>
            <p className="mt-1.5 rounded-xl border border-slate-300 p-3.5 text-sm leading-6">
              {order.description}
            </p>
          </section>
        ) : null}
        {order.internal_notes ? (
          <section className="mt-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Notas internas
            </p>
            <p className="mt-1.5 rounded-xl border border-dashed border-slate-300 p-3.5 text-sm leading-6">
              {order.internal_notes}
            </p>
          </section>
        ) : null}

        {/* Montos */}
        <section className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: usd(order.total_amount) },
            { label: "Abonado", value: usd(order.deposit_amount) },
            { label: "Pendiente", value: usd(order.pending_amount) },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-300 p-3 text-center">
              <p className="text-[11px] font-semibold uppercase text-slate-400">{item.label}</p>
              <p className="text-lg font-black">{item.value}</p>
            </div>
          ))}
        </section>

        {/* Checklist de etapas */}
        <section className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Avance en el taller (marcar con fecha y firma)
          </p>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {stages.map((stage) => (
              <div key={stage} className="rounded-lg border border-slate-300 p-2 text-center">
                <p className="text-xs font-bold">{statusLabels[stage]}</p>
                <p className="mt-4 border-t border-dashed border-slate-300 pt-1 text-[10px] text-slate-400">
                  fecha / firma
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Firmas */}
        <section className="mt-8 grid grid-cols-2 gap-10">
          <div className="border-t border-slate-400 pt-2 text-center text-xs text-slate-500">
            Recibido por (taller)
          </div>
          <div className="border-t border-slate-400 pt-2 text-center text-xs text-slate-500">
            Entregado a (cliente)
          </div>
        </section>

        <p className="mt-6 text-center text-[10px] text-slate-400">
          Escanea el QR para abrir este pedido en el panel · {orderUrl}
        </p>
      </div>
    </main>
  );
}
