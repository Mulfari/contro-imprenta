"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type CustomerProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerOrderFile = {
  id: string;
  order_id: string;
  attachment_type: "arte_cliente" | "prueba_aprobada" | "imagen_referencia" | "comprobante_pago";
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  signed_url: string | null;
  created_at: string;
};

type CustomerPayment = {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  bank: string | null;
  payer_phone: string | null;
  reference: string | null;
  status: "por_validar" | "aprobado" | "rechazado";
  created_at: string;
};

type CustomerOrder = {
  id: string;
  order_number: string | null;
  title: string;
  product_type: string | null;
  quantity: number;
  total_amount: number | null;
  deposit_amount: number | null;
  pending_amount: number | null;
  payment_status: "pendiente" | "anticipo" | "pagado" | "credito";
  payment_review_status: "sin_pago" | "por_validar" | "validado" | "rechazado";
  confirmation_status: "pendiente" | "confirmado" | "rechazado";
  status: "recibido" | "disenando" | "imprimiendo" | "listo" | "entregado";
  current_area: string | null;
  promised_delivery_at: string | null;
  created_at: string;
  files: CustomerOrderFile[];
  payments: CustomerPayment[];
};

type CustomerAccountClientProps = {
  hasPublicAuth: boolean;
  onClose?: () => void;
  variant?: "page" | "dropdown";
  initialMode?: "login" | "register";
  showModeSwitch?: boolean;
  initialNotice?: {
    message: string;
    tone: "error" | "success";
  } | null;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: string }).message;

    if (message) {
      return message;
    }
  }

  return fallback;
}

function MessageBox({
  message,
  tone,
}: {
  message: string;
  tone: "error" | "success";
}) {
  return (
    <div
      className={`rounded-[1.35rem] border px-4 py-3 text-sm font-medium ${
        tone === "error"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {message}
    </div>
  );
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Por confirmar";
  }

  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

const orderStatusLabels: Record<CustomerOrder["status"], string> = {
  recibido: "Recibido",
  disenando: "Diseno",
  imprimiendo: "Impresion",
  listo: "Listo",
  entregado: "Entregado",
};

const paymentStatusLabels: Record<CustomerPayment["status"], string> = {
  por_validar: "Por validar",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

const paymentStatusClass: Record<CustomerPayment["status"], string> = {
  por_validar: "bg-amber-50 text-amber-700 ring-amber-200",
  aprobado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rechazado: "bg-rose-50 text-rose-700 ring-rose-200",
};

const paymentReviewLabels: Record<CustomerOrder["payment_review_status"], string> = {
  sin_pago: "Sin pago registrado",
  por_validar: "Pago en revision",
  validado: "Pago validado",
  rechazado: "Pago rechazado",
};

const orderStatusSteps: CustomerOrder["status"][] = [
  "recibido",
  "disenando",
  "imprimiendo",
  "listo",
  "entregado",
];

type CustomerDashboardProps = {
  displayName: string;
  email: string | null | undefined;
  profile: CustomerProfile | null;
  onSignOut: () => void;
  isSigningOut: boolean;
};

type CustomerOrderView = "active" | "past";

function getArtFiles(order: CustomerOrder) {
  return order.files.filter((file) => file.attachment_type === "arte_cliente");
}

function getPrimaryArtFile(order: CustomerOrder) {
  return getArtFiles(order)[0] ?? null;
}

function isImageFile(file: CustomerOrderFile | null) {
  if (!file) {
    return false;
  }

  const type = file.file_type?.toLowerCase() ?? "";
  const name = file.file_name.toLowerCase();

  return (
    type.startsWith("image/") ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif")
  );
}

function getOrderActionLabel(order: CustomerOrder) {
  const hasArt = getArtFiles(order).length > 0;

  if (!hasArt) {
    return "Falta arte";
  }

  if (order.payment_review_status === "sin_pago") {
    return "Falta pago";
  }

  if (order.payment_review_status === "rechazado") {
    return "Revisar pago";
  }

  if (order.payment_review_status === "por_validar") {
    return "Pago en revision";
  }

  if (order.confirmation_status === "pendiente") {
    return "Por confirmar";
  }

  if (order.status === "entregado") {
    return "Entregado";
  }

  return orderStatusLabels[order.status];
}

function CustomerArtPreview({
  file,
  size = "md",
  interactive = true,
}: {
  file: CustomerOrderFile | null;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}) {
  const sizeClass =
    size === "sm"
      ? "h-14 w-14 rounded-2xl"
      : size === "lg"
        ? "h-52 w-full rounded-[1.45rem]"
        : "h-20 w-20 rounded-[1.35rem]";
  const iconClass = size === "lg" ? "h-8 w-8" : "h-5 w-5";

  if (file && file.signed_url && isImageFile(file)) {
    const preview = (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.signed_url}
          alt={file.file_name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-x-0 bottom-0 bg-slate-950/70 px-2 py-1 text-[10px] font-semibold text-white">
          Arte
        </span>
      </>
    );

    return interactive ? (
      <a
        href={file.signed_url}
        target="_blank"
        rel="noreferrer"
        className={`${sizeClass} group relative block shrink-0 overflow-hidden border border-slate-200 bg-slate-100`}
        title={file.file_name}
      >
        {preview}
      </a>
    ) : (
      <div
        className={`${sizeClass} group relative block shrink-0 overflow-hidden border border-slate-200 bg-slate-100`}
        title={file.file_name}
      >
        {preview}
      </div>
    );
  }

  if (file) {
    const preview = (
      <>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`${iconClass} text-slate-400`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8" />
          <path d="M8 17h5" />
        </svg>
        {size === "lg" ? (
          <span className="mt-3 max-w-[12rem] truncate text-xs font-semibold">
            {file.file_name}
          </span>
        ) : null}
      </>
    );

    return interactive ? (
      <a
        href={file.signed_url ?? "#"}
        target="_blank"
        rel="noreferrer"
        className={`${sizeClass} flex shrink-0 flex-col items-center justify-center border border-slate-200 bg-white text-center text-slate-500 transition hover:border-slate-300`}
        title={file.file_name}
      >
        {preview}
      </a>
    ) : (
      <div
        className={`${sizeClass} flex shrink-0 flex-col items-center justify-center border border-slate-200 bg-white text-center text-slate-500`}
        title={file.file_name}
      >
        {preview}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 flex-col items-center justify-center border border-dashed border-slate-300 bg-slate-50 text-center text-slate-400`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={iconClass}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 7h16" />
        <path d="M7 4h10" />
        <path d="M6 7v13h12V7" />
        <path d="M10 12h4" />
      </svg>
      <span className={`${size === "lg" ? "mt-3 text-sm" : "mt-1 text-[10px]"} font-semibold`}>
        Sin arte
      </span>
    </div>
  );
}

function CustomerOrderProgressLine({ order }: { order: CustomerOrder }) {
  const currentIndex = Math.max(0, orderStatusSteps.indexOf(order.status));

  return (
    <div className="grid grid-cols-5 items-start gap-1">
      {orderStatusSteps.map((status, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={status} className="min-w-0">
            <div
              className={`mx-auto h-2 w-full rounded-full ${
                isComplete ? (isCurrent ? "bg-[#ffd45f]" : "bg-slate-950") : "bg-slate-200"
              }`}
            />
            <p
              className={`mt-1 truncate text-center text-[9px] font-semibold sm:text-[10px] ${
                isCurrent ? "text-slate-950" : "text-slate-400"
              }`}
            >
              {orderStatusLabels[status]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function getCustomerOrderFlow(order: CustomerOrder, artFiles: CustomerOrderFile[]) {
  if (order.confirmation_status === "rechazado") {
    return {
      label: "Solicitud por revisar",
      description: "Administracion marco esta solicitud para revision antes de producir.",
      action: "Espera contacto del equipo",
      tone: "rose",
    };
  }

  if (order.payment_review_status === "rechazado") {
    return {
      label: "Pago rechazado",
      description: "El comprobante no pudo validarse. Registra un nuevo pago movil.",
      action: "Registrar otro pago",
      tone: "rose",
    };
  }

  if (artFiles.length === 0) {
    return {
      label: "Falta arte digital",
      description: "Sube el archivo final o una referencia para que el equipo revise el trabajo.",
      action: "Subir arte",
      tone: "amber",
    };
  }

  if (order.payment_review_status === "sin_pago") {
    return {
      label: "Falta registrar pago",
      description: "Registra tu pago movil para que administracion pueda validarlo.",
      action: "Registrar pago",
      tone: "amber",
    };
  }

  if (order.payment_review_status === "por_validar") {
    return {
      label: "Pago en validacion",
      description: "El equipo revisara el comprobante antes de confirmar produccion.",
      action: "Pendiente por administracion",
      tone: "blue",
    };
  }

  if (order.confirmation_status === "pendiente") {
    return {
      label: "Solicitud en revision",
      description: "Ya hay arte y pago validado. Administracion confirmara el pedido.",
      action: "Pendiente por administracion",
      tone: "blue",
    };
  }

  if (order.status === "entregado") {
    return {
      label: "Pedido entregado",
      description: "Este trabajo ya fue marcado como entregado.",
      action: "Finalizado",
      tone: "emerald",
    };
  }

  return {
    label: orderStatusLabels[order.status],
    description: "Pedido confirmado y en flujo de produccion.",
    action: `Area actual: ${order.current_area ?? "Por asignar"}`,
    tone: "emerald",
  };
}

function AccountDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-slate-200 ${className}`} />;
}

function CustomerDashboardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-10 w-10" />
        </div>
        <div className="rounded-[1.45rem] border border-slate-200 bg-slate-50/70 p-5">
          <SkeletonBlock className="h-7 w-44" />
          <SkeletonBlock className="mt-3 h-4 w-56 max-w-full" />
        </div>
        <div className="rounded-[1.45rem] border border-slate-200 bg-white p-5">
          <SkeletonBlock className="h-3 w-28" />
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="mt-3 h-4 w-40" />
              </div>
            ))}
          </div>
        </div>
        <SkeletonBlock className="h-12 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_28px_80px_rgba(15,23,42,0.2)]">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.35fr_0.65fr] lg:p-8">
          <div>
            <div className="h-3 w-32 animate-pulse rounded-full bg-white/20" />
            <div className="mt-4 h-11 w-64 max-w-full animate-pulse rounded-full bg-white/20" />
            <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded-full bg-white/15" />
            <div className="mt-5 flex flex-wrap gap-2">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-8 w-32 animate-pulse rounded-full bg-white/15" />
              ))}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <div className="h-4 w-28 animate-pulse rounded-full bg-white/20" />
            <div className="mt-3 h-9 w-36 animate-pulse rounded-full bg-white/20" />
            <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-white/15" />
            <div className="mt-5 h-12 w-full animate-pulse rounded-2xl bg-white/15" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.64fr_1.36fr]">
        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:p-6">
            <SkeletonBlock className="h-3 w-36" />
            <SkeletonBlock className="mt-4 h-8 w-32" />
            <div className="mt-5 grid gap-3">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="mt-3 h-4 w-40" />
                </div>
              ))}
            </div>
          </section>
        </aside>

        <main>
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SkeletonBlock className="h-3 w-36" />
                <SkeletonBlock className="mt-4 h-8 w-52" />
              </div>
              <SkeletonBlock className="h-12 w-40 rounded-2xl" />
            </div>
            <div className="mt-5 space-y-4">
              {[0, 1].map((item) => (
                <div key={item} className="rounded-[1.65rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div>
                      <SkeletonBlock className="h-3 w-28" />
                      <SkeletonBlock className="mt-4 h-7 w-56" />
                      <div className="mt-4 flex flex-wrap gap-2">
                        {[0, 1, 2].map((pill) => (
                          <SkeletonBlock key={pill} className="h-7 w-24" />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 lg:min-w-44">
                      <SkeletonBlock className="h-4 w-16" />
                      <SkeletonBlock className="mt-3 h-8 w-28" />
                    </div>
                  </div>
                  <SkeletonBlock className="mt-5 h-16 w-full rounded-2xl" />
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <SkeletonBlock className="h-36 w-full rounded-2xl" />
                    <SkeletonBlock className="h-36 w-full rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function CustomerMiniOrderProgress({ order }: { order: CustomerOrder }) {
  const artFile = getPrimaryArtFile(order);
  const hasArt = Boolean(artFile);
  const needsAction =
    !hasArt ||
    order.payment_review_status === "sin_pago" ||
    order.payment_review_status === "rechazado";
  const nextAction = getOrderActionLabel(order);

  return (
    <Link
      href="/?account=dashboard"
      className="block rounded-[1.2rem] border border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex items-start gap-3">
        <CustomerArtPreview file={artFile} size="sm" interactive={false} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">
                {order.title}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                {order.order_number ?? "Pedido web"}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${
                needsAction
                  ? "bg-amber-100 text-amber-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {nextAction}
            </span>
          </div>

          <div className="mt-4">
            <CustomerOrderProgressLine order={order} />
            <p className="mt-3 text-xs font-semibold text-slate-600">
              Va por {orderStatusLabels[order.status].toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CustomerAccountDropdownSummary({
  displayName,
  email,
  onClose,
  onSignOut,
  isSigningOut,
  message,
  messageTone,
}: {
  displayName: string;
  email: string | null | undefined;
  onClose?: () => void;
  onSignOut: () => void;
  isSigningOut: boolean;
  message: string;
  messageTone: "error" | "success";
}) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadQuickOrders() {
      try {
        const response = await fetch("/api/storefront/account", {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          orders?: CustomerOrder[];
        };

        if (isMounted) {
          setOrders(payload.orders ?? []);
        }
      } catch {
        if (isMounted) {
          setOrders([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingOrders(false);
        }
      }
    }

    void loadQuickOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeOrders = orders.filter((order) => order.status !== "entregado");
  const quickOrders = activeOrders.slice(0, 2);

  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
            Mi cuenta
          </p>
          <h2 className="mt-2 truncate text-xl font-black text-slate-950">
            {displayName}
          </h2>
          <p className="mt-1 truncate text-sm text-slate-500">{email}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
          aria-label="Cerrar mi cuenta"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {message ? (
        <div className="mt-4">
          <MessageBox message={message} tone={messageTone} />
        </div>
      ) : null}

      <section className="mt-4 rounded-[1.45rem] border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-950">
              Pedidos en curso
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {activeOrders.length > 0
                ? `${activeOrders.length} pedido${activeOrders.length === 1 ? "" : "s"} activo${activeOrders.length === 1 ? "" : "s"}`
                : "Sin pedidos activos"}
            </p>
          </div>
          <Link
            href="/?account=dashboard"
            onClick={onClose}
            className="shrink-0 rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800"
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-4 space-y-2">
          {isLoadingOrders ? (
            [0, 1].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="mt-3 h-4 w-40" />
              </div>
            ))
          ) : quickOrders.length > 0 ? (
            quickOrders.map((order) => (
              <div key={order.id} onClick={onClose}>
                <CustomerMiniOrderProgress order={order} />
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center">
              <p className="text-sm font-semibold text-slate-950">Sin pedidos activos</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Cuando prepares un pedido aparecera aqui.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="mt-4 grid gap-2">
        <Link
          href="/?account=dashboard"
          onClick={onClose}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[#ffd45f] px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41]"
        >
          Ver dashboard
        </Link>
        <p className="px-2 text-center text-xs leading-5 text-slate-400">
          Entra para revisar pedidos, subir arte y consultar pagos.
        </p>
        <button
          type="button"
          onClick={onSignOut}
          disabled={isSigningOut}
          className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSigningOut ? "Cerrando..." : "Cerrar sesion"}
        </button>
      </div>
    </div>
  );
}

function CustomerDashboard({
  displayName,
  email,
  profile,
  onSignOut,
  isSigningOut,
}: CustomerDashboardProps) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [actionTone, setActionTone] = useState<"error" | "success">("success");
  const [activePaymentOrderId, setActivePaymentOrderId] = useState<string | null>(null);
  const [orderView, setOrderView] = useState<CustomerOrderView>("active");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/storefront/account", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        orders?: CustomerOrder[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudieron cargar tus pedidos.");
      }

      setOrders(payload.orders ?? []);
      setActionTone("success");
    } catch (error) {
      setActionTone("error");
      setActionMessage(
        error instanceof Error ? error.message : "No se pudieron cargar tus pedidos.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const openOrders = orders.filter((order) => order.status !== "entregado");
  const pastOrders = orders.filter((order) => order.status === "entregado");
  const visibleOrders = orderView === "active" ? openOrders : pastOrders;
  const selectedOrder =
    visibleOrders.find((order) => order.id === selectedOrderId) ??
    visibleOrders[0] ??
    null;

  useEffect(() => {
    if (visibleOrders.length === 0) {
      setSelectedOrderId(null);
      return;
    }

    if (!selectedOrderId || !visibleOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(visibleOrders[0].id);
    }
  }, [selectedOrderId, visibleOrders]);

  const uploadArt = async (orderId: string, file: File | null) => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("attachmentType", "arte_cliente");
    formData.append("file", file);

    try {
      const response = await fetch("/api/storefront/order-files", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo subir el arte.");
      }

      setActionTone("success");
      setActionMessage(payload.message || "Arte cargado.");
      await loadOrders();
    } catch (error) {
      setActionTone("error");
      setActionMessage(error instanceof Error ? error.message : "No se pudo subir el arte.");
    }
  };

  const registerPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/storefront/payments", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo registrar el pago.");
      }

      setActionTone("success");
      setActionMessage(payload.message || "Pago registrado.");
      setActivePaymentOrderId(null);
      form.reset();
      await loadOrders();
    } catch (error) {
      setActionTone("error");
      setActionMessage(
        error instanceof Error ? error.message : "No se pudo registrar el pago.",
      );
    }
  };

  const activeOrders = orders.filter((order) => order.status !== "entregado").length;
  const pendingPayments = orders.reduce(
    (sum, order) =>
      sum + order.payments.filter((payment) => payment.status === "por_validar").length,
    0,
  );
  const pendingBalance = openOrders.reduce(
    (sum, order) => sum + Number(order.pending_amount ?? 0),
    0,
  );
  const ordersMissingArt = openOrders.filter(
    (order) => getArtFiles(order).length === 0,
  ).length;

  if (isLoading) {
    return <CustomerDashboardSkeleton />;
  }

  const selectedArtFiles = selectedOrder ? getArtFiles(selectedOrder) : [];
  const selectedPaymentFiles =
    selectedOrder?.files.filter((file) => file.attachment_type === "comprobante_pago") ?? [];
  const selectedFlow = selectedOrder
    ? getCustomerOrderFlow(selectedOrder, selectedArtFiles)
    : null;
  const selectedFlowClass =
    selectedFlow?.tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : selectedFlow?.tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : selectedFlow?.tone === "blue"
          ? "border-blue-200 bg-blue-50 text-blue-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <div className="space-y-6">
      {actionMessage ? <MessageBox message={actionMessage} tone={actionTone} /> : null}

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_28px_80px_rgba(15,23,42,0.2)]">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.35fr_0.65fr] lg:p-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase text-[#ffd45f]">
              Panel de cliente
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl lg:text-5xl">
              {displayName}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Gestiona lo pendiente de cada solicitud: arte, pago y seguimiento de produccion.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-white">
                {email || "Correo pendiente"}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-white">
                {activeOrders} pedido{activeOrders === 1 ? "" : "s"} activo{activeOrders === 1 ? "" : "s"}
              </span>
              {ordersMissingArt > 0 ? (
                <span className="rounded-full bg-[#ffd45f] px-3 py-1.5 text-slate-950">
                  {ordersMissingArt} requiere{ordersMissingArt === 1 ? "" : "n"} arte
                </span>
              ) : null}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <p className="text-sm font-semibold text-slate-300">Saldo pendiente</p>
            <p className="mt-2 text-3xl font-black">{formatCurrency(pendingBalance)}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {pendingPayments > 0
                ? `${pendingPayments} pago${pendingPayments === 1 ? "" : "s"} en revision.`
                : "Pagos y pedidos sincronizados con administracion."}
            </p>
            <button
              type="button"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="mt-5 inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut ? "Cerrando..." : "Cerrar sesion"}
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.64fr_1.36fr]">
        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  Informacion de cuenta
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Tus datos
                </h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                Activa
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              <AccountDetail label="Nombre" value={profile?.full_name?.trim() || "Pendiente"} />
              <AccountDetail label="Correo" value={email || "Pendiente"} />
              <AccountDetail label="Telefono" value={profile?.phone?.trim() || "Pendiente"} />
              <AccountDetail label="Cliente desde" value={formatDate(profile?.created_at ?? null)} />
            </div>
          </section>
        </aside>

        <main className="space-y-6">
          <section
            id="customer-orders"
            className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  Historial de pedidos
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Ordenes y produccion
                </h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                  {([
                    ["active", `En curso (${openOrders.length})`],
                    ["past", `Anteriores (${pastOrders.length})`],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setOrderView(value)}
                      className={`cursor-pointer rounded-[0.9rem] px-3 py-2 text-xs font-black transition sm:px-4 ${
                        orderView === value
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-950"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Link
                  href="/#catalogo"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#ffd45f] px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41]"
                >
                  Crear pedido
                </Link>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <p className="font-black text-slate-950">Aun no tienes pedidos.</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Agrega productos al carrito y continua el pedido para verlos aqui.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-5 xl:grid-cols-[0.86fr_1.14fr]">
                <div className="space-y-3">
                  {visibleOrders.length === 0 ? (
                    <div className="rounded-[1.45rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                      <p className="font-black text-slate-950">
                        {orderView === "active" ? "No hay pedidos en curso." : "No hay pedidos anteriores."}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {orderView === "active"
                          ? "Cuando prepares un pedido aparecera en esta lista."
                          : "Los pedidos entregados se guardaran aqui."}
                      </p>
                    </div>
                  ) : (
                    visibleOrders.map((order) => {
                      const artFile = getPrimaryArtFile(order);
                      const isSelected = selectedOrder?.id === order.id;

                      return (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => setSelectedOrderId(order.id)}
                          className={`w-full cursor-pointer rounded-[1.45rem] border p-3 text-left transition ${
                            isSelected
                              ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_44px_rgba(15,23,42,0.16)]"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          <div className="flex gap-3">
                            <CustomerArtPreview file={artFile} size="sm" interactive={false} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p
                                    className={`truncate text-[11px] font-semibold uppercase ${
                                      isSelected ? "text-white/55" : "text-slate-400"
                                    }`}
                                  >
                                    {order.order_number ?? "Pedido web"}
                                  </p>
                                  <h3 className="mt-1 truncate text-sm font-black sm:text-base">
                                    {order.title}
                                  </h3>
                                </div>
                                <span
                                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${
                                    isSelected
                                      ? "bg-white/10 text-white"
                                      : getArtFiles(order).length === 0 ||
                                          order.payment_review_status === "sin_pago" ||
                                          order.payment_review_status === "rechazado"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {getOrderActionLabel(order)}
                                </span>
                              </div>
                              <div className="mt-3">
                                <CustomerOrderProgressLine order={order} />
                              </div>
                              <div
                                className={`mt-3 flex flex-wrap gap-2 text-[11px] font-semibold ${
                                  isSelected ? "text-white/70" : "text-slate-500"
                                }`}
                              >
                                <span>Entrega {formatDate(order.promised_delivery_at)}</span>
                                <span>Saldo {formatCurrency(order.pending_amount)}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="min-w-0">
                  {selectedOrder && selectedFlow ? (
                    <article className="rounded-[1.65rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                      <div className="grid gap-4 lg:grid-cols-[13rem_1fr]">
                        <CustomerArtPreview file={getPrimaryArtFile(selectedOrder)} size="lg" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase text-slate-400">
                            {selectedOrder.order_number ?? "Pedido web"}
                          </p>
                          <h3 className="mt-2 break-words text-2xl font-black text-slate-950">
                            {selectedOrder.title}
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">
                              {orderStatusLabels[selectedOrder.status]}
                            </span>
                            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                              {paymentReviewLabels[selectedOrder.payment_review_status]}
                            </span>
                          </div>
                          <div className="mt-5">
                            <CustomerOrderProgressLine order={selectedOrder} />
                          </div>
                        </div>
                      </div>

                      <div className={`mt-5 rounded-2xl border px-4 py-4 ${selectedFlowClass}`}>
                        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div>
                            <p className="text-sm font-black">{selectedFlow.label}</p>
                            <p className="mt-1 text-sm leading-6 opacity-85">
                              {selectedFlow.description}
                            </p>
                          </div>
                          <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-black">
                            {selectedFlow.action}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <AccountDetail label="Entrega" value={formatDate(selectedOrder.promised_delivery_at)} />
                        <AccountDetail label="Area" value={selectedOrder.current_area ?? "Por asignar"} />
                        <AccountDetail label="Total" value={formatCurrency(selectedOrder.total_amount)} />
                        <AccountDetail label="Saldo" value={formatCurrency(selectedOrder.pending_amount)} />
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-black text-slate-950">Arte digital</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Archivo del pedido para revision y produccion.
                              </p>
                            </div>
                            {selectedOrder.status !== "entregado" ? (
                              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">
                                Subir arte
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(event) => {
                                    void uploadArt(selectedOrder.id, event.target.files?.[0] ?? null);
                                    event.currentTarget.value = "";
                                  }}
                                />
                              </label>
                            ) : null}
                          </div>
                          <div className="mt-3 space-y-2">
                            {selectedArtFiles.length === 0 ? (
                              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                                Este pedido aun no tiene arte cargado.
                              </div>
                            ) : (
                              selectedArtFiles.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.signed_url ?? "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                                >
                                  <CustomerArtPreview file={file} size="sm" interactive={false} />
                                  <span className="min-w-0 flex-1 truncate">{file.file_name}</span>
                                </a>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-black text-slate-950">Pago movil</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Administracion valida el pago antes de producir.
                              </p>
                            </div>
                            {selectedOrder.status !== "entregado" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setActivePaymentOrderId(
                                    activePaymentOrderId === selectedOrder.id ? null : selectedOrder.id,
                                  )
                                }
                                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#ffd45f] px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-[#ffcd41]"
                              >
                                {activePaymentOrderId === selectedOrder.id ? "Cerrar" : "Registrar pago"}
                              </button>
                            ) : null}
                          </div>

                          {activePaymentOrderId === selectedOrder.id ? (
                            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={registerPayment}>
                              <input type="hidden" name="orderId" value={selectedOrder.id} />
                              <input
                                name="amount"
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="Monto"
                                defaultValue={Number(selectedOrder.pending_amount ?? selectedOrder.total_amount ?? 0) || ""}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
                                required
                              />
                              <input
                                name="bank"
                                placeholder="Banco"
                                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
                              />
                              <input
                                name="payerPhone"
                                placeholder="Telefono emisor"
                                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
                              />
                              <input
                                name="reference"
                                placeholder="Referencia"
                                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
                              />
                              <label className="cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-600 sm:col-span-2">
                                Comprobante
                                <input name="proofFile" type="file" className="mt-2 block text-xs" />
                              </label>
                              <button
                                type="submit"
                                className="cursor-pointer rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:col-span-2"
                              >
                                Enviar pago
                              </button>
                            </form>
                          ) : null}

                          <div className="mt-3 space-y-2">
                            {selectedOrder.payments.length === 0 ? (
                              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                                Sin pagos registrados.
                              </p>
                            ) : (
                              selectedOrder.payments.map((payment) => (
                                <div
                                  key={payment.id}
                                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="font-semibold text-slate-950">
                                      {formatCurrency(Number(payment.amount))}
                                    </span>
                                    <span
                                      className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${paymentStatusClass[payment.status]}`}
                                    >
                                      {paymentStatusLabels[payment.status]}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Ref. {payment.reference || "sin referencia"} - {formatDate(payment.created_at)}
                                  </p>
                                </div>
                              ))
                            )}
                            {selectedPaymentFiles.length > 0 ? (
                              <p className="text-xs font-semibold text-slate-400">
                                {selectedPaymentFiles.length} comprobante{selectedPaymentFiles.length === 1 ? "" : "s"} cargado{selectedPaymentFiles.length === 1 ? "" : "s"}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <div className="rounded-[1.45rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                      <p className="font-black text-slate-950">Selecciona un pedido.</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Aqui veras el arte, pagos y avance del pedido elegido.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export function CustomerAccountClient({
  hasPublicAuth,
  onClose,
  variant = "page",
  initialMode = "login",
  showModeSwitch,
  initialNotice = null,
}: CustomerAccountClientProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(initialNotice?.message ?? "");
  const [messageTone, setMessageTone] = useState<"error" | "success">(
    initialNotice?.tone ?? "success",
  );

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerFullName, setRegisterFullName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  useEffect(() => {
    setMessage("");
  }, [mode]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!initialNotice) {
      return;
    }

    setMessage(initialNotice.message);
    setMessageTone(initialNotice.tone);
  }, [initialNotice]);

  useEffect(() => {
    if (!hasPublicAuth) {
      setIsLoading(false);
      return;
    }

    const supabase = createBrowserSupabaseClient();

    const load = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);

      if (currentSession?.user?.id) {
        const { data } = await supabase
          .from("customer_profiles")
          .select("*")
          .eq("id", currentSession.user.id)
          .maybeSingle<CustomerProfile>();

        setProfile(data ?? null);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    };

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession?.user?.id) {
        setProfile(null);
        return;
      }

      void supabase
        .from("customer_profiles")
        .select("*")
        .eq("id", nextSession.user.id)
        .maybeSingle<CustomerProfile>()
        .then(({ data }) => {
          setProfile(data ?? null);
        });
    });

    return () => subscription.unsubscribe();
  }, [hasPublicAuth]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasPublicAuth) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        throw error;
      }

      setMessageTone("success");
      setMessage("Sesion iniciada.");
      setLoginPassword("");
    } catch (error) {
      setMessageTone("error");
      setMessage(getErrorMessage(error, "No se pudo iniciar sesion."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasPublicAuth) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    setIsSubmitting(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail.trim(),
        password: registerPassword,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/confirm`
              : undefined,
          data: {
            full_name: registerFullName.trim(),
            phone: registerPhone.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session?.user?.id) {
        await supabase.from("customer_profiles").upsert({
          id: data.session.user.id,
          full_name: registerFullName.trim(),
          phone: registerPhone.trim() || null,
        });
      }

      setMessageTone("success");
      setMessage(
        data.session
          ? "Cuenta creada. Ya puedes gestionar tus pedidos."
          : "Cuenta creada. Revisa tu correo para confirmar el acceso.",
      );
      setRegisterPassword("");
    } catch (error) {
      setMessageTone("error");
      setMessage(getErrorMessage(error, "No se pudo crear la cuenta."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    if (!hasPublicAuth) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setMessageTone("success");
      setMessage("Sesion cerrada.");
    } catch (error) {
      setMessageTone("error");
      setMessage(getErrorMessage(error, "No se pudo cerrar la sesion."));
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayName =
    profile?.full_name?.trim() ||
    session?.user.user_metadata.full_name ||
    "Cliente Express Printer";
  const isDropdown = variant === "dropdown";
  const canSwitchMode = showModeSwitch ?? !isDropdown;

  if (!isDropdown && hasPublicAuth && isLoading) {
    return (
      <section className="mx-auto w-full max-w-[118rem] px-4 pb-12 pt-5 sm:px-6 lg:px-8 2xl:px-10">
        <CustomerDashboardSkeleton />
      </section>
    );
  }

  if (!isDropdown && hasPublicAuth && !isLoading && session) {
    return (
      <section className="mx-auto w-full max-w-[118rem] px-4 pb-12 pt-5 sm:px-6 lg:px-8 2xl:px-10">
        <div className="space-y-5">
          {message ? <MessageBox message={message} tone={messageTone} /> : null}
          <CustomerDashboard
            displayName={displayName}
            email={session.user.email}
            profile={profile}
            onSignOut={handleSignOut}
            isSigningOut={isSubmitting}
          />
        </div>
      </section>
    );
  }

  return (
    <section
      className={
        isDropdown
          ? "pointer-events-auto w-full max-w-[34rem] sm:max-w-[36rem]"
          : "mx-auto w-full max-w-[118rem] px-4 pb-10 pt-4 sm:px-6 sm:pb-12 lg:px-8 2xl:px-10"
      }
    >
      <div className={isDropdown ? "" : "mx-auto w-full max-w-[36rem]"}>
        <div
          className={`overflow-hidden border border-slate-200 bg-white ${
            isDropdown
              ? "rounded-[1.7rem] shadow-[0_24px_52px_rgba(15,23,42,0.12)]"
              : "rounded-[2rem] shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          }`}
        >
          {!hasPublicAuth ? (
            <div className="p-6 sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Mi cuenta
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <div className="rounded-[1.55rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                Configura <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> para activar el acceso de clientes.
              </div>
            </div>
          ) : isLoading ? (
            <CustomerDashboardSkeleton compact />
          ) : session ? (
            <CustomerAccountDropdownSummary
              displayName={displayName}
              email={session.user.email}
              onClose={onClose}
              onSignOut={handleSignOut}
              isSigningOut={isSubmitting}
              message={message}
              messageTone={messageTone}
            />
          ) : (
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Mi cuenta
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              {canSwitchMode ? (
                <div className="rounded-[1.45rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="inline-flex w-full rounded-[1.25rem] border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className={`flex-1 cursor-pointer rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition ${
                        mode === "login"
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Iniciar sesion
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className={`flex-1 cursor-pointer rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition ${
                        mode === "register"
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Registrarme
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="rounded-[1.45rem] border border-slate-200 bg-white p-5">
                <div className="mb-4">
                  <p className="text-sm leading-6 text-slate-500">
                    {mode === "login"
                      ? "Ingresa con tu correo y clave."
                      : "Crea tu acceso de cliente."}
                  </p>
                </div>

                <div>
                  {message ? (
                    <div className="mb-5">
                      <MessageBox message={message} tone={messageTone} />
                    </div>
                  ) : null}

                  {mode === "login" ? (
                    <form className="space-y-5" onSubmit={handleLogin}>
                      <div className="space-y-2">
                        <label
                          className="text-sm font-semibold text-slate-700"
                          htmlFor="customer-login-email"
                        >
                          Correo
                        </label>
                        <input
                          id="customer-login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(event) => setLoginEmail(event.target.value)}
                          required
                          autoComplete="email"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          className="text-sm font-semibold text-slate-700"
                          htmlFor="customer-login-password"
                        >
                          Clave
                        </label>
                        <input
                          id="customer-login-password"
                          type="password"
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          required
                          autoComplete="current-password"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? "Entrando..." : "Entrar"}
                      </button>

                      {!canSwitchMode ? (
                        <p className="text-center text-sm text-slate-500">
                          No tienes cuenta?{" "}
                          <Link
                            href="/registro"
                            className="font-semibold text-slate-900 transition hover:text-slate-700"
                          >
                            Registrar
                          </Link>
                        </p>
                      ) : null}
                    </form>
                  ) : (
                    <form className="space-y-5" onSubmit={handleRegister}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <label
                            className="text-sm font-semibold text-slate-700"
                            htmlFor="customer-register-name"
                          >
                            Nombre completo
                          </label>
                          <input
                            id="customer-register-name"
                            type="text"
                            value={registerFullName}
                            onChange={(event) => setRegisterFullName(event.target.value)}
                            required
                            autoComplete="name"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            className="text-sm font-semibold text-slate-700"
                            htmlFor="customer-register-phone"
                          >
                            Telefono
                          </label>
                          <input
                            id="customer-register-phone"
                            type="tel"
                            value={registerPhone}
                            onChange={(event) => setRegisterPhone(event.target.value)}
                            autoComplete="tel"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            className="text-sm font-semibold text-slate-700"
                            htmlFor="customer-register-email"
                          >
                            Correo
                          </label>
                          <input
                            id="customer-register-email"
                            type="email"
                            value={registerEmail}
                            onChange={(event) => setRegisterEmail(event.target.value)}
                            required
                            autoComplete="email"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                          />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                          <label
                            className="text-sm font-semibold text-slate-700"
                            htmlFor="customer-register-password"
                          >
                            Clave
                          </label>
                          <input
                            id="customer-register-password"
                            type="password"
                            value={registerPassword}
                            onChange={(event) => setRegisterPassword(event.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                      </button>

                      {!canSwitchMode ? (
                        <p className="text-center text-sm text-slate-500">
                          Ya tienes cuenta?{" "}
                          <Link
                            href="/?account=open"
                            className="font-semibold text-slate-900 transition hover:text-slate-700"
                          >
                            Iniciar sesion
                          </Link>
                        </p>
                      ) : null}
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
