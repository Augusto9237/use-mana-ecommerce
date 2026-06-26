import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  categoryId: z.string().uuid("ID de categoria inválido"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
});

export const createProductVariantSchema = z.object({
  productId: z.string().uuid("ID de produto inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  slug: z.string().min(2, "Slug deve ter pelo menos 2 caracteres"),
  size: z.string().min(2, "Tamanho deve ser preenchido"),
  color: z.string().min(2, "Cor deve ser preenchida"),
  priceInCents: z
    .number()
    .int()
    .positive("Preço deve ser maior que zero"),
  imageUrl: z.string().url("URL de imagem inválida"),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type CreateProductVariantSchema = z.infer<
  typeof createProductVariantSchema
>;
