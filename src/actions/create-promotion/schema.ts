import { z } from "zod";

export const createPromotionSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  imageUrl: z.string().url("URL de imagem inválida"),
  linkUrl: z.string().url("URL do link inválida"),
  isActive: z.boolean(),
});

export type CreatePromotionSchema = z.infer<typeof createPromotionSchema>;
