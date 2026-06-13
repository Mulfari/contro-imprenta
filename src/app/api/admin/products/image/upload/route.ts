import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const bucket = "product-images";
const maxSize = 5 * 1024 * 1024;

function sanitizeFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Necesitas un usuario admin." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json({ error: "Selecciona una imagen valida." }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ error: "La imagen no debe superar 5 MB." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const cleanName = sanitizeFileName(file.name || "imagen");
    const storagePath = `products/${Date.now()}-${cleanName}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

    return NextResponse.json({ path: storagePath, url: data.publicUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo subir la imagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
