import { z } from "zod";
''
export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid("ID do pedido inválido"),
  status: z.enum(["pending", "paid", "canceled"], {
    message: "Status do pedido inválido",
  }),
});

export type UpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>;
