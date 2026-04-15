import { NextResponse } from "next/server";

import { type OrderAttachmentType } from "@/lib/business";
import { getCurrentSession } from "@/lib/auth/session";
import { uploadOrderFile } from "@/lib/order-files";

const validAttachmentTypes = new Set<OrderAttachmentType>([
  "arte_cliente",
  "prueba_aprobada",
  "imagen_referencia",
  "comprobante_pago",
]);

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Inicia sesion para continuar." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const orderId = String(formData.get("orderId") ?? "");
    const attachmentType = String(formData.get("attachmentType") ?? "") as OrderAttachmentType;
    const file = formData.get("file");

    if (!validAttachmentTypes.has(attachmentType)) {
      return NextResponse.json(
        { error: "Selecciona un tipo de adjunto valido." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Selecciona un archivo valido." },
        { status: 400 },
      );
    }

    const uploadedFile = await uploadOrderFile({
      orderId,
      attachmentType,
      file,
      uploadedBy: session.userId,
    });

    return NextResponse.json({
      file: uploadedFile,
      message: "Archivo cargado",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo cargar el archivo.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
