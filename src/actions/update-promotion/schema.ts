import { z } from "zod";

export const updatePromotionSchema = z.object({
  id: z.string().uuid("ID inválido"),
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  imageUrl: z.string().url("URL de imagem inválida"),
  linkUrl: z.string().min(1, "O link é obrigatório").refine(
    (val) => val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://"),
    "O link deve começar com '/' para caminhos internos ou ser uma URL completa (http:// ou https://)"
  ),
  isActive: z.boolean(),
});

export type UpdatePromotionSchema = z.infer<typeof updatePromotionSchema>;
