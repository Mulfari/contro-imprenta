"use client";

import { useState } from "react";
import { PaperPlaneRight, X } from "@phosphor-icons/react";

const PHONE = "584243390487";
const FALLBACK = "Hola, necesito ayuda con mi pedido en Express Printer.";

// Burbuja flotante de WhatsApp con un mini-chat: el usuario escribe su mensaje
// en el input y al enviar se abre WhatsApp con ese texto prellenado (o un
// mensaje por defecto si lo deja vacío). El FAB conserva el look anterior.
export function WhatsappHelpBubble() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const send = () => {
    const text = message.trim() || FALLBACK;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setMessage("");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <div className="wa-pop-in w-[300px] overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)] sm:w-[330px]">
          {/* Encabezado */}
          <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-[13px] font-bold text-white">
              EP
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white">Express Printer</div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Normalmente responde rápido
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="ml-auto flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <X size={15} weight="bold" />
            </button>
          </div>

          {/* Saludo */}
          <div className="bg-[#ECE5DD] px-3 py-4">
            <div className="max-w-[88%] rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[13px] leading-snug text-slate-700 shadow-sm">
              ¡Hola! 👋 Cuéntanos qué necesitas imprimir y seguimos por WhatsApp.
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-emerald-50 bg-white px-3 py-2.5">
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") send();
              }}
              placeholder="Escribe tu mensaje…"
              aria-label="Mensaje para WhatsApp"
              autoFocus
              className="h-10 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-[13.5px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,211,102,0.14)]"
            />
            <button
              type="button"
              onClick={send}
              aria-label="Enviar por WhatsApp"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_18px_rgba(37,211,102,0.34)] transition hover:bg-[#20bd5a]"
            >
              <PaperPlaneRight size={17} weight="fill" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Botón flotante (FAB) */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Ayuda por WhatsApp"
        aria-expanded={open}
        className="group inline-flex cursor-pointer items-center gap-3 rounded-full border border-emerald-200 bg-white px-3 py-3 text-left text-slate-800 shadow-[0_18px_38px_rgba(15,23,42,0.14)] transition-all duration-300 hover:border-emerald-300 hover:shadow-[0_24px_52px_rgba(15,23,42,0.2)] sm:px-4"
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_22px_rgba(37,211,102,0.32)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_14px_28px_rgba(37,211,102,0.38)]">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6" fill="currentColor">
            <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2c-5.45 0-9.88 4.43-9.88 9.88 0 1.74.45 3.43 1.31 4.92L2 22l5.35-1.4a9.82 9.82 0 0 0 4.68 1.19h.01c5.45 0 9.88-4.43 9.88-9.88a9.8 9.8 0 0 0-2.87-7ZM12.04 20.1h-.01a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.17.83.85-3.09-.2-.32a8.11 8.11 0 0 1 1.24-10.03 8.1 8.1 0 0 1 5.77-2.38c4.49 0 8.15 3.65 8.15 8.14 0 4.49-3.66 8.15-8.19 8.15Zm4.47-6.12c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.22-.72-.64-1.2-1.43-1.35-1.67-.14-.24-.01-.37.11-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.52.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
          </svg>
        </span>
        <span className="hidden sm:flex sm:flex-col sm:pr-1 sm:leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 transition-colors duration-300 group-hover:text-emerald-600">
            ¿Necesitas ayuda?
          </span>
          <span className="text-sm font-semibold text-slate-800 transition-colors duration-300 group-hover:text-slate-950">WhatsApp</span>
        </span>
      </button>
    </div>
  );
}
