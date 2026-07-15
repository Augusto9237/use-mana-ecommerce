import { z } from "zod";

export const finishOrderSchema = z.object({
  uberQuoteId: z.string().optional(),
  shippingFeeInCents: z.number().int().nonnegative().optional(),
});

export type FinishOrderSchema = z.infer<typeof finishOrderSchema>;
