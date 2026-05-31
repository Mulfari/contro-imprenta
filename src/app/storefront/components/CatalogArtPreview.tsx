"use client";

import { useEffect, useMemo } from "react";

interface CatalogArtPreviewProps {
  file: File;
}

export function CatalogArtPreview({ file }: CatalogArtPreviewProps) {
  const isImage = file.type.startsWith("image/");
  const previewUrl = useMemo(() => (isImage ? URL.createObjectURL(file) : null), [file, isImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (previewUrl) {
    return (
      <div
        className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 bg-white bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${previewUrl})` }}
        aria-label={`Miniatura de ${file.name}`}
      />
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-500">
      {file.name.split(".").pop()?.slice(0, 4).toUpperCase() || "FILE"}
    </div>
  );
}