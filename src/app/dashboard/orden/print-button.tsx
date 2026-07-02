"use client";

// Botón de imprimir para la hoja de trabajo (se oculta al imprimir).
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="cursor-pointer rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 print:hidden"
    >
      Imprimir hoja
    </button>
  );
}
