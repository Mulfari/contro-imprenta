import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const clientFilesBucket = "client-files";
const maxClientFileSize = 20 * 1024 * 1024;

export type ClientFile = {
  id: string;
  client_id: string;
  file_name: string;
  storage_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  uploaded_by: string | null;
  signed_url: string | null;
};

function sanitizeFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function listClientFiles(clientId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("client_files")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const files = (data ?? []) as Omit<ClientFile, "signed_url">[];

  const signedFiles = await Promise.all(
    files.map(async (file) => {
      const { data: signedData } = await supabase.storage
        .from(clientFilesBucket)
        .createSignedUrl(file.storage_path, 60 * 60);

      return {
        ...file,
        signed_url: signedData?.signedUrl ?? null,
      } satisfies ClientFile;
    }),
  );

  return signedFiles;
}

export async function uploadClientFile(input: {
  clientId: string;
  file: File;
  uploadedBy: string;
}) {
  const supabase = createSupabaseAdminClient();

  if (!input.clientId) {
    throw new Error("No se pudo identificar el cliente.");
  }

  if (!input.file || input.file.size <= 0) {
    throw new Error("Selecciona un archivo para cargar.");
  }

  if (input.file.size > maxClientFileSize) {
    throw new Error("El archivo no debe superar 20 MB.");
  }

  const cleanName = sanitizeFileName(input.file.name || "archivo");
  const storagePath = `clients/${input.clientId}/${Date.now()}-${cleanName}`;
  const fileBuffer = Buffer.from(await input.file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(clientFilesBucket)
    .upload(storagePath, fileBuffer, {
      contentType: input.file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase
    .from("client_files")
    .insert({
      client_id: input.clientId,
      file_name: input.file.name,
      storage_path: storagePath,
      file_type: input.file.type || null,
      file_size: input.file.size,
      uploaded_by: input.uploadedBy,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(clientFilesBucket).remove([storagePath]);
    throw error;
  }

  const { data: signedData } = await supabase.storage
    .from(clientFilesBucket)
    .createSignedUrl(storagePath, 60 * 60);

  return {
    ...(data as Omit<ClientFile, "signed_url">),
    signed_url: signedData?.signedUrl ?? null,
  } satisfies ClientFile;
}

export async function deleteClientFile(fileId: string) {
  const supabase = createSupabaseAdminClient();

  const { data: file, error: fetchError } = await supabase
    .from("client_files")
    .select("*")
    .eq("id", fileId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const storagePath = String(file.storage_path ?? "");

  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from(clientFilesBucket)
      .remove([storagePath]);

    if (storageError) {
      throw storageError;
    }
  }

  const { error } = await supabase.from("client_files").delete().eq("id", fileId);

  if (error) {
    throw error;
  }
}
