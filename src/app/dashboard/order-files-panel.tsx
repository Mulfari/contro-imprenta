"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { FloatingToast } from "@/components/floating-toast";
import type { OrderAttachmentType } from "@/lib/business";
import type { OrderFile } from "@/lib/order-files";

type OrderFilesPanelProps = {
  orderId: string;
  files: OrderFile[];
  isAdmin: boolean;
  deleteAction: (formData: FormData) => void;
};

const attachmentTypeLabels: Record<OrderAttachmentType, string> = {
  arte_cliente: "Arte del cliente",
  prueba_aprobada: "Prueba aprobada",
  imagen_referencia: "Imagen de referencia",
  comprobante_pago: "Comprobante de pago",
};

function formatFileSize(value: number | null) {
  if (!value || value <= 0) {
    return "Sin tamano";
  }

  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function OrderFilesPanel({
  orderId,
  files,
  isAdmin,
  deleteAction,
}: OrderFilesPanelProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [attachmentType, setAttachmentType] =
    useState<OrderAttachmentType>("arte_cliente");
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(selectedFiles: FileList | null) {
    const file = selectedFiles?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("attachmentType", attachmentType);
    formData.append("file", file);

    setIsUploading(true);

    try {
      const response = await fetch("/api/order-files/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo cargar el archivo.");
      }

      setToastMessage("Adjunto cargado");
      router.refresh();
    } catch (error) {
      setToastMessage(
        error instanceof Error ? error.message : "No se pudo cargar el archivo.",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <>
      <FloatingToast message={toastMessage} />

      <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <select
            value={attachmentType}
            onChange={(event) =>
              setAttachmentType(event.target.value as OrderAttachmentType)
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            {Object.entries(attachmentTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            {isUploading ? "Cargando..." : "Subir adjunto"}
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                void handleFiles(event.target.files);
              }}
              disabled={isUploading}
            />
          </label>
        </div>

        <div className="mt-4 space-y-2">
          {files.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
              Aun no hay adjuntos en esta orden.
            </p>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {file.file_name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{attachmentTypeLabels[file.attachment_type]}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span>{formatDateTime(file.created_at)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {file.signed_url ? (
                    <a
                      href={file.signed_url}
                      target="_blank"
                      rel="noreferrer"
                      download={file.file_name}
                      className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Descargar
                    </a>
                  ) : null}
                  {isAdmin ? (
                    <form action={deleteAction}>
                      <input type="hidden" name="orderId" value={orderId} />
                      <input type="hidden" name="fileId" value={file.id} />
                      <button
                        type="submit"
                        className="inline-flex cursor-pointer items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Eliminar
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
