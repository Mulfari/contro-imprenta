"use client";

import { useState } from "react";

type DeleteUserButtonProps = {
  action: (formData: FormData) => void;
  userId: string;
};

export function DeleteUserButton({
  action,
  userId,
}: DeleteUserButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
      >
        Eliminar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
      >
        Cancelar
      </button>
      <form action={action}>
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          className="rounded-full border border-rose-300 bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
        >
          Confirmar
        </button>
      </form>
    </div>
  );
}
