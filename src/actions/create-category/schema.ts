import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  imageUrl: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
