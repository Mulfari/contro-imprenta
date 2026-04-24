import { NextResponse } from "next/server";

import { uploadCustomerOrderFile } from "@/lib/customer-commerce";
import { getCurrentCustomer } from "@/lib/customer-auth";

const validAttachmentTypes = new Set(["arte_cliente", "comprobante_pago"]);

export async function POST(request: Request) {
  const user = await getCurrentCustomer();

  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesion para subir archivos." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const orderId = String(formData.get("orderId") ?? "");
    const attachmentType = String(formData.get("attachmentType") ?? "");
    const file = formData.get("file");

    if (!validAttachmentTypes.has(attachmentType)) {
      return NextResponse.json(
        { error: "Selecciona un tipo de archivo valido." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Selecciona un archivo valido." },
        { status: 400 },
      );
    }

    const uploadedFile = await uploadCustomerOrderFile({
      userId: user.id,
      orderId,
      attachmentType: attachmentType as "arte_cliente" | "comprobante_pago",
      file,
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
