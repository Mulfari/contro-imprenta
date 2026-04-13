"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import {
  completePasswordRecoveryStateAction,
  resetPendingLoginAction,
  requestPasswordRecoveryStateAction,
  type RecoveryCodeState,
  type RecoveryPasswordState,
  verifyRecoveryCodeStateAction,
  verifyCodeStateAction,
  type VerifyCodeState,
} from "@/app/login/actions";
import { FloatingToast } from "@/components/floating-toast";

type CodeModalProps = {
  displayName: string;
};

const initialState: VerifyCodeState = {
  status: "idle",
  message: "",
};

const initialRecoveryState: RecoveryCodeState = {
  status: "idle",
  message: "",
};

const initialRecoveryPasswordState: RecoveryPasswordState = {
  status: "idle",
  message: "",
};

export function CodeModal({
  displayName,
}: CodeModalProps) {
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"login" | "recovery">("login");
  const [recoveryVerified, setRecoveryVerified] = useState(false);
  const router = useRouter();
  const submitRef = useRef<HTMLFormElement>(null);
  const lastSubmittedCodeRef = useRef("");
  const [closing, setClosing] = useState(false);
  const [state, formAction, pending] = useActionState(
    verifyCodeStateAction,
    initialState,
  );
  const [requestRecoveryState, requestRecoveryAction, requestingRecovery] =
    useActionState(requestPasswordRecoveryStateAction, initialRecoveryState);
  const [verifyRecoveryState, verifyRecoveryAction, verifyingRecovery] =
    useActionState(verifyRecoveryCodeStateAction, initialRecoveryState);
  const [completeRecoveryState, completeRecoveryAction, completingRecovery] =
    useActionState(completePasswordRecoveryStateAction, initialRecoveryPasswordState);

  const visualStatus = pending ? "loading" : state.status;
  const activeToastMessage =
    completeRecoveryState.message ||
    verifyRecoveryState.message ||
    requestRecoveryState.message ||
    state.message;

  useEffect(() => {
    if (code.length < 4) {
      lastSubmittedCodeRef.current = "";
    }
  }, [code]);

  useEffect(() => {
    if (
      mode === "login" &&
      code.length === 4 &&
      !pending &&
      state.status !== "success" &&
      lastSubmittedCodeRef.current !== code
    ) {
      lastSubmittedCodeRef.current = code;
      submitRef.current?.requestSubmit();
    }
  }, [code, mode, pending, state.status]);

  useEffect(() => {
    if (state.status === "success") {
      const timeout = window.setTimeout(() => {
        router.push("/dashboard");
      }, 550);

      return () => window.clearTimeout(timeout);
    }
  }, [router, state.status]);

  useEffect(() => {
    if (completeRecoveryState.status === "success") {
      const timeout = window.setTimeout(() => {
        router.push("/dashboard");
      }, 550);

      return () => window.clearTimeout(timeout);
    }
  }, [completeRecoveryState.status, router]);

  useEffect(() => {
    if (verifyRecoveryState.status === "success") {
      const timeout = window.setTimeout(() => {
        setRecoveryVerified(true);
      }, 0);

      return () => window.clearTimeout(timeout);
    }
  }, [verifyRecoveryState.status]);

  useEffect(() => {
    if (requestRecoveryState.status === "success") {
      const timeout = window.setTimeout(() => {
        setRecoveryVerified(false);
        setRecoveryCode("");
        setNextPassword("");
        setConfirmPassword("");
      }, 0);

      return () => window.clearTimeout(timeout);
    }
  }, [requestRecoveryState.status]);

  const inputClasses =
    visualStatus === "loading"
      ? "border-blue-300 bg-white ring-2 ring-blue-100 animate-pulse"
      : visualStatus === "error"
        ? "border-rose-300 bg-white ring-2 ring-rose-100"
        : visualStatus === "success"
          ? "border-emerald-300 bg-white ring-2 ring-emerald-100"
          : "border-blue-400 bg-white ring-2 ring-blue-100 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";

  const handleClose = () => {
    if (closing) {
      return;
    }

    setClosing(true);
    startTransition(async () => {
      await resetPendingLoginAction();
    });
  };

  const isRecoveryBusy =
    requestingRecovery || verifyingRecovery || completingRecovery;

  const modal = (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-white/18 backdrop-blur-xl" />
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <FloatingToast message={activeToastMessage} />
        <div className="w-full max-w-xl rounded-[2.3rem] border border-slate-200/90 bg-white/92 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                Panel Administrativo
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Express Printer
              </h2>
              <p className="mt-4 text-base font-medium text-slate-600">
                {mode === "login" ? "Verificar acceso" : "Recuperar acceso"}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {displayName}
              </p>
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

          {mode === "login" ? (
            <div className="mt-8 rounded-[1.8rem] border border-slate-200/80 bg-slate-50/65 p-5 sm:p-6">
              <form ref={submitRef} action={formAction} className="space-y-4" noValidate>
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

              <button
                type="button"
                onClick={() => {
                  setMode("recovery");
                  setRecoveryVerified(false);
                  setRecoveryCode("");
                  setNextPassword("");
                  setConfirmPassword("");
                }}
                className="mt-4 w-full text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Recuperar codigo de acceso
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-4 rounded-[1.8rem] border border-slate-200/80 bg-slate-50/65 p-5 sm:p-6">
              <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-800">
                  Solicita un codigo a administracion
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  El codigo temporal aparecera en el panel de los administradores para este acceso.
                </p>
                <form action={requestRecoveryAction} className="mt-4" noValidate>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isRecoveryBusy}
                  >
                    {requestingRecovery ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                        Solicitando codigo...
                      </>
                    ) : (
                      "Solicitar codigo a administracion"
                    )}
                  </button>
                </form>
              </div>

              <form
                action={verifyRecoveryAction}
                className="space-y-4"
                noValidate
              >
                <div>
                  <label
                    htmlFor="recoveryCode"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Codigo de administracion
                  </label>
                  <input
                    id="recoveryCode"
                    name="recoveryCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={recoveryCode}
                    onChange={(event) =>
                      setRecoveryCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-center text-xl tracking-[0.35em] text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  disabled={isRecoveryBusy}
                >
                  {verifyingRecovery ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Validando codigo...
                    </>
                  ) : (
                    "Recuperar codigo de acceso"
                  )}
                </button>
              </form>

              {recoveryVerified ? (
                <form action={completeRecoveryAction} className="space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="nextPassword"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Nuevo codigo de 4 digitos
                    </label>
                    <input
                      id="nextPassword"
                      name="nextPassword"
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={nextPassword}
                      onChange={(event) =>
                        setNextPassword(event.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-center text-xl tracking-[0.45em] text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Confirmar codigo
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-center text-xl tracking-[0.45em] text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    disabled={isRecoveryBusy}
                  >
                    {completingRecovery ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Guardando nuevo codigo...
                      </>
                    ) : (
                      "Guardar nuevo codigo"
                    )}
                  </button>
                </form>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setRecoveryVerified(false);
                }}
                className="w-full text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Volver a ingresar codigo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(modal, document.body);
}
