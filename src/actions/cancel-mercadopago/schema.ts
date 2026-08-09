import { z } from "zod";

export const cancelCheckoutPaymentSchema = z.object({
  orderId: z.string().uuid("Order ID must be a valid UUID"),
});

export type CancelCheckoutPaymentSchema = z.infer<
  typeof cancelCheckoutPaymentSchema
>;
