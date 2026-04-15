import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { uploadClientFile } from "@/lib/client-files";

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
    const clientId = String(formData.get("clientId") ?? "");
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Selecciona un archivo valido." },
        { status: 400 },
      );
    }

    const uploadedFile = await uploadClientFile({
      clientId,
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
