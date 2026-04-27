import { execSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";

import { SqlCopyButton } from "./sql-copy-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SQL Supabase | Express Printer",
  robots: {
    index: false,
    follow: false,
  },
};

type GitEntry = {
  hash: string;
  message: string;
};

type PatchEntry = {
  name: string;
  updatedAt: string;
  size: number;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function readGitEntries(rootPath: string) {
  try {
    const output = execSync(
      "git log --pretty=format:%h%x09%s -8 -- supabase/setup.sql",
      {
        cwd: rootPath,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    );

    return output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [hash, ...messageParts] = line.split("\t");

        return {
          hash,
          message: messageParts.join("\t") || "Cambio en setup.sql",
        };
      }) satisfies GitEntry[];
  } catch {
    return [] satisfies GitEntry[];
  }
}

function readCurrentCommit(rootPath: string) {
  try {
    return execSync("git rev-parse --short HEAD", {
      cwd: rootPath,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "local";
  }
}

function readPatchEntries(supabasePath: string) {
  try {
    return readdirSync(supabasePath, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .filter((entry) => entry.name !== "setup.sql")
      .filter((entry) => entry.name.endsWith(".sql") || entry.name.endsWith(".txt"))
      .map((entry) => {
        const fullPath = path.join(supabasePath, entry.name);
        const stats = statSync(fullPath);

        return {
          name: entry.name,
          updatedAt: formatDate(stats.mtime),
          size: stats.size,
        };
      })
      .sort((first, second) => first.name.localeCompare(second.name)) satisfies PatchEntry[];
  } catch {
    return [] satisfies PatchEntry[];
  }
}

export default function SqlPage() {
  const rootPath = process.cwd();
  const supabasePath = path.join(rootPath, "supabase");
  const setupPath = path.join(supabasePath, "setup.sql");
  const sql = readFileSync(setupPath, "utf8");
  const setupStats = statSync(setupPath);
  const gitEntries = readGitEntries(rootPath);
  const patchEntries = readPatchEntries(supabasePath);
  const currentCommit = readCurrentCommit(rootPath);
  const lineCount = sql.split("\n").length;

  return (
    <main className="min-h-screen bg-[#f3f5f8] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[118rem] space-y-5">
        <header className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#ffd45f]">
                Desarrollo Supabase
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
                setup.sql actualizado
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                Copia el script completo para pegarlo en Supabase. Esta pagina existe para desarrollo y no debe tratarse como documentacion publica.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[25rem]">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-300">Version</p>
                <p className="mt-1 font-black">{currentCommit}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-300">Actualizado</p>
                <p className="mt-1 font-black">{formatDate(setupStats.mtime)}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[22rem_1fr]">
          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Archivo principal
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Supabase setup
              </h2>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-slate-400">Ruta</p>
                  <p className="mt-1 break-words font-semibold text-slate-800">
                    supabase/setup.sql
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-slate-400">Lineas</p>
                  <p className="mt-1 font-semibold text-slate-800">{lineCount}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-slate-400">Tamano</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {(setupStats.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-2">
                <SqlCopyButton sql={sql} />
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Volver a la tienda
                </Link>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Historial
              </p>
              <div className="mt-4 space-y-3">
                {gitEntries.length > 0 ? (
                  gitEntries.map((entry) => (
                    <div key={`${entry.hash}-${entry.message}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="font-mono text-xs font-black text-slate-950">
                        {entry.hash}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        {entry.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No se pudo leer el historial Git en este entorno.
                  </p>
                )}
              </div>
            </section>

            {patchEntries.length > 0 ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Parches sueltos
                </p>
                <div className="mt-4 space-y-2">
                  {patchEntries.map((entry) => (
                    <div key={entry.name} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="break-words text-sm font-black text-slate-950">
                        {entry.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {entry.updatedAt} / {(entry.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>

          <section className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Script completo
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Copiar y pegar en Supabase
                </h2>
              </div>
              <SqlCopyButton sql={sql} />
            </div>
            <pre className="max-h-[78vh] overflow-auto rounded-[1.4rem] border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100 sm:p-5">
              <code>{sql}</code>
            </pre>
          </section>
        </section>
      </div>
    </main>
  );
}
