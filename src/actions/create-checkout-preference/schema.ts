import { z } from "zod";

export const createCheckoutPreferenceSchema = z.object({
  orderId: z.string().uuid("Order ID must be a valid UUID"),
});

export type CreateCheckoutPreferenceSchema = z.infer<
  typeof createCheckoutPreferenceSchema
>;