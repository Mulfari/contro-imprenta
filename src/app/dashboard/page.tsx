import Link from "next/link";
import { redirect } from "next/navigation";

import { revalidatePath } from "next/cache";

import {
  ActivePersonnelCard,
  type ActivePersonnelItem,
} from "@/app/dashboard/active-personnel-card";
import { AdminNotificationsPanel } from "@/app/dashboard/admin-notifications-panel";
import { ClientDetailsPanel } from "@/app/dashboard/client-details-modal";
import { ClientModal } from "@/app/dashboard/client-modal";
import { DeleteClientButton } from "@/app/dashboard/delete-client-button";
import { DashboardLiveRefresh } from "@/app/dashboard/dashboard-live-refresh";
import {
  NotificationCenterButton,
  type DashboardNotificationItem,
} from "@/app/dashboard/notification-center-button";
import { TeamUserModal } from "@/app/dashboard/team-user-modal";
import { TeamUsersPanel } from "@/app/dashboard/team-users-panel";
import { signOutAction } from "@/app/login/actions";
import { FloatingToast } from "@/components/floating-toast";
import { getCurrentSession } from "@/lib/auth/session";
import {
  type Client,
  createClient,
  createOrder,
  deleteClient,
  listClients,
  listOrders,
  type OrderWithClient,
  type OrderStatus,
  updateClient,
  updateOrderStatus,
} from "@/lib/business";
import {
  listActivePasswordRecoveryRequests,
  type PasswordRecoveryRequest,
} from "@/lib/password-recovery";
import {
  countActivePanelSessions,
  listActivePanelSessions,
} from "@/lib/session-presence";
import {
  createSecurityAlert,
  listSecurityAlerts,
  type SecurityAlert,
} from "@/lib/security-alerts";
import { hasPanelAuthConfig } from "@/lib/supabase/config";
import {
  type AppBranch,
  createUser,
  deleteUser,
  listUsers,
  type StaffSecondaryRole,
  updateUser,
} from "@/lib/users";

const orderStatuses: OrderStatus[] = [
  "recibido",
  "disenando",
  "imprimiendo",
  "listo",
  "entregado",
];

const dashboardViews = [
  "resumen",
  "clientes",
  "pedidos",
  "inventario",
  "proveedores",
  "equipo",
] as const;
type DashboardView = (typeof dashboardViews)[number];

const sideNavItems: { label: string; view: DashboardView }[] = [
  { label: "Resumen", view: "resumen" },
  { label: "Clientes", view: "clientes" },
  { label: "Pedidos", view: "pedidos" },
  { label: "Inventario", view: "inventario" },
  { label: "Proveedores", view: "proveedores" },
  { label: "Equipo", view: "equipo" },
];

const userSideNavViews: DashboardView[] = ["resumen", "clientes", "pedidos"];
const adminSideNavViews: DashboardView[] = [
  "inventario",
  "proveedores",
  "equipo",
];
const dashboardTimeZone = "America/Caracas";
const activePresenceWindowMs = 5 * 60 * 1000;

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

  const firstName = normalizePersonalName(String(formData.get("firstName") ?? ""));
  const lastName = normalizePersonalName(String(formData.get("lastName") ?? ""));
  const nationalId = String(formData.get("nationalId") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const role = String(formData.get("role") ?? "staff");
  const secondaryRole = String(formData.get("secondaryRole") ?? "");
  const branch = String(formData.get("branch") ?? "");

  if (!firstName || !lastName) {
    redirect(buildTeamUrl("nuevo", "Escribe nombre y apellido del usuario."));
  }

  const displayName = `${firstName} ${lastName}`.trim();
  try {
    await createUser({
      nationalId,
      displayName,
      email,
      phone,
      role: role === "admin" ? "admin" : "staff",
      secondaryRole:
        role === "staff" ? (secondaryRole as StaffSecondaryRole | "") || null : null,
      branch: (branch as AppBranch | "") || null,
      createdBy: session.userId,
    });
    await createSecurityAlert({
      userId: session.userId,
      username: session.username,
      detail: `Creo el usuario ${displayName}.`,
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

async function updateUserAction(formData: FormData) {
  "use server";

  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    redirect("/login?message=Necesitas%20un%20usuario%20admin");
  }

  const userId = String(formData.get("userId") ?? "");
  const firstName = normalizePersonalName(String(formData.get("firstName") ?? ""));
  const lastName = normalizePersonalName(String(formData.get("lastName") ?? ""));
  const nationalId = String(formData.get("nationalId") ?? "");
  const email = String(formData.get("email") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const role = String(formData.get("role") ?? "staff");
  const secondaryRole = String(formData.get("secondaryRole") ?? "");
  const branch = String(formData.get("branch") ?? "");

  if (!userId) {
    redirect(buildTeamUrl("lista", "No se pudo identificar el usuario."));
  }

  if (!firstName || !lastName) {
    redirect(buildTeamEditUrl(userId, "Escribe nombre y apellido del usuario."));
  }

  const displayName = `${firstName} ${lastName}`.trim();

  try {
    await updateUser({
      userId,
      nationalId,
      displayName,
      email,
      phone,
      role: role === "admin" ? "admin" : "staff",
      secondaryRole:
        role === "staff" ? (secondaryRole as StaffSecondaryRole | "") || null : null,
      branch: (branch as AppBranch | "") || null,
    });
    await createSecurityAlert({
      userId: session.userId,
      username: session.username,
      detail: `Modifico el usuario ${displayName}.`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo actualizar el usuario.";

    redirect(buildTeamEditUrl(userId, message));
  }

  revalidatePath("/dashboard");
  redirect(buildTeamUrl("lista", "Usuario actualizado"));
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
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      documentId: String(formData.get("documentId") ?? ""),
      address: String(formData.get("address") ?? ""),
      preferredBranch: String(formData.get("preferredBranch") ?? ""),
      referenceFiles: String(formData.get("referenceFiles") ?? ""),
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

async function updateClientAction(formData: FormData) {
  "use server";

  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    redirect("/login?message=Necesitas%20un%20usuario%20admin");
  }

  const clientId = String(formData.get("clientId") ?? "");

  try {
    await updateClient({
      clientId,
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      documentId: String(formData.get("documentId") ?? ""),
      address: String(formData.get("address") ?? ""),
      preferredBranch: String(formData.get("preferredBranch") ?? ""),
      referenceFiles: String(formData.get("referenceFiles") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo actualizar el cliente.";
    redirect(buildClientUrl("editar", clientId, message));
  }

  revalidatePath("/dashboard");
  redirect(buildClientUrl("detalle", clientId, "Cliente actualizado"));
}

async function deleteClientAction(formData: FormData) {
  "use server";

  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    redirect("/login?message=Necesitas%20un%20usuario%20admin");
  }

  const clientId = String(formData.get("clientId") ?? "");

  try {
    await deleteClient(clientId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo eliminar el cliente.";
    redirect(buildDashboardUrl("clientes", message));
  }

  revalidatePath("/dashboard");
  redirect(buildDashboardUrl("clientes", "Cliente eliminado"));
}

async function deleteUserAction(formData: FormData) {
  "use server";

  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    redirect("/login?message=Necesitas%20un%20usuario%20admin");
  }

  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    redirect(buildTeamUrl("lista", "No se pudo identificar el usuario."));
  }

  if (userId === session.userId) {
    redirect(buildTeamUrl("lista", "No puedes borrar tu propio usuario."));
  }

  try {
    await deleteUser(userId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo eliminar el usuario.";

    redirect(buildTeamUrl("lista", message));
  }

  revalidatePath("/dashboard");
  redirect(buildTeamUrl("lista", "Usuario eliminado"));
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

function buildClientUrl(
  mode: "lista" | "nuevo" | "editar" | "detalle",
  clientId?: string,
  message?: string,
  query?: string,
) {
  const params = new URLSearchParams({ view: "clientes" });

  if (mode === "nuevo") {
    params.set("clientMode", "nuevo");
  }

  if (mode === "editar") {
    params.set("clientMode", "editar");
  }

  if (clientId) {
    params.set("client", clientId);
  }

  if (query) {
    params.set("clientQuery", query);
  }

  if (message) {
    params.set("message", message);
  }

  return `/dashboard?${params.toString()}`;
}

function buildTeamUrl(mode: "lista" | "nuevo" | "editar", message?: string, userId?: string) {
  const params = new URLSearchParams({
    view: "equipo",
    team: mode,
  });

  if (userId) {
    params.set("user", userId);
  }

  if (message) {
    params.set("message", message);
  }

  return `/dashboard?${params.toString()}`;
}

function buildTeamEditUrl(userId: string, message?: string) {
  return buildTeamUrl("editar", message, userId);
}

function resolveView(value: string, isAdmin: boolean): DashboardView {
  if (
    ["inventario", "proveedores", "equipo"].includes(value) &&
    !isAdmin
  ) {
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

function formatSessionDuration(value: string) {
  const startedAt = new Date(value).getTime();

  if (Number.isNaN(startedAt)) {
    return "Sin dato";
  }

  const diffMs = Math.max(0, Date.now() - startedAt);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${Math.max(1, minutes)} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

function getDateKey(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: dashboardTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

function capitalizeLabel(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
}

function normalizePersonalName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

function splitDisplayName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return {
      firstName: parts[0] ?? "",
      lastName: "",
    };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) ?? "",
  };
}

function getAdminNotificationTitle(detail: string) {
  const normalizedDetail = detail.toLowerCase();

  if (normalizedDetail.includes("intento de inicio de sesion")) {
    return "Intento de inicio de sesion";
  }

  if (normalizedDetail.includes("recuperacion")) {
    return "Solicitud de recuperacion";
  }

  if (normalizedDetail.includes("creo el usuario")) {
    return "Usuario creado";
  }

  if (normalizedDetail.includes("modifico el usuario")) {
    return "Usuario modificado";
  }

  return "Actividad del panel";
}

function getViewLabel(view: DashboardView) {
  switch (view) {
    case "resumen":
      return "Resumen";
    case "clientes":
      return "Clientes";
    case "pedidos":
      return "Pedidos";
    case "inventario":
      return "Inventario";
    case "proveedores":
      return "Proveedores";
    case "equipo":
      return "Equipo";
    default:
      return "Resumen";
  }
}

function getDashboardHeaderLabel(
  view: DashboardView,
  selectedClient: Client | null,
  clientMode: "lista" | "nuevo" | "editar",
) {
  if (view === "clientes" && clientMode === "lista" && selectedClient) {
    return selectedClient.name;
  }

  return getViewLabel(view);
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
  const clientModeParam = resolveValue(params.clientMode);
  const clientMode =
    clientModeParam === "nuevo" || clientModeParam === "editar"
      ? clientModeParam
      : "lista";
  const selectedClientId = resolveValue(params.client);
  const clientQuery = resolveValue(params.clientQuery).trim();
  const teamParam = resolveValue(params.team);
  const teamMode =
    teamParam === "nuevo" || teamParam === "editar" ? teamParam : "lista";
  const selectedTeamUserId = resolveValue(params.user);

  if (!session) {
    redirect("/login?message=Inicia%20sesion%20para%20entrar%20al%20tablero");
  }

  const users = await listUsers();
  let securityAlerts: SecurityAlert[] = [];
  let recoveryRequests: PasswordRecoveryRequest[] = [];
  let clients: Client[] = [];
  let orders: OrderWithClient[] = [];
  let activeStaffCount = 0;
  let activeSessions: Awaited<ReturnType<typeof listActivePanelSessions>> = [];
  let schemaMessage = "";

  try {
    securityAlerts =
      session.role === "admin" ? await listSecurityAlerts(10) : [];
    recoveryRequests =
      session.role === "admin" ? await listActivePasswordRecoveryRequests(10) : [];
    clients = await listClients();
    orders = await listOrders();
    activeStaffCount =
      session.role === "admin"
        ? await countActivePanelSessions(activePresenceWindowMs)
        : 0;
    activeSessions =
      session.role === "admin"
        ? await listActivePanelSessions(activePresenceWindowMs)
        : [];
  } catch {
    schemaMessage =
      "La base de datos no coincide con la ultima version del panel. Vuelve a ejecutar setup.sql en Supabase.";
  }
  const activeView = resolveView(
    resolveValue(params.view),
    session.role === "admin",
  );
  const activeOrders = orders.filter((order) => order.status !== "entregado");
  const todayKey = getDateKey(new Date());
  const userSideItems = sideNavItems.filter((item) =>
    userSideNavViews.includes(item.view),
  );
  const adminSideItems =
    session.role === "admin"
      ? sideNavItems.filter((item) => adminSideNavViews.includes(item.view))
      : [];
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
  const sessionInitial = capitalizeLabel(session.displayName).charAt(0);
  const usersById = new Map(users.map((user) => [user.id, user]));
  const completedToday = orders.filter(
    (order) =>
      order.status === "entregado" && getDateKey(order.created_at) === todayKey,
  ).length;
  const billedToday = orders.reduce((sum, order) => {
    if (getDateKey(order.created_at) !== todayKey) {
      return sum;
    }

    return sum + (order.total_amount ?? 0);
  }, 0);
  const activePersonnelItems: ActivePersonnelItem[] = activeSessions.map((activeSession) => {
    const user = usersById.get(activeSession.user_id);

    return {
      id: activeSession.id,
      displayName: user?.display_name ?? "Usuario desconocido",
      role: capitalizeLabel(user?.role ?? "staff"),
      connectedAtLabel: formatDateTime(activeSession.connected_at),
      activeForLabel: formatSessionDuration(activeSession.connected_at),
    };
  });
  const adminNotificationItems: DashboardNotificationItem[] =
    session.role === "admin"
      ? [
          ...recoveryRequests.map((request) => ({
            id: `recovery-${request.id}`,
            type: "recovery" as const,
            title: "Codigo de recuperacion solicitado",
            subject: request.display_name,
            detail: `Codigo generado: ${request.recovery_code}. Comparte este codigo con el usuario correcto para que pueda restablecer su acceso.`,
            createdAt: request.created_at,
            createdAtLabel: formatDateTime(request.created_at),
          })),
          ...securityAlerts.map((alert) => ({
            id: `alert-${alert.id}`,
            type: "alert" as const,
            title: getAdminNotificationTitle(alert.detail),
            subject:
              usersById.get(alert.user_id ?? "")?.display_name ?? "Usuario desconocido",
            detail: alert.detail,
            createdAt: alert.created_at,
            createdAtLabel: formatDateTime(alert.created_at),
          })),
        ].sort(
          (left, right) =>
            new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
        )
      : [];
  const selectedTeamUser =
    session.role === "admin"
      ? users.find((user) => user.id === selectedTeamUserId) ?? null
      : null;
  const selectedTeamUserNames = selectedTeamUser
    ? splitDisplayName(selectedTeamUser.display_name)
    : null;
  const filteredClients = clients.filter((client) => {
    if (!clientQuery) {
      return true;
    }

    const haystack = [
      client.name,
      client.phone ?? "",
      client.email ?? "",
      client.document_id ?? "",
      client.address ?? "",
      client.reference_files ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(clientQuery.toLowerCase());
  });
  const selectedClient =
    filteredClients.find((client) => client.id === selectedClientId) ??
    clients.find((client) => client.id === selectedClientId) ??
    null;
  const isClientDetailView =
    activeView === "clientes" && clientMode === "lista" && selectedClient !== null;
  const selectedClientOrders = selectedClient
    ? orders.filter((order) => order.client_id === selectedClient.id)
    : [];
  const clientPendingTotals = new Map<string, number>();

  for (const order of orders) {
    if (!order.client_id || order.total_amount === null || order.status === "entregado") {
      continue;
    }

    clientPendingTotals.set(
      order.client_id,
      (clientPendingTotals.get(order.client_id) ?? 0) + order.total_amount,
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(245,245,247,0.92)_38%,_rgba(235,239,244,0.96)_100%)] text-slate-900">
      <DashboardLiveRefresh />
      <FloatingToast message={message || schemaMessage} />
      <div className="min-h-screen lg:pl-[290px]">
        <aside className="w-full border border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(248,250,252,0.88))] p-5 backdrop-blur lg:fixed lg:left-0 lg:top-0 lg:flex lg:h-screen lg:w-[290px] lg:flex-col lg:overflow-hidden lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r lg:px-5 lg:py-7">
          <div className="border-b border-slate-200 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              Express Printer
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Panel administrativo
            </h1>
          </div>

          <div className="mt-6 space-y-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
            <div>
              <nav className="space-y-2">
                {userSideItems.map((item) => {
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
            </div>

            {adminSideItems.length > 0 ? (
              <div>
                <p className="border-b border-slate-200 pb-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Opciones administrativas
                </p>
                <nav className="mt-3 space-y-2">
                  {adminSideItems.map((item) => {
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
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:mt-5 lg:grid-cols-1">
            <div className="rounded-[1.4rem] border border-slate-200 bg-white/75 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Nuevos pedidos
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {orders.filter((order) => order.status === "recibido").length}
              </p>
              <p className="mt-1 text-sm text-slate-500">Pendientes por iniciar</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-white/75 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Pedidos activos
              </p>
              <p className="mt-2 text-3xl font-semibold">{activeOrders.length}</p>
              <p className="mt-1 text-sm text-slate-500">Pedidos en curso</p>
            </div>
          </div>

          <form action={signOutAction} className="mt-6 lg:mt-5">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cerrar sesion
            </button>
          </form>

        </aside>

        <div
          className={`flex min-w-0 flex-col px-4 py-4 sm:px-6 lg:px-5 lg:py-5 ${
            isClientDetailView ? "gap-3" : "gap-6"
          }`}
        >
          <div
            className={`grid gap-4 ${
              isClientDetailView
                ? "lg:grid-cols-[minmax(0,1fr)_220px_280px]"
                : "lg:grid-cols-[minmax(0,1fr)_220px_280px]"
            }`}
          >
            <header className="rounded-[1.7rem] border border-slate-200/80 bg-white/88 px-6 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="h-11 w-1.5 rounded-full bg-slate-900" />
                <div className="min-w-0">
                  {isClientDetailView && selectedClient ? (
                    <div className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                      <Link
                        href={buildDashboardUrl("clientes")}
                        className="cursor-pointer text-slate-500 transition hover:text-slate-900"
                      >
                        Clientes
                      </Link>
                      <span className="text-slate-300">/</span>
                      <span className="truncate">
                        {getDashboardHeaderLabel(activeView, selectedClient, clientMode)}
                      </span>
                    </div>
                  ) : (
                    <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                      {getDashboardHeaderLabel(activeView, selectedClient, clientMode)}
                    </h2>
                  )}
                </div>
              </div>
            </header>

            <NotificationCenterButton
              items={adminNotificationItems}
              scopeKey={session.userId}
            />

            <aside className="rounded-[1.5rem] border border-slate-200/80 bg-white/88 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {sessionInitial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {capitalizeLabel(session.displayName)}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      {capitalizeLabel(session.role)}
                    </p>
                  </div>
                </div>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                    aria-label="Cerrar sesion"
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
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <path d="M16 17l5-5-5-5" />
                      <path d="M21 12H9" />
                    </svg>
                  </button>
                </form>
              </div>
            </aside>
          </div>

          {activeView === "resumen" ? (
          <section className="grid gap-6">
            <div id="resumen" className="grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "Pedidos completados de hoy",
                  value: String(completedToday),
                  detail: "Entregados durante la jornada",
                },
                {
                  label: "Caja",
                  value: formatCurrency(billedToday),
                  detail: "Facturado hoy",
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
              <ActivePersonnelCard
                count={activeStaffCount}
                items={activePersonnelItems}
              />
            </div>

            {session.role === "admin" ? (
              <AdminNotificationsPanel items={adminNotificationItems} />
            ) : null}
          </section>
          ) : null}

          {activeView === "clientes" || activeView === "pedidos" ? (
          <section
            className={
              activeView === "clientes"
                ? "grid gap-6"
                : "grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"
            }
          >
            {activeView === "clientes" && !isClientDetailView ? (
            <article
              id="clientes"
              className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]"
            >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Clientes registrados</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Busca, selecciona y administra la base de clientes.
                </p>
              </div>
              {session.role === "admin" ? (
                <Link
                  href={buildClientUrl("nuevo", undefined, undefined, clientQuery)}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Nuevo cliente
                </Link>
              ) : null}
            </div>

            <form className="mt-5" action="/dashboard" method="get">
              <input type="hidden" name="view" value="clientes" />
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  name="clientQuery"
                  defaultValue={clientQuery}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Buscar por nombre, telefono, email, cedula o direccion"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Buscar
                </button>
              </div>
            </form>

            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Contacto</th>
                    <th className="px-4 py-3 font-medium">Datos</th>
                    <th className="px-4 py-3 font-medium">Total por cobrar</th>
                    {session.role === "admin" ? (
                      <th className="px-4 py-3 font-medium">Acciones</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-4 text-slate-500"
                        colSpan={session.role === "admin" ? 5 : 4}
                      >
                        No hay clientes que coincidan con la busqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const isSelected = selectedClient?.id === client.id;
                      const pendingTotal = clientPendingTotals.get(client.id) ?? 0;
                      const hasPendingBalance = pendingTotal > 0;
                      const detailHref = buildClientUrl(
                        "detalle",
                        client.id,
                        undefined,
                        clientQuery,
                      );

                      return (
                        <tr
                          key={client.id}
                          className={`transition hover:bg-slate-50/90 ${
                            isSelected ? "bg-blue-50/60" : ""
                          }`}
                        >
                          <td className="p-0">
                            <Link
                              href={detailHref}
                              className="block cursor-pointer px-4 py-3"
                            >
                              <div className="font-medium">{client.name}</div>
                              {client.notes ? (
                                <div className="line-clamp-1 text-xs text-slate-400">
                                  {client.notes}
                                </div>
                              ) : null}
                            </Link>
                          </td>
                          <td className="p-0">
                            <Link
                              href={detailHref}
                              className="block cursor-pointer px-4 py-3"
                            >
                              <div>{client.phone ?? "Sin telefono"}</div>
                              <div className="text-xs text-slate-400">
                                {client.email ?? "Sin email"}
                              </div>
                            </Link>
                          </td>
                          <td className="p-0">
                            <Link
                              href={detailHref}
                              className="block cursor-pointer px-4 py-3"
                            >
                              <div>{client.document_id ?? "Sin cedula / RIF"}</div>
                              <div className="text-xs text-slate-400">
                                {client.preferred_branch ?? client.address ?? "Sin direccion"}
                              </div>
                            </Link>
                          </td>
                          <td className="p-0">
                            <Link
                              href={detailHref}
                              className="flex cursor-pointer items-center gap-3 px-4 py-3"
                            >
                              <span
                                className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                                  hasPendingBalance
                                    ? "bg-rose-100 text-rose-600"
                                    : "bg-emerald-100 text-emerald-600"
                                }`}
                                aria-hidden="true"
                              >
                                {hasPendingBalance ? (
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.9"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 8v5" />
                                    <path d="M12 16h.01" />
                                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                                  </svg>
                                ) : (
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.9"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M20 6 9 17l-5-5" />
                                  </svg>
                                )}
                              </span>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {formatCurrency(pendingTotal)}
                                </div>
                                <div
                                  className={`text-xs ${
                                    hasPendingBalance ? "text-rose-500" : "text-emerald-600"
                                  }`}
                                >
                                  {hasPendingBalance
                                    ? "Saldo pendiente"
                                    : "Sin saldo pendiente"}
                                </div>
                              </div>
                            </Link>
                          </td>
                          {session.role === "admin" ? (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Link
                                  href={buildClientUrl(
                                    "editar",
                                    client.id,
                                    undefined,
                                    clientQuery,
                                  )}
                                  className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                  Editar
                                </Link>
                                <DeleteClientButton
                                  action={deleteClientAction}
                                  clientId={client.id}
                                />
                              </div>
                            </td>
                          ) : null}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

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

          {activeView === "pedidos" ? (
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

          </section>
          ) : null}

          {activeView === "clientes" && clientMode === "nuevo" && session.role === "admin" ? (
            <ClientModal
              closeHref={buildClientUrl("lista", selectedClient?.id, undefined, clientQuery)}
              action={createClientAction}
            />
          ) : null}

          {activeView === "clientes" &&
          clientMode === "editar" &&
          session.role === "admin" &&
          selectedClient ? (
            <ClientModal
              closeHref={buildClientUrl("detalle", selectedClient.id, undefined, clientQuery)}
              action={updateClientAction}
              mode="edit"
              initialData={{
                clientId: selectedClient.id,
                name: selectedClient.name,
                phone: selectedClient.phone ?? "",
                email: selectedClient.email ?? "",
                documentId: selectedClient.document_id ?? "",
                address: selectedClient.address ?? "",
                preferredBranch: selectedClient.preferred_branch ?? "",
                referenceFiles: selectedClient.reference_files ?? "",
                notes: selectedClient.notes ?? "",
              }}
            />
          ) : null}

          {isClientDetailView && selectedClient ? (
            <ClientDetailsPanel
              client={selectedClient}
              orders={selectedClientOrders}
              closeHref={buildClientUrl("lista", undefined, undefined, clientQuery)}
            />
          ) : null}

          {activeView === "equipo" && session.role === "admin" ? (
            <section id="equipo" className="grid gap-6">
              <TeamUsersPanel
                users={users}
                createHref={buildTeamUrl("nuevo")}
                editHrefBase="/dashboard?view=equipo&team=editar&user="
                deleteAction={deleteUserAction}
              />

              {teamMode === "nuevo" ? (
                <TeamUserModal
                  closeHref={buildTeamUrl("lista")}
                  action={createUserAction}
                />
              ) : null}

              {teamMode === "editar" && selectedTeamUser ? (
                <TeamUserModal
                  closeHref={buildTeamUrl("lista")}
                  action={updateUserAction}
                  mode="edit"
                  initialData={{
                    userId: selectedTeamUser.id,
                    firstName: selectedTeamUserNames?.firstName ?? "",
                    lastName: selectedTeamUserNames?.lastName ?? "",
                    nationalId: selectedTeamUser.national_id,
                    phone: selectedTeamUser.phone,
                    email: selectedTeamUser.email,
                    role: selectedTeamUser.role,
                    secondaryRole: selectedTeamUser.secondary_role ?? "",
                    branch: selectedTeamUser.branch ?? "",
                  }}
                />
              ) : null}
            </section>
          ) : null}

          {(activeView === "inventario" || activeView === "proveedores") &&
          session.role === "admin" ? (
            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {activeView === "inventario"
                        ? "Inventario"
                        : "Proveedores"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {activeView === "inventario"
                        ? "Organiza materiales, stock y movimientos internos de la imprenta."
                        : "Centraliza los datos de talleres, distribuidores y aliados del negocio."}
                    </p>
                  </div>
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                    Proximo modulo
                  </span>
                </div>

                <div className="mt-6 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                  <p className="text-base font-semibold text-slate-900">
                    Este modulo ya tiene espacio reservado en el panel.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    En el siguiente paso podemos construir sus formularios, listados
                    y controles reales sin mover la navegacion administrativa.
                  </p>
                </div>
              </article>

              <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
                <h3 className="text-lg font-semibold text-slate-900">
                  Lo siguiente aqui
                </h3>
                <div className="mt-5 space-y-3">
                  {(activeView === "inventario"
                    ? [
                        "Registrar materiales y productos base",
                        "Controlar entradas, salidas y stock actual",
                        "Relacionar inventario con pedidos en produccion",
                      ]
                    : [
                        "Guardar datos de contacto y categoria del proveedor",
                        "Registrar servicios, materiales y observaciones",
                        "Consultar rapidamente proveedores frecuentes",
                      ]
                  ).map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </article>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}

