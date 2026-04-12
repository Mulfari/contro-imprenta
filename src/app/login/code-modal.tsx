"use client";

import { useEffect, useRef, useState } from "react";

import { resetPendingLoginAction, verifyCodeAction } from "@/app/login/actions";

type CodeModalProps = {
  displayName: string;
  username: string;
  message: string;
};

export function CodeModal({
  displayName,
  username,
  message,
}: CodeModalProps) {
  const [code, setCode] = useState("");
  const submitRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (code.length === 4) {
      submitRef.current?.requestSubmit();
    }
  }, [code]);

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-slate-950/28 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Verificacion
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Bienvenido, {displayName}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ingresa tu codigo
            </p>
            <p className="text-sm leading-6 text-slate-500">@{username}</p>
          </div>

          <form action={resetPendingLoginAction}>
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg font-medium text-slate-500 transition hover:bg-slate-100"
              aria-label="Cerrar modal"
            >
              X
            </button>
          </form>
        </div>

        {message ? (
          <div className="mt-5 rounded-[1.2rem] border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-700">
            {message}
          </div>
        ) : null}

        <form ref={submitRef} action={verifyCodeAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="modal-password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Codigo de 4 digitos
            </label>
            <input
              id="modal-password"
              name="password"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-center text-2xl tracking-[0.45em] text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Entrar al panel
          </button>
        </form>
      </div>
    </div>
  );
}
