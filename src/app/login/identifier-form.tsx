"use client";

import { useFormStatus } from "react-dom";

import { verifyIdentifierAction } from "@/app/login/actions";
import {
  authInputClassName,
  authPrimaryButtonClassName,
} from "@/app/login/styles";

type IdentifierFormProps = {
  defaultValue: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={authPrimaryButtonClassName}
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
          Cedula
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          inputMode="numeric"
          maxLength={8}
          placeholder="Numero de cedula"
          className={authInputClassName}
          defaultValue={defaultValue}
        />
      </div>

      <SubmitButton />
    </form>
  );
}
