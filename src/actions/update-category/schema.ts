import { z } from "zod";

export const updateCategorySchema = z.object({
  id: z.string().uuid("ID de categoria inválido"),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  imageUrl: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
});

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
