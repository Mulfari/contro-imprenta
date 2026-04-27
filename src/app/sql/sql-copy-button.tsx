"use client";

import { useState } from "react";

type SqlCopyButtonProps = {
  sql: string;
};

export function SqlCopyButton({ sql }: SqlCopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2200);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 3200);
    }
  };

  return (
    <button
      type="button"
      onClick={copySql}
      className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-[#ffd45f] px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-[#ffcd41]"
    >
      {status === "copied"
        ? "Copiado"
        : status === "error"
          ? "No se pudo copiar"
          : "Copiar setup.sql"}
    </button>
  );
}
