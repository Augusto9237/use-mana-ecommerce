"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

/**
 * Tipos permitidos para upload de imagens
 */
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Configuração do cliente R2 (S3-compatible)
 * As credenciais vêm de variáveis de ambiente (.env.local)
 */
const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export type UploadResult = {
  success: boolean;
  message: string;
  url?: string;
  key?: string;
};

/**
 * Server Action: faz upload de uma imagem para o bucket R2
 *
 * @param formData - FormData contendo o campo "file" (File)
 * @param folder   - pasta opcional dentro do bucket (ex: "avatars")
 */
export async function uploadImage(
  formData: FormData,
  folder: string = "uploads"
): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return { success: false, message: "Nenhum arquivo enviado." };
    }

    // Valida o tipo MIME
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        message: `Tipo "${file.type}" não permitido. Use JPEG, PNG, WebP, GIF ou AVIF.`,
      };
    }

    // Valida o tamanho
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo: 10 MB.`,
      };
    }

    // Gera um nome único para o arquivo
    const ext = file.name.split(".").pop() || "jpg";
    const key = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    // Lê o conteúdo do arquivo como Uint8Array (compatível com o SDK)
    const body = new Uint8Array(await file.arrayBuffer());

    // Faz o upload para o R2
    await R2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!, // ex: "rd-store"
        Key: key,
        Body: body,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    // Constrói a URL pública
    // Se você usa domínio customizado: https://cdn.seudominio.com/key
    // Se usa r2.dev (desenvolvimento): https://pub-xxxx.r2.dev/key
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    // Opcional: revalida cache da página que lista as imagens
    revalidatePath("/upload");

    return {
      success: true,
      message: "Upload concluído com sucesso!",
      url: publicUrl,
      key,
    };
  } catch (error) {
    console.error("Erro no upload:", error);
    return {
      success: false,
      message: "Erro interno ao fazer upload. Tente novamente.",
    };
  }
}
