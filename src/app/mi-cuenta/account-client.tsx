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

function getOrderProgress(status: CustomerOrder["status"]) {
  const currentIndex = orderStatusSteps.indexOf(status);
  return Math.round(((currentIndex + 1) / orderStatusSteps.length) * 100);
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
  const [activePaymentOrderId, setActivePaymentOrderId] = useState<string | null>(null);

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
    } catch (error) {
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

      setActionMessage(payload.message || "Arte cargado.");
      await loadOrders();
    } catch (error) {
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

      setActionMessage(payload.message || "Pago registrado.");
      setActivePaymentOrderId(null);
      form.reset();
      await loadOrders();
    } catch (error) {
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
  const openOrders = orders.filter((order) => order.status !== "entregado");
  const pendingBalance = openOrders.reduce(
    (sum, order) => sum + Number(order.pending_amount ?? 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
        <p className="text-sm font-semibold text-slate-500">Cargando tu cuenta...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {actionMessage ? <MessageBox message={actionMessage} tone="success" /> : null}

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
              Revisa tus pedidos activos, pagos pendientes y archivos de produccion.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-white">
                {email || "Correo pendiente"}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-white">
                {activeOrders} pedido{activeOrders === 1 ? "" : "s"} activo{activeOrders === 1 ? "" : "s"}
              </span>
              <span className="rounded-full bg-[#ffd45f] px-3 py-1.5 text-slate-950">
                {pendingPayments} pago{pendingPayments === 1 ? "" : "s"} en revision
              </span>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <p className="text-sm font-semibold text-slate-300">Saldo pendiente</p>
            <p className="mt-2 text-3xl font-black">{formatCurrency(pendingBalance)}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {activeOrders} pedido{activeOrders === 1 ? "" : "s"} activo{activeOrders === 1 ? "" : "s"}.
              {pendingPayments > 0 ? ` ${pendingPayments} pago${pendingPayments === 1 ? "" : "s"} en revision.` : ""}
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
            className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:p-6"
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
              <Link
                href="/#catalogo"
                className="inline-flex items-center justify-center rounded-2xl bg-[#ffd45f] px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41]"
              >
                Crear otro pedido
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <p className="font-black text-slate-950">Aun no tienes pedidos.</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Agrega productos al carrito y continua el pedido para verlos aqui.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {orders.map((order) => {
                  const artFiles = order.files.filter(
                    (file) => file.attachment_type === "arte_cliente",
                  );
                  const paymentFiles = order.files.filter(
                    (file) => file.attachment_type === "comprobante_pago",
                  );
                  const isPaymentOpen = activePaymentOrderId === order.id;

                  return (
                    <article
                      key={order.id}
                      className="rounded-[1.65rem] border border-slate-200 bg-slate-50 p-4 sm:p-5"
                    >
                      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase text-slate-400">
                            {order.order_number ?? "Pedido web"}
                          </p>
                          <h3 className="mt-2 break-words text-xl font-black text-slate-950 sm:text-2xl">
                            {order.title}
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">
                              {orderStatusLabels[order.status]}
                            </span>
                            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                              {paymentReviewLabels[order.payment_review_status]}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1.5 text-slate-600">
                              Entrega {formatDate(order.promised_delivery_at)}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 lg:min-w-44 lg:text-right">
                          <p className="text-sm font-semibold text-slate-500">Saldo</p>
                          <p className="mt-1 text-2xl font-black text-slate-950">
                            {formatCurrency(order.pending_amount)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Total {formatCurrency(order.total_amount)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="h-2 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-[#ffd45f]"
                            style={{ width: `${getOrderProgress(order.status)}%` }}
                          />
                        </div>
                        <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] font-semibold text-slate-500">
                          {orderStatusSteps.map((status) => (
                            <span key={status}>{orderStatusLabels[status]}</span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-black text-slate-950">Arte digital</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Sube el archivo final o referencias para produccion.
                              </p>
                            </div>
                            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">
                              Subir arte
                              <input
                                type="file"
                                className="hidden"
                                onChange={(event) => {
                                  void uploadArt(order.id, event.target.files?.[0] ?? null);
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                          </div>
                          <div className="mt-3 space-y-2">
                            {artFiles.length === 0 ? (
                              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                                Sin arte cargado.
                              </p>
                            ) : (
                              artFiles.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.signed_url ?? "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                                >
                                  {file.file_name}
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
                                Registra un abono para que administracion lo valide.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActivePaymentOrderId(isPaymentOpen ? null : order.id)}
                              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#ffd45f] px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-[#ffcd41]"
                            >
                              {isPaymentOpen ? "Cerrar" : "Registrar pago"}
                            </button>
                          </div>

                          {isPaymentOpen ? (
                            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={registerPayment}>
                              <input type="hidden" name="orderId" value={order.id} />
                              <input
                                name="amount"
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="Monto"
                                defaultValue={Number(order.pending_amount ?? order.total_amount ?? 0) || ""}
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
                            {order.payments.length === 0 ? (
                              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                                Sin pagos registrados.
                              </p>
                            ) : (
                              order.payments.map((payment) => (
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
                            {paymentFiles.length > 0 ? (
                              <p className="text-xs font-semibold text-slate-400">
                                {paymentFiles.length} comprobante{paymentFiles.length === 1 ? "" : "s"} cargado{paymentFiles.length === 1 ? "" : "s"}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
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
            <div className="flex min-h-[26rem] items-center justify-center p-8 text-sm font-medium text-slate-500">
              Cargando cuenta...
            </div>
          ) : session ? (
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

              <div className="rounded-[1.45rem] border border-slate-200 bg-slate-50/70 p-5">
                <div className="space-y-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950 sm:text-[1.7rem]">
                      {displayName}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">{session.user.email}</p>
                  </div>
                </div>
              </div>

              {message ? <MessageBox message={message} tone={messageTone} /> : null}

              <div className="grid gap-3">
                <div className="rounded-[1.45rem] border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                    Datos de contacto
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Nombre
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {profile?.full_name?.trim() || "Pendiente"}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Correo
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {session.user.email}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Telefono
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {profile?.phone?.trim() || "Pendiente"}
                      </p>
                    </div>
                  </div>
                </div>

                {isDropdown ? (
                  <Link
                    href="/mi-cuenta"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-[#ffd45f] px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41]"
                  >
                    Ver mis pedidos, pagos y artes
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSubmitting}
                  className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cerrar sesion
                </button>
              </div>
            </div>
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
                            href="/mi-cuenta"
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
