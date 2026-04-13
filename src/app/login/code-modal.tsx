"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import {
  completeFirstAccessStateAction,
  completePasswordRecoveryStateAction,
  resetPendingLoginAction,
  requestPasswordRecoveryStateAction,
  type RecoveryCodeState,
  type RecoveryPasswordState,
  type SetupPasswordState,
  verifyRecoveryCodeStateAction,
  verifyCodeStateAction,
  type VerifyCodeState,
} from "@/app/login/actions";
import {
  authCardClassName,
  authCodeInputClassName,
  authGhostButtonClassName,
  authNumericInputClassName,
  authPrimaryButtonClassName,
  authSecondaryButtonClassName,
  authSectionClassName,
} from "@/app/login/styles";
import { FloatingToast } from "@/components/floating-toast";

type CodeModalProps = {
  displayName: string;
  requiresPasswordSetup: boolean;
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

const initialSetupPasswordState: SetupPasswordState = {
  status: "idle",
  message: "",
};

export function CodeModal({
  displayName,
  requiresPasswordSetup,
}: CodeModalProps) {
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"login" | "recovery" | "setup">(
    requiresPasswordSetup ? "setup" : "login",
  );
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
  const [setupState, completeSetupAction, completingSetup] = useActionState(
    completeFirstAccessStateAction,
    initialSetupPasswordState,
  );

  const visualStatus = pending ? "loading" : state.status;
  const activeToastMessage =
    setupState.message ||
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
    if (setupState.status === "success") {
      const timeout = window.setTimeout(() => {
        router.push("/dashboard");
      }, 550);

      return () => window.clearTimeout(timeout);
    }
  }, [router, setupState.status]);

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
      ? `${authCodeInputClassName} border-blue-300 animate-pulse`
      : visualStatus === "error"
        ? "w-full rounded-2xl border border-rose-300 bg-white px-4 py-3.5 text-center text-2xl tracking-[0.45em] text-slate-950 outline-none ring-2 ring-rose-100 transition"
        : visualStatus === "success"
          ? "w-full rounded-2xl border border-emerald-300 bg-white px-4 py-3.5 text-center text-2xl tracking-[0.45em] text-slate-950 outline-none ring-2 ring-emerald-100 transition"
          : authCodeInputClassName;

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
        <div className={authCardClassName}>
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
                Panel Administrativo
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Express Printer
              </h2>
              <p className="mt-4 text-base font-medium text-slate-600">
                {mode === "login"
                  ? "Verificar acceso"
                  : mode === "setup"
                    ? "Crear codigo de acceso"
                    : "Recuperar acceso"}
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
            <div className={authSectionClassName}>
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
                  className={authPrimaryButtonClassName}
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
                className={`mt-4 ${authGhostButtonClassName}`}
              >
                Recuperar codigo de acceso
              </button>
            </div>
          ) : mode === "setup" ? (
            <div className={`${authSectionClassName} space-y-4`}>
              <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-800">
                  Este es tu primer acceso
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Crea ahora tu codigo personal de 4 digitos para entrar al panel.
                </p>
              </div>

              <form action={completeSetupAction} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="setupNextPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Nuevo codigo de 4 digitos
                  </label>
                  <input
                    id="setupNextPassword"
                    name="nextPassword"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={nextPassword}
                    onChange={(event) =>
                      setNextPassword(event.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    className={authNumericInputClassName}
                  />
                </div>
                <div>
                  <label
                    htmlFor="setupConfirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Confirmar codigo
                  </label>
                  <input
                    id="setupConfirmPassword"
                    name="confirmPassword"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    className={authNumericInputClassName}
                  />
                </div>
                <button
                  type="submit"
                  className={authPrimaryButtonClassName}
                  disabled={completingSetup}
                >
                  {completingSetup ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Guardando codigo...
                    </>
                  ) : (
                    "Crear codigo e ingresar"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className={`${authSectionClassName} space-y-4`}>
              <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-800">
                  Solicita tu codigo de acceso a administracion
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Debes solicitar a administracion el codigo de acceso generado para este usuario.
                </p>
                <form action={requestRecoveryAction} className="mt-4" noValidate>
                  <button
                    type="submit"
                    className={authSecondaryButtonClassName}
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
                    className={authNumericInputClassName}
                  />
                </div>
                <button
                  type="submit"
                  className={authPrimaryButtonClassName}
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
                      className={authNumericInputClassName}
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
                      className={authNumericInputClassName}
                    />
                  </div>
                  <button
                    type="submit"
                    className={authPrimaryButtonClassName}
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
                className={authGhostButtonClassName}
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
