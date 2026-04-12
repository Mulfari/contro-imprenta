import Link from "next/link";
import { redirect } from "next/navigation";

import { revalidatePath } from "next/cache";

import { signOutAction } from "@/app/login/actions";
import { FloatingToast } from "@/components/floating-toast";
import { getCurrentSession } from "@/lib/auth/session";
import {
  type Client,
  createClient,
  createOrder,
  listClients,
  listOrders,
  type OrderWithClient,
  type OrderStatus,
  updateOrderStatus,
} from "@/lib/business";
import {
  listActivePasswordRecoveryRequests,
  type PasswordRecoveryRequest,
} from "@/lib/password-recovery";
import { listSecurityAlerts, type SecurityAlert } from "@/lib/security-alerts";
import { hasPanelAuthConfig } from "@/lib/supabase/config";
import { createUser, listUsers } from "@/lib/users";

const orderStatuses: OrderStatus[] = [
  "recibido",
  "disenando",
  "imprimiendo",
  "listo",
  "entregado",
];

const dashboardViews = ["resumen", "clientes", "pedidos", "equipo"] as const;
type DashboardView = (typeof dashboardViews)[number];

const sideNavItems: { label: string; view: DashboardView }[] = [
  { label: "Resumen", view: "resumen" },
  { label: "Clientes", view: "clientes" },
  { label: "Pedidos", view: "pedidos" },
  { label: "Equipo", view: "equipo" },
];

const orderStatusLabels: Record<OrderStatus, string> = {
  recibido: "Recibido",
  disenando: "Disenando",
  imprimiendo: "Imprimiendo",
  listo: "Listo",
  entregado: "Entregado",
};

async function createUserAction(formData: FormData) {
  "use server";

  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    redirect("/login?message=Necesitas%20un%20usuario%20admin");
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "");
  const nationalId = String(formData.get("nationalId") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const role = String(formData.get("role") ?? "staff");

  try {
    await createUser({
      nationalId,
      username,
      password,
      displayName,
      email,
      phone,
      role: role === "admin" ? "admin" : "staff",
      createdBy: session.userId,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo crear el usuario.";

    redirect(buildTeamUrl("nuevo", message));
  }

  revalidatePath("/dashboard");
  redirect(buildTeamUrl("lista", "Usuario creado"));
}

async function createClientAction(formData: FormData) {
  "use server";

  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?message=Inicia%20sesion%20para%20continuar");
  }

  try {
    await createClient({
      name: String(formData.get("name") ?? ""),
      contactName: String(formData.get("contactName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      createdBy: session.userId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo crear el cliente.";
    redirect(buildDashboardUrl("clientes", message));
  }

  revalidatePath("/dashboard");
  redirect(buildDashboardUrl("clientes", "Cliente creado"));
}

async function createOrderAction(formData: FormData) {
  "use server";

  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?message=Inicia%20sesion%20para%20continuar");
  }

  try {
    await createOrder({
      clientId: String(formData.get("clientId") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      quantity: String(formData.get("quantity") ?? ""),
      material: String(formData.get("material") ?? ""),
      size: String(formData.get("size") ?? ""),
      dueDate: String(formData.get("dueDate") ?? ""),
      status: (String(formData.get("status") ?? "recibido") as OrderStatus),
      totalAmount: String(formData.get("totalAmount") ?? ""),
      createdBy: session.userId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo crear el pedido.";
    redirect(buildDashboardUrl("pedidos", message));
  }

  revalidatePath("/dashboard");
  redirect(buildDashboardUrl("pedidos", "Pedido creado"));
}

async function updateOrderStatusAction(formData: FormData) {
  "use server";

  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?message=Inicia%20sesion%20para%20continuar");
  }

  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "recibido") as OrderStatus;
  const activeStatus = String(formData.get("activeStatus") ?? "todos");

  try {
    await updateOrderStatus({
      orderId,
      status,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo actualizar el estado del pedido.";

    redirect(buildDashboardUrl("pedidos", message) + `&status=${activeStatus}`);
  }

  revalidatePath("/dashboard");
  redirect(
    buildDashboardUrl("pedidos", "Estado actualizado") + `&status=${activeStatus}`,
  );
}

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function resolveValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function buildDashboardUrl(view: DashboardView, message?: string) {
  const params = new URLSearchParams({ view });

  if (message) {
    params.set("message", message);
  }

  return `/dashboard?${params.toString()}`;
}

function buildTeamUrl(mode: "lista" | "nuevo", message?: string) {
  const params = new URLSearchParams({
    view: "equipo",
    team: mode,
  });

  if (message) {
    params.set("message", message);
  }

  return `/dashboard?${params.toString()}`;
}

function resolveView(value: string, isAdmin: boolean): DashboardView {
  if (value === "equipo" && !isAdmin) {
    return "resumen";
  }

  return dashboardViews.includes(value as DashboardView)
    ? (value as DashboardView)
    : "resumen";
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Sin monto";
  }

  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDueDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatDateTime(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  if (!hasPanelAuthConfig()) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-6 py-10 text-slate-900 sm:px-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
            Configuracion pendiente
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Termina la configuracion del panel.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            El dashboard ahora usa usuarios propios. Configura
            `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
            `APP_SESSION_SECRET`, `ADMIN_USERNAME` y `ADMIN_PASSWORD`.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Ir al login
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const session = await getCurrentSession();
  const params = await searchParams;
  const message = resolveValue(params.message);
  const activeStatus = resolveValue(params.status) || "todos";
  const teamMode = resolveValue(params.team) === "nuevo" ? "nuevo" : "lista";

  if (!session) {
    redirect("/login?message=Inicia%20sesion%20para%20entrar%20al%20tablero");
  }

  const users = await listUsers();
  let securityAlerts: SecurityAlert[] = [];
  let recoveryRequests: PasswordRecoveryRequest[] = [];
  let clients: Client[] = [];
  let orders: OrderWithClient[] = [];
  let schemaMessage = "";

  try {
    securityAlerts =
      session.role === "admin" ? await listSecurityAlerts(10) : [];
    recoveryRequests =
      session.role === "admin" ? await listActivePasswordRecoveryRequests(10) : [];
    clients = await listClients();
    orders = await listOrders();
  } catch {
    schemaMessage =
      "La base de datos no coincide con la ultima version del panel. Vuelve a ejecutar setup.sql en Supabase.";
  }
  const activeView = resolveView(
    resolveValue(params.view),
    session.role === "admin",
  );
  const activeOrders = orders.filter((order) => order.status !== "entregado");
  const deliveriesSoon = orders.filter((order) => {
    if (!order.due_date || order.status === "entregado") {
      return false;
    }

    const dueDate = new Date(order.due_date);
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();

    return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 2;
  });
  const sideItems = sideNavItems.filter((item) =>
    item.view === "equipo" ? session.role === "admin" : true,
  );
  const filteredOrders =
    activeStatus === "todos"
      ? orders
      : orders.filter((order) => order.status === activeStatus);
  const orderSummary = {
    total: orders.length,
    active: orders.filter((order) => order.status !== "entregado").length,
    ready: orders.filter((order) => order.status === "listo").length,
    delivered: orders.filter((order) => order.status === "entregado").length,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(245,245,247,0.92)_38%,_rgba(235,239,244,0.96)_100%)] text-slate-900">
      <FloatingToast message={message || schemaMessage} />
      <div className="min-h-screen lg:pl-[290px]">
        <aside className="w-full border border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(248,250,252,0.88))] p-5 backdrop-blur lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-[290px] lg:overflow-y-auto lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:px-5 lg:py-7">
          <div className="border-b border-slate-200 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              Imprenta Atlas
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Panel principal
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Entra a un modulo y trabaja sin ver todo a la vez.
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {sideItems.map((item) => {
              const isActive = item.view === activeView;

              return (
                <Link
                  key={item.view}
                  href={buildDashboardUrl(item.view)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                    isActive
                      ? "border-blue-200 bg-blue-50 text-slate-900 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)]"
                      : "border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-slate-400">{isActive ? "*" : "+"}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Sesion
            </p>
            <p className="mt-3 text-lg font-semibold">{session.displayName}</p>
            <p className="mt-1 text-sm text-slate-500">
              @{session.username} - {session.role}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.4rem] border border-slate-200 bg-white/75 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Activos
              </p>
              <p className="mt-2 text-3xl font-semibold">{activeOrders.length}</p>
              <p className="mt-1 text-sm text-slate-500">Pedidos en curso</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-white/75 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Clientes
              </p>
              <p className="mt-2 text-3xl font-semibold">{clients.length}</p>
              <p className="mt-1 text-sm text-slate-500">Base registrada</p>
            </div>
          </div>

          <form action={signOutAction} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cerrar sesion
            </button>
          </form>
        </aside>

        <div className="flex min-w-0 flex-col gap-6 px-4 py-4 sm:px-6 lg:px-5 lg:py-5">
          <header className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                  {activeView === "resumen" ? "Centro de control" : "Modulo activo"}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {activeView === "resumen" ? `Bienvenido, ${session.displayName}` : null}
                  {activeView === "clientes" ? "Clientes" : null}
                  {activeView === "pedidos" ? "Pedidos" : null}
                  {activeView === "equipo" ? "Equipo" : null}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  {activeView === "resumen"
                    ? "Consulta el estado general de la imprenta y entra al modulo que necesitas."
                    : null}
                  {activeView === "clientes"
                    ? "Registra clientes y consulta su informacion sin distracciones."
                    : null}
                  {activeView === "pedidos"
                    ? "Crea pedidos nuevos y revisa produccion desde una sola vista."
                    : null}
                  {activeView === "equipo"
                    ? "Administra usuarios del panel y controla los accesos del equipo."
                    : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={buildDashboardUrl("clientes")}
                  className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Cliente
                </Link>
                <Link
                  href={buildDashboardUrl("pedidos")}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Pedido
                </Link>
              </div>
            </div>
          </header>

          {activeView === "resumen" ? (
          <section className="grid gap-6">
            <div id="resumen" className="grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "Pedidos activos",
                  value: String(activeOrders.length),
                  detail: `${orders.filter((order) => order.status === "imprimiendo").length} en impresion`,
                },
                {
                  label: "Entregas cercanas",
                  value: String(deliveriesSoon.length),
                  detail: "Proximas 48h",
                },
                {
                  label: "Clientes registrados",
                  value: String(clients.length),
                  detail: `${users.length} usuarios del panel`,
                },
              ].map((card) => (
                <article
                  key={card.label}
                  className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.05)]"
                >
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-3 text-4xl font-semibold">{card.value}</p>
                  <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
                </article>
              ))}
            </div>

            {session.role === "admin" ? (
              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">Codigos de recuperacion</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Comparte estos codigos temporales con el usuario correcto. Vencen en 15 minutos.
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                      {recoveryRequests.length} activos
                    </span>
                  </div>
                  <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">Usuario</th>
                          <th className="px-4 py-3 font-medium">Codigo</th>
                          <th className="px-4 py-3 font-medium">Vence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
                        {recoveryRequests.length === 0 ? (
                          <tr>
                            <td className="px-4 py-4 text-slate-500" colSpan={3}>
                              No hay codigos de recuperacion pendientes.
                            </td>
                          </tr>
                        ) : (
                          recoveryRequests.map((request) => (
                            <tr key={request.id}>
                              <td className="px-4 py-3">
                                <div className="font-medium">{request.display_name}</div>
                                <div className="text-xs text-slate-400">@{request.username}</div>
                              </td>
                              <td className="px-4 py-3 text-base font-semibold tracking-[0.2em]">
                                {request.recovery_code}
                              </td>
                              <td className="px-4 py-3">{formatDateTime(request.expires_at)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">Alertas de administracion</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Notificaciones de intentos sensibles dentro del panel.
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                      {securityAlerts.length} alertas
                    </span>
                  </div>
                  <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">Usuario</th>
                          <th className="px-4 py-3 font-medium">Fecha</th>
                          <th className="px-4 py-3 font-medium">Detalle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
                        {securityAlerts.length === 0 ? (
                          <tr>
                            <td className="px-4 py-4 text-slate-500" colSpan={3}>
                              No hay alertas registradas.
                            </td>
                          </tr>
                        ) : (
                          securityAlerts.map((alert) => (
                            <tr key={alert.id}>
                              <td className="px-4 py-3">{alert.username}</td>
                              <td className="px-4 py-3">{formatDateTime(alert.created_at)}</td>
                              <td className="px-4 py-3">{alert.detail}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>
              </div>
            ) : null}
          </section>
          ) : null}

          {activeView === "clientes" || activeView === "pedidos" ? (
          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            {activeView === "clientes" ? (
            <article
              id="clientes"
              className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]"
            >
            <h2 className="text-xl font-semibold">Crear cliente</h2>
            <form action={createClientAction} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="name">
                  Nombre del cliente
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Panaderia Central"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="contactName">
                  Contacto
                </label>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Maria Perez"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="phone"
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Telefono"
                />
                <input
                  name="email"
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Correo"
                />
              </div>
              <textarea
                name="notes"
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Notas del cliente"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Guardar cliente
              </button>
            </form>
            </article>
            ) : null}

            {activeView === "pedidos" ? (
            <article
              id="pedidos"
              className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]"
            >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Crear pedido</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Registra un trabajo con su cliente, fecha y monto.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Total
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{orderSummary.total}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Activos
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{orderSummary.active}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Listos
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{orderSummary.ready}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Entregados
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{orderSummary.delivered}</p>
                </div>
              </div>
            </div>
            <form action={createOrderAction} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="clientId">
                  Cliente
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecciona un cliente
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-600" htmlFor="title">
                  Trabajo
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="500 tarjetas personales"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="quantity"
                  type="number"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Cantidad"
                  required
                />
                <select
                  name="status"
                  defaultValue="recibido"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <input
                  name="material"
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Material"
                />
                <input
                  name="size"
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Tamano"
                />
                <input
                  name="dueDate"
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <input
                name="totalAmount"
                type="number"
                step="0.01"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Monto total"
              />
              <textarea
                name="description"
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Detalles del pedido"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Guardar pedido
              </button>
            </form>
            </article>
            ) : null}
          </section>
          ) : null}

          {activeView === "clientes" || activeView === "pedidos" ? (
          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            {activeView === "pedidos" ? (
            <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Lista de pedidos</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Filtra por estado y actualiza el avance sin salir del panel.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["todos", ...orderStatuses].map((status) => {
                  const isActive = activeStatus === status;
                  const label =
                    status === "todos"
                      ? "Todos"
                      : orderStatusLabels[status as OrderStatus];

                  return (
                    <Link
                      key={status}
                      href={`/dashboard?view=pedidos&status=${status}`}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  No hay pedidos para este estado.
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">
                            {order.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {order.client?.name ?? "Sin cliente"} · Cantidad {order.quantity}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            {orderStatusLabels[order.status]}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            Entrega {formatDueDate(order.due_date)}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Material
                            </p>
                            <p className="mt-1">{order.material ?? "Sin definir"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Tamano
                            </p>
                            <p className="mt-1">{order.size ?? "Sin definir"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Descripcion
                            </p>
                            <p className="mt-1">{order.description ?? "Sin detalles"}</p>
                          </div>
                        </div>
                      </div>

                      <form action={updateOrderStatusAction} className="flex min-w-[220px] flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <input type="hidden" name="orderId" value={order.id} />
                        <input
                          type="hidden"
                          name="activeStatus"
                          value={activeStatus}
                        />
                        <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                          Estado rapido
                        </label>
                        <select
                          name="status"
                          defaultValue={order.status}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {orderStatusLabels[status]}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                          Actualizar
                        </button>
                      </form>
                    </div>
                  </article>
                ))
              )}
            </div>
            </article>
            ) : null}

            {activeView === "clientes" ? (
            <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
            <h2 className="text-xl font-semibold">Clientes registrados</h2>
            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Contacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
                  {clients.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-slate-500" colSpan={2}>
                        Aun no hay clientes registrados.
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{client.name}</div>
                          {client.notes ? (
                            <div className="text-xs text-slate-400">
                              {client.notes}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div>{client.contact_name ?? "Sin contacto"}</div>
                          <div className="text-xs text-slate-400">
                            {client.phone ?? client.email ?? "Sin datos"}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </article>
            ) : null}
          </section>
          ) : null}

          {activeView === "equipo" && session.role === "admin" ? (
            <section id="equipo" className="grid gap-6">
              <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Usuarios del equipo</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Administra accesos y crea nuevas cuentas cuando las necesites.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={buildTeamUrl("lista")}
                      className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                        teamMode === "lista"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      Ver usuarios
                    </Link>
                    <Link
                      href={buildTeamUrl("nuevo")}
                      className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                        teamMode === "nuevo"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      Agregar usuario
                    </Link>
                  </div>
                </div>
              </article>

              {teamMode === "lista" ? (
                <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
                  <h3 className="text-xl font-semibold">Usuarios registrados</h3>
                  <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">Nombre</th>
                          <th className="px-4 py-3 font-medium">Cedula</th>
                          <th className="px-4 py-3 font-medium">Usuario</th>
                          <th className="px-4 py-3 font-medium">Contacto</th>
                          <th className="px-4 py-3 font-medium">Rol</th>
                          <th className="px-4 py-3 font-medium">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-4 py-3">{user.display_name}</td>
                            <td className="px-4 py-3">{user.national_id}</td>
                            <td className="px-4 py-3">{user.username}</td>
                            <td className="px-4 py-3">
                              <div>{user.phone}</div>
                              <div className="text-xs text-slate-400">{user.email}</div>
                            </td>
                            <td className="px-4 py-3">{user.role}</td>
                            <td className="px-4 py-3">
                              {user.is_active ? "Activo" : "Inactivo"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              ) : null}

              {teamMode === "nuevo" ? (
                <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
                  <h3 className="text-xl font-semibold">Agregar usuario</h3>
                  <form action={createUserAction} className="mt-5 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-slate-600" htmlFor="displayName">
                        Nombre visible
                      </label>
                      <input
                        id="displayName"
                        name="displayName"
                        type="text"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="Juan Perez"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-600" htmlFor="nationalId">
                        Cedula
                      </label>
                      <input
                        id="nationalId"
                        name="nationalId"
                        type="text"
                        inputMode="numeric"
                        maxLength={8}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="12345678"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-600" htmlFor="username">
                        Usuario
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        maxLength={8}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="juan"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-600" htmlFor="email">
                        Correo
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="usuario@imprenta.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-600" htmlFor="phone">
                        Telefono
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="04141234567"
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm text-slate-600" htmlFor="role">
                          Rol
                        </label>
                        <select
                          id="role"
                          name="role"
                          defaultValue="staff"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-600" htmlFor="password">
                          Codigo de 4 digitos
                        </label>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]{4}"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          placeholder="1234"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Crear usuario
                    </button>
                  </form>
                </article>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}

