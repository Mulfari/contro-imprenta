"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { FloatingToast } from "@/components/floating-toast";
import type { ClientFile } from "@/lib/client-files";

type UploadingFile = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "success" | "error";
  countdown?: number;
  errorMessage?: string;
};

type ClientFilesPanelProps = {
  clientId: string;
  files: ClientFile[];
  isAdmin: boolean;
  deleteAction: (formData: FormData) => void;
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.3rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
      {message}
    </div>
  );
}

function isImageFile(file: Pick<ClientFile, "file_type" | "file_name">) {
  return (
    file.file_type?.startsWith("image/") ||
    /\.(png|jpe?g|webp|svg)$/i.test(file.file_name)
  );
}

function isPdfFile(file: Pick<ClientFile, "file_type" | "file_name">) {
  return file.file_type === "application/pdf" || /\.pdf$/i.test(file.file_name);
}

export function ClientFilesPanel({
  clientId,
  files,
  isAdmin,
  deleteAction,
}: ClientFilesPanelProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const isUploading = uploadingFiles.some((file) => file.status === "uploading");
  const orderedUploadingFiles = useMemo(
    () => [...uploadingFiles].reverse(),
    [uploadingFiles],
  );

  function openPicker() {
    inputRef.current?.click();
  }

  function resetPicker() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function updateUploadingFile(fileId: string, updates: Partial<UploadingFile>) {
    setUploadingFiles((current) =>
      current.map((file) => (file.id === fileId ? { ...file, ...updates } : file)),
    );
  }

  function removeUploadingFile(fileId: string) {
    setUploadingFiles((current) => current.filter((file) => file.id !== fileId));
  }

  function addUploadingFiles(selectedFiles: File[]) {
    const nextFiles = selectedFiles.map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      name: file.name,
      progress: 0,
      status: "uploading" as const,
    }));

    setUploadingFiles((current) => [...current, ...nextFiles]);
    return nextFiles;
  }

  function uploadSingleFile(file: File, uploadId: string) {
    return new Promise<void>((resolve, reject) => {
      const formData = new FormData();
      const request = new XMLHttpRequest();

      formData.append("clientId", clientId);
      formData.append("file", file);

      request.upload.addEventListener("progress", (event) => {
        if (!event.lengthComputable) {
          return;
        }

        const progress = Math.max(
          5,
          Math.min(100, Math.round((event.loaded / event.total) * 100)),
        );

        updateUploadingFile(uploadId, { progress });
      });

      request.addEventListener("load", () => {
        try {
          const response = JSON.parse(request.responseText) as {
            error?: string;
          };

          if (request.status >= 200 && request.status < 300) {
            updateUploadingFile(uploadId, {
              progress: 100,
              status: "success",
              countdown: 5,
            });

            for (let seconds = 4; seconds >= 0; seconds -= 1) {
              window.setTimeout(() => {
                if (seconds === 0) {
                  removeUploadingFile(uploadId);
                  return;
                }

                updateUploadingFile(uploadId, { countdown: seconds });
              }, (5 - seconds) * 1000);
            }

            resolve();
            return;
          }

          const message = response.error || "No se pudo cargar el archivo.";
          updateUploadingFile(uploadId, {
            status: "error",
            errorMessage: message,
          });
          reject(new Error(message));
        } catch {
          const message = "No se pudo procesar la carga del archivo.";
          updateUploadingFile(uploadId, {
            status: "error",
            errorMessage: message,
          });
          reject(new Error(message));
        }
      });

      request.addEventListener("error", () => {
        const message = "No se pudo cargar el archivo.";
        updateUploadingFile(uploadId, {
          status: "error",
          errorMessage: message,
        });
        reject(new Error(message));
      });

      request.open("POST", "/api/client-files/upload");
      request.send(formData);
    });
  }

  async function handleFiles(selectedFiles: FileList | File[] | null) {
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    const filesToUpload = Array.from(selectedFiles);
    const pendingFiles = addUploadingFiles(filesToUpload);
    let hasError = false;

    for (let index = 0; index < filesToUpload.length; index += 1) {
      const file = filesToUpload[index];
      const uploadItem = pendingFiles[index];

      try {
        await uploadSingleFile(file, uploadItem.id);
      } catch (error) {
        hasError = true;
        setToastMessage(
          error instanceof Error ? error.message : "No se pudo cargar el archivo.",
        );
      }
    }

    resetPicker();

    if (!hasError) {
      setToastMessage("Archivos cargados");
    }

    router.refresh();
  }

  return (
    <>
      <FloatingToast message={toastMessage} />

      <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
        <div>
          <h4 className="text-lg font-semibold text-slate-950">Archivos digitales</h4>
          <p className="mt-1 text-sm text-slate-500">
            Guarda PDFs, imagenes y artes del cliente para reutilizarlos en futuros pedidos.
          </p>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
              return;
            }
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void handleFiles(event.dataTransfer.files);
          }}
          className={`mt-5 cursor-pointer select-none rounded-[1.5rem] border-2 border-dashed px-6 py-8 text-center transition ${
            isDragging
              ? "border-blue-400 bg-blue-50/80"
              : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.ai,.psd,.zip,.rar"
            className="hidden"
            onChange={(event) => {
              void handleFiles(event.target.files);
            }}
          />

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <span className="text-2xl text-slate-700">+</span>
          </div>
          <p className="mt-4 text-base font-semibold text-slate-900">
            Arrastra archivos aqui o haz clic para cargarlos
          </p>
          <p className="mt-2 text-sm text-slate-500">
            PDF, JPG, PNG, SVG, AI, PSD, ZIP o RAR. Maximo 20 MB por archivo.
          </p>
          {isUploading ? (
            <p className="mt-3 text-sm font-medium text-blue-700">Cargando archivos...</p>
          ) : null}
        </div>

        {orderedUploadingFiles.length > 0 ? (
          <div className="mt-5 space-y-3">
            {orderedUploadingFiles.map((file) => (
              <div
                key={file.id}
                className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {file.name}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        file.status === "error"
                          ? "text-rose-600"
                          : file.status === "success"
                            ? "text-emerald-600"
                            : "text-slate-500"
                      }`}
                    >
                      {file.status === "uploading"
                        ? `Cargando ${file.progress}%`
                        : file.status === "success"
                          ? `Carga completada. Se oculta en ${file.countdown ?? 5}s`
                          : file.errorMessage ?? "No se pudo cargar"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-slate-500">
                    {file.progress}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      file.status === "error"
                        ? "bg-rose-500"
                        : file.status === "success"
                          ? "bg-emerald-500"
                          : "bg-blue-500"
                    }`}
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {files.length === 0 ? (
            <EmptyState message="Aun no hay archivos cargados para este cliente." />
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-slate-50"
              >
                <div className="h-40 border-b border-slate-200 bg-white">
                  {file.signed_url && isImageFile(file) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.signed_url}
                      alt={file.file_name}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(241,245,249,0.92)_70%)] px-4 text-center">
                      <span className="text-2xl font-semibold tracking-[0.2em] text-slate-700">
                        {isPdfFile(file) ? "PDF" : "FILE"}
                      </span>
                      <span className="mt-2 text-[10px] uppercase tracking-[0.22em] text-slate-400">
                        {file.file_type?.split("/")[1] ?? "archivo"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 px-4 py-4">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                      {file.file_name}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
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
                        className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Descargar
                      </a>
                    ) : null}
                    {isAdmin ? (
                      <form action={deleteAction}>
                        <input type="hidden" name="clientId" value={clientId} />
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
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
