import { z } from "zod";

export const finishOrderSchema = z.object({
  shippingFeeInCents: z.number().int().nonnegative().optional(),
});

export type FinishOrderSchema = z.infer<typeof finishOrderSchema>;
