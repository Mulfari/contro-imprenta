"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  resetPendingLoginAction,
  verifyCodeStateAction,
  type VerifyCodeState,
} from "@/app/login/actions";

type CodeModalProps = {
  displayName: string;
  username: string;
};

const initialState: VerifyCodeState = {
  status: "idle",
  message: "",
};

export function CodeModal({
  displayName,
  username,
}: CodeModalProps) {
  const [code, setCode] = useState("");
  const router = useRouter();
  const submitRef = useRef<HTMLFormElement>(null);
  const lastSubmittedCodeRef = useRef("");
  const [closing, setClosing] = useState(false);
  const [state, formAction, pending] = useActionState(
    verifyCodeStateAction,
    initialState,
  );

  const visualStatus = pending ? "loading" : state.status;

  useEffect(() => {
    if (code.length < 4) {
      lastSubmittedCodeRef.current = "";
    }
  }, [code]);

  useEffect(() => {
    if (
      code.length === 4 &&
      !pending &&
      state.status !== "success" &&
      lastSubmittedCodeRef.current !== code
    ) {
      lastSubmittedCodeRef.current = code;
      submitRef.current?.requestSubmit();
    }
  }, [code, pending, state.status]);

  useEffect(() => {
    if (state.status === "success") {
      const timeout = window.setTimeout(() => {
        router.push("/dashboard");
      }, 550);

      return () => window.clearTimeout(timeout);
    }
  }, [router, state.status]);

  const inputClasses =
    visualStatus === "loading"
      ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100 animate-pulse"
      : visualStatus === "error"
        ? "border-rose-300 bg-rose-50 ring-2 ring-rose-100"
        : visualStatus === "success"
          ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100"
          : "border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";

  const handleClose = () => {
    if (closing) {
      return;
    }

    setClosing(true);
    startTransition(async () => {
      await resetPendingLoginAction();
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/58 p-4 backdrop-blur-md">
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

          <button
            type="button"
            onClick={handleClose}
            disabled={closing}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg font-medium text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Cerrar modal"
          >
            X
          </button>
        </div>

        <form ref={submitRef} action={formAction} className="mt-6 space-y-4" noValidate>
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
              maxLength={4}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className={`w-full rounded-2xl px-4 py-3.5 text-center text-2xl tracking-[0.45em] text-slate-950 outline-none transition ${inputClasses}`}
              autoFocus
              disabled={visualStatus === "loading" || visualStatus === "success"}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={visualStatus === "loading" || visualStatus === "success"}
          >
            {visualStatus === "loading"
              ? "Validando..."
              : visualStatus === "success"
                ? "Correcto"
                : "Entrar al panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
