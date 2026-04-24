import { createOrderHistoryEntry, type OrderAttachmentType } from "@/lib/business";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const orderFilesBucket = "order-files";
const maxOrderFileSize = 20 * 1024 * 1024;

export type OrderFile = {
  id: string;
  order_id: string;
  attachment_type: OrderAttachmentType;
  file_name: string;
  storage_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
  uploaded_by: string | null;
  customer_uploaded_by: string | null;
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

export async function listOrderFiles(orderIds: string[]) {
  if (orderIds.length === 0) {
    return [] as OrderFile[];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("order_files")
    .select("*")
    .in("order_id", orderIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const files = (data ?? []) as Omit<OrderFile, "signed_url">[];

  const signedFiles = await Promise.all(
    files.map(async (file) => {
      const { data: signedData } = await supabase.storage
        .from(orderFilesBucket)
        .createSignedUrl(file.storage_path, 60 * 60);

      return {
        ...file,
        signed_url: signedData?.signedUrl ?? null,
      } satisfies OrderFile;
    }),
  );

  return signedFiles;
}

export async function uploadOrderFile(input: {
  orderId: string;
  attachmentType: OrderAttachmentType;
  file: File;
  uploadedBy?: string | null;
  customerUploadedBy?: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  if (!input.orderId) {
    throw new Error("No se pudo identificar la orden.");
  }

  if (!input.file || input.file.size <= 0) {
    throw new Error("Selecciona un archivo para cargar.");
  }

  if (input.file.size > maxOrderFileSize) {
    throw new Error("El archivo no debe superar 20 MB.");
  }

  const cleanName = sanitizeFileName(input.file.name || "archivo");
  const storagePath = `orders/${input.orderId}/${Date.now()}-${cleanName}`;
  const fileBuffer = Buffer.from(await input.file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(orderFilesBucket)
    .upload(storagePath, fileBuffer, {
      contentType: input.file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase
    .from("order_files")
    .insert({
      order_id: input.orderId,
      attachment_type: input.attachmentType,
      file_name: input.file.name,
      storage_path: storagePath,
      file_type: input.file.type || null,
      file_size: input.file.size,
      uploaded_by: input.uploadedBy ?? null,
      customer_uploaded_by: input.customerUploadedBy ?? null,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(orderFilesBucket).remove([storagePath]);
    throw error;
  }

  await createOrderHistoryEntry({
    orderId: input.orderId,
    detail: `Adjunto cargado: ${input.file.name} (${input.attachmentType}).`,
    eventType: "adjunto",
    changedBy: input.uploadedBy ?? null,
  });

  const { data: signedData } = await supabase.storage
    .from(orderFilesBucket)
    .createSignedUrl(storagePath, 60 * 60);

  return {
    ...(data as Omit<OrderFile, "signed_url">),
    signed_url: signedData?.signedUrl ?? null,
  } satisfies OrderFile;
}

export async function deleteOrderFile(fileId: string) {
  const supabase = createSupabaseAdminClient();

  const { data: file, error: fetchError } = await supabase
    .from("order_files")
    .select("*")
    .eq("id", fileId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const storagePath = String(file.storage_path ?? "");

  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from(orderFilesBucket)
      .remove([storagePath]);

    if (storageError) {
      throw storageError;
    }
  }

  const { error } = await supabase.from("order_files").delete().eq("id", fileId);

  if (error) {
    throw error;
  }
}
