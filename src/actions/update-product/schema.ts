import { z } from "zod";

export const updateProductSchema = z.object({
  id: z.string().uuid("ID de produto inválido"),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  categoryId: z.string().uuid("ID de categoria inválido"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
});

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
