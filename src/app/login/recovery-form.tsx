"use client";

import { useFormStatus } from "react-dom";

import {
  completePasswordRecoveryAction,
  requestPasswordRecoveryAction,
} from "@/app/login/actions";

type RecoveryFormProps = {
  defaultIdentifier: string;
};

function RequestRecoveryButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          Enviando solicitud...
        </>
      ) : (
        "Solicitar codigo a administracion"
      )}
    </button>
  );
}

function CompleteRecoveryButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={pending}
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Restableciendo acceso...
        </>
      ) : (
        "Restablecer codigo"
      )}
    </button>
  );
}

export function RecoveryForm({ defaultIdentifier }: RecoveryFormProps) {
  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50/70 p-5">
        <p className="text-sm font-semibold text-slate-800">
          Solicita un codigo de recuperacion
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          El sistema enviara un codigo temporal a los administradores dentro del panel.
        </p>
        <form action={requestPasswordRecoveryAction} className="mt-4 space-y-4" noValidate>
          <div>
            <label
              htmlFor="recovery-identifier-request"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Usuario o cedula
            </label>
            <input
              id="recovery-identifier-request"
              name="identifier"
              type="text"
              maxLength={8}
              defaultValue={defaultIdentifier}
              placeholder="Usuario o cedula"
              className="w-full rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4 text-base text-slate-950 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <RequestRecoveryButton />
        </form>
      </div>

      <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-800">
          Ya tienes el codigo del admin
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ingresa el codigo temporal y define tu nuevo codigo de 4 digitos.
        </p>
        <form action={completePasswordRecoveryAction} className="mt-4 space-y-4" noValidate>
          <div>
            <label
              htmlFor="recovery-identifier-complete"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Usuario o cedula
            </label>
            <input
              id="recovery-identifier-complete"
              name="identifier"
              type="text"
              maxLength={8}
              defaultValue={defaultIdentifier}
              placeholder="Usuario o cedula"
              className="w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="recoveryCode"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Codigo temporal
              </label>
              <input
                id="recoveryCode"
                name="recoveryCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                className="w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label
                htmlFor="nextPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Nuevo codigo
              </label>
              <input
                id="nextPassword"
                name="nextPassword"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                className="w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <CompleteRecoveryButton />
        </form>
      </div>
    </div>
  );
}
