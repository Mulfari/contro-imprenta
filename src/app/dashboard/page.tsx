import Link from "next/link";
import { redirect } from "next/navigation";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signOutAction } from "@/app/login/actions";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPanelAuthConfig } from "@/lib/supabase/config";
import { createUser, listUsers } from "@/lib/users";

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
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : "No se pudo crear el usuario.";

    redirect(`/dashboard?message=${encodeURIComponent(message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?message=Usuario%20creado");
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

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#16110e_0%,_#2b1d17_100%)] px-6 py-8 text-stone-50 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">
              Centro de control
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Bienvenido, {session.displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
              Sesion iniciada como `{session.username}` con rol `{session.role}`.
              Desde aqui podras administrar pedidos, clientes y accesos del equipo.
            </p>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/5"
            >
              Cerrar sesion
            </button>
          </form>
        </header>

        {message ? (
          <div className="rounded-[1.5rem] border border-amber-300/40 bg-amber-50 px-5 py-4 text-sm text-amber-950">
            {message}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Pedidos hoy", value: "12", detail: "4 en impresion" },
            { label: "Entregas cercanas", value: "5", detail: "Proximas 48h" },
            {
              label: "Usuarios del panel",
              value: String(users.length),
              detail: `${users.filter((user) => user.role === "admin").length} admins activos`,
            },
          ].map((card) => (
            <article
              key={card.label}
              className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 shadow-lg"
            >
              <p className="text-sm text-stone-300">{card.label}</p>
              <p className="mt-3 text-4xl font-semibold">{card.value}</p>
              <p className="mt-2 text-sm text-amber-200">{card.detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
            <h2 className="text-xl font-semibold">Flujo sugerido</h2>
            <div className="mt-5 space-y-4">
              {[
                "Registrar clientes y canales de contacto.",
                "Crear tabla de pedidos con medidas, material y acabados.",
                "Agregar estados: recibido, disenando, imprimiendo, listo, entregado.",
                "Crear reportes de ventas y tiempos de entrega.",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-4 rounded-2xl border border-white/8 bg-black/10 px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-stone-950">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-stone-200">{item}</p>
                </div>
              ))}
            </div>
          </article>

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
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
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
        </section>
      </div>
    </main>
  );
}
