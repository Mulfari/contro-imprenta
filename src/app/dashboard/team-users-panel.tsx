"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DeleteUserButton } from "@/app/dashboard/delete-user-button";
import type { AppUser } from "@/lib/users";

type TeamUsersPanelProps = {
  users: AppUser[];
  editHrefBase: string;
  createHref: string;
  deleteAction: (formData: FormData) => void;
};

function capitalizeLabel(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
}

function getRoleLabel(role: string, secondaryRole?: string | null) {
  if (role === "admin") {
    return "Admin";
  }

  if (!secondaryRole) {
    return "Staff";
  }

  return `Staff / ${capitalizeLabel(secondaryRole)}`;
}

export function TeamUsersPanel({
  users,
  editHrefBase,
  createHref,
  deleteAction,
}: TeamUsersPanelProps) {
  const [query, setQuery] = useState("");
  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) =>
      [
        user.display_name,
        user.national_id,
        user.phone,
        user.email,
        user.role,
        user.secondary_role ?? "",
        user.branch ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, users]);

  return (
    <article className="rounded-[1.4rem] border border-slate-200 bg-white/90 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:rounded-[2rem] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-xl font-semibold">Usuarios registrados</h3>
        <Link
          href={createHref}
          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Nuevo usuario
        </Link>
      </div>

      <div className="mt-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          placeholder="Buscar por nombre, cedula, telefono, email, rol o sucursal"
        />
      </div>

      <div className="mt-5 hidden overflow-hidden rounded-[1.5rem] border border-slate-200 md:block">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Cedula</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Sucursal</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
            {filteredUsers.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={6}>
                  No hay usuarios que coincidan con la busqueda.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const editHref = `${editHrefBase}${user.id}`;

                return (
                <tr
                  key={user.id}
                  className="transition hover:bg-slate-50/90"
                >
                  <td className="p-0">
                    <Link
                      href={editHref}
                      className="block cursor-pointer px-4 py-3"
                    >
                      {user.display_name}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link
                      href={editHref}
                      className="block cursor-pointer px-4 py-3"
                    >
                      {user.national_id}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link
                      href={editHref}
                      className="block cursor-pointer px-4 py-3"
                    >
                      <div>{user.phone}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link
                      href={editHref}
                      className="block cursor-pointer px-4 py-3"
                    >
                      {getRoleLabel(user.role, user.secondary_role)}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link
                      href={editHref}
                      className="block cursor-pointer px-4 py-3"
                    >
                      {user.branch ? capitalizeLabel(user.branch) : "Sin sucursal"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <Link
                        href={editHref}
                        className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Editar
                      </Link>
                      <DeleteUserButton
                        action={deleteAction}
                        userId={user.id}
                      />
                    </div>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 md:hidden">
        {filteredUsers.length === 0 ? (
          <div className="rounded-[1.3rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
            No hay usuarios que coincidan con la busqueda.
          </div>
        ) : (
          filteredUsers.map((user) => {
            const editHref = `${editHrefBase}${user.id}`;

            return (
              <article
                key={user.id}
                className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]"
              >
                <Link href={editHref} className="block cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate font-semibold text-slate-950">
                        {user.display_name}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">{user.national_id}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {getRoleLabel(user.role, user.secondary_role)}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-1 text-sm text-slate-600">
                    <p>{user.phone}</p>
                    <p className="break-words">{user.email}</p>
                    <p>{user.branch ? capitalizeLabel(user.branch) : "Sin sucursal"}</p>
                  </div>
                </Link>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Link
                    href={editHref}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Editar
                  </Link>
                  <DeleteUserButton action={deleteAction} userId={user.id} />
                </div>
              </article>
            );
          })
        )}
      </div>
    </article>
  );
}
