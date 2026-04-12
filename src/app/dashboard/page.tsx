import Link from "next/link";
import { redirect } from "next/navigation";

import { revalidatePath } from "next/cache";

import { signOutAction } from "@/app/login/actions";
import { getCurrentSession } from "@/lib/auth/session";
import {
  type Client,
  createClient,
  createOrder,
  listClients,
  listOrders,
  type OrderWithClient,
  type OrderStatus,
} from "@/lib/business";
import { hasPanelAuthConfig } from "@/lib/supabase/config";
import { createUser, listUsers } from "@/lib/users";

const orderStatuses: OrderStatus[] = [
  "recibido",
  "disenando",
  "imprimiendo",
  "listo",
  "entregado",
];

const sideNavItems = [
  { label: "Resumen", href: "#resumen" },
  { label: "Clientes", href: "#clientes" },
  { label: "Pedidos", href: "#pedidos" },
  { label: "Equipo", href: "#equipo" },
];

async function createUserAction(formData: FormData) {
  "use server";

  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    redirect("/login?message=Necesitas%20un%20usuario%20admin");
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "");
  const role = String(formData.get("role") ?? "staff");

  try {
    await createUser({
      username,
      password,
      displayName,
      role: role === "admin" ? "admin" : "staff",
      createdBy: session.userId,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo crear el usuario.";

    redirect(`/dashboard?message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?message=Usuario%20creado");
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
    redirect(`/dashboard?message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?message=Cliente%20creado");
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
    redirect(`/dashboard?message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?message=Pedido%20creado");
}

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function resolveMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) {
    return message[0] ?? "";
  }

  return message ?? "";
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  if (!hasPanelAuthConfig()) {
    return (
      <main className="min-h-screen bg-stone-950 px-6 py-10 text-stone-50 sm:px-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">
            Configuracion pendiente
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Termina la configuracion del panel.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
            El dashboard ahora usa usuarios propios. Configura
            `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
            `APP_SESSION_SECRET`, `ADMIN_USERNAME` y `ADMIN_PASSWORD`.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
            >
              Ir al login
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/5"
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
  const message = resolveMessage(params.message);

  if (!session) {
    redirect("/login?message=Inicia%20sesion%20para%20entrar%20al%20tablero");
  }

  const users = await listUsers();
  let clients: Client[] = [];
  let orders: OrderWithClient[] = [];
  let schemaMessage = "";

  try {
    clients = await listClients();
    orders = await listOrders();
  } catch {
    clients = [];
    orders = [];
    schemaMessage =
      "La base de datos no coincide con la ultima version del panel. Vuelve a ejecutar setup.sql en Supabase.";
  }
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

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#160f0c_0%,_#241713_42%,_#2f211b_100%)] text-stone-50">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.03))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.24)] backdrop-blur lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div className="border-b border-white/8 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
              Imprenta Atlas
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Panel principal
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              Opera clientes, pedidos y equipo desde un solo lugar.
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {sideNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-stone-200 transition hover:border-amber-400/40 hover:bg-black/20"
              >
                <span>{item.label}</span>
                <span className="text-amber-300">+</span>
              </a>
            ))}
          </nav>

          <div className="mt-6 rounded-[1.6rem] border border-amber-300/15 bg-amber-300/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
              Sesion
            </p>
            <p className="mt-3 text-lg font-semibold">{session.displayName}</p>
            <p className="mt-1 text-sm text-stone-300">
              @{session.username} · {session.role}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.4rem] border border-white/8 bg-black/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                Activos
              </p>
              <p className="mt-2 text-3xl font-semibold">{activeOrders.length}</p>
              <p className="mt-1 text-sm text-stone-300">Pedidos en curso</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/8 bg-black/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                Clientes
              </p>
              <p className="mt-2 text-3xl font-semibold">{clients.length}</p>
              <p className="mt-1 text-sm text-stone-300">Base registrada</p>
            </div>
          </div>

          <form action={signOutAction} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/5"
            >
              Cerrar sesion
            </button>
          </form>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <header className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.2)] backdrop-blur">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">
                  Centro de control
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Bienvenido, {session.displayName}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-300">
                  Organiza produccion, agenda de entregas y atencion al cliente
                  en un tablero mas claro y facil de operar.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#clientes"
                  className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
                >
                  Nuevo cliente
                </a>
                <a
                  href="#pedidos"
                  className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/5"
                >
                  Nuevo pedido
                </a>
              </div>
            </div>
          </header>

          {message || schemaMessage ? (
            <div className="rounded-[1.5rem] border border-amber-300/40 bg-amber-50 px-5 py-4 text-sm text-amber-950">
              {message || schemaMessage}
            </div>
          ) : null}

          <section id="resumen" className="grid gap-4 md:grid-cols-3">
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
              className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.09),_rgba(255,255,255,0.04))] p-5 shadow-lg"
            >
              <p className="text-sm text-stone-300">{card.label}</p>
              <p className="mt-3 text-4xl font-semibold">{card.value}</p>
              <p className="mt-2 text-sm text-amber-200">{card.detail}</p>
            </article>
          ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article
              id="clientes"
              className="rounded-[2rem] border border-white/10 bg-white/6 p-6"
            >
            <h2 className="text-xl font-semibold">Crear cliente</h2>
            <form action={createClientAction} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-stone-300" htmlFor="name">
                  Nombre del cliente
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                  placeholder="Panaderia Central"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-stone-300" htmlFor="contactName">
                  Contacto
                </label>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                  placeholder="Maria Perez"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="phone"
                  type="text"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                  placeholder="Telefono"
                />
                <input
                  name="email"
                  type="email"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                  placeholder="Correo"
                />
              </div>
              <textarea
                name="notes"
                className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                placeholder="Notas del cliente"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
              >
                Guardar cliente
              </button>
            </form>
            </article>

            <article
              id="pedidos"
              className="rounded-[2rem] border border-white/10 bg-white/6 p-6"
            >
            <h2 className="text-xl font-semibold">Crear pedido</h2>
            <form action={createOrderAction} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-stone-300" htmlFor="clientId">
                  Cliente
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
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
                <label className="mb-2 block text-sm text-stone-300" htmlFor="title">
                  Trabajo
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                  placeholder="500 tarjetas personales"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="quantity"
                  type="number"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                  placeholder="Cantidad"
                  required
                />
                <select
                  name="status"
                  defaultValue="recibido"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
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
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                  placeholder="Material"
                />
                <input
                  name="size"
                  type="text"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                  placeholder="Tamano"
                />
                <input
                  name="dueDate"
                  type="date"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                />
              </div>
              <input
                name="totalAmount"
                type="number"
                step="0.01"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                placeholder="Monto total"
              />
              <textarea
                name="description"
                className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                placeholder="Detalles del pedido"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
              >
                Guardar pedido
              </button>
            </form>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
            <h2 className="text-xl font-semibold">Pedidos recientes</h2>
            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/8">
              <table className="min-w-full divide-y divide-white/8 text-left text-sm">
                <thead className="bg-black/20 text-stone-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Trabajo</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Entrega</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8 bg-black/10 text-stone-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-stone-300" colSpan={4}>
                        Aun no hay pedidos creados.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{order.title}</div>
                          <div className="text-xs text-stone-400">
                            Cantidad: {order.quantity}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {order.client?.name ?? "Sin cliente"}
                        </td>
                        <td className="px-4 py-3">{order.status}</td>
                        <td className="px-4 py-3">
                          {order.due_date ?? "Sin fecha"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
            <h2 className="text-xl font-semibold">Clientes registrados</h2>
            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/8">
              <table className="min-w-full divide-y divide-white/8 text-left text-sm">
                <thead className="bg-black/20 text-stone-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Contacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8 bg-black/10 text-stone-100">
                  {clients.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-stone-300" colSpan={2}>
                        Aun no hay clientes registrados.
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{client.name}</div>
                          {client.notes ? (
                            <div className="text-xs text-stone-400">
                              {client.notes}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div>{client.contact_name ?? "Sin contacto"}</div>
                          <div className="text-xs text-stone-400">
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
          </section>

          {session.role === "admin" ? (
            <section
              id="equipo"
              className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]"
            >
              <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
              <h2 className="text-xl font-semibold">Crear usuario</h2>
              <form action={createUserAction} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-stone-300" htmlFor="displayName">
                    Nombre visible
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                    placeholder="Juan Perez"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-stone-300" htmlFor="username">
                    Usuario
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                    placeholder="juan"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-stone-300" htmlFor="password">
                    Contrasena
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                    placeholder="Minimo 6 caracteres"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-stone-300" htmlFor="role">
                    Rol
                  </label>
                  <select
                    id="role"
                    name="role"
                    defaultValue="staff"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-stone-50 outline-none transition focus:border-amber-400"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
                >
                  Crear usuario
                </button>
              </form>
              </article>

              <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
              <h2 className="text-xl font-semibold">Usuarios registrados</h2>
              <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/8">
                <table className="min-w-full divide-y divide-white/8 text-left text-sm">
                  <thead className="bg-black/20 text-stone-300">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nombre</th>
                      <th className="px-4 py-3 font-medium">Usuario</th>
                      <th className="px-4 py-3 font-medium">Rol</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8 bg-black/10 text-stone-100">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-3">{user.display_name}</td>
                        <td className="px-4 py-3">{user.username}</td>
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
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
