"use client";

import { useFormStatus } from "react-dom";

import { verifyIdentifierAction } from "@/app/login/actions";

type IdentifierFormProps = {
  defaultValue: string;
};

function SubmitButton() {
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
          Verificando acceso...
        </>
      ) : (
        "Continuar"
      )}
    </button>
  );
}

export function IdentifierForm({ defaultValue }: IdentifierFormProps) {
  return (
    <form action={verifyIdentifierAction} className="space-y-6" noValidate>
      <div>
        <label
          htmlFor="identifier"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Metodo de acceso
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          maxLength={8}
          placeholder="Usuario o cedula"
          className="w-full rounded-[1.6rem] border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          defaultValue={defaultValue}
        />
      </div>

      <SubmitButton />
    </form>
  );
}
